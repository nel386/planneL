import io
import os
from typing import List, Tuple

import cv2
import numpy as np
from fastapi import FastAPI, File, UploadFile, HTTPException
from paddleocr import PaddleOCR
from pydantic import BaseModel

from parser import extract_receipt_fields

app = FastAPI(title='planneL OCR Service', version='0.1.0')

OCR_LANG = os.getenv('OCR_LANG', 'auto')
OCR_USE_ANGLE = os.getenv('OCR_USE_ANGLE', 'true').lower() == 'true'
OCR_PREPROCESS = os.getenv('OCR_PREPROCESS', 'true').lower() == 'true'
OCR_MIN_CONF = float(os.getenv('OCR_MIN_CONF', '0.45'))
OCR_MAX_SIDE = int(os.getenv('OCR_MAX_SIDE', '1600'))
OCR_UPSCALE_MIN = int(os.getenv('OCR_UPSCALE_MIN', '900'))

ocr_cache = {}


class OCRResponse(BaseModel):
    merchant: str | None
    date: str | None
    total: float | None
    items: list
    raw_text: list
    confidence: float
    language: str


def _load_ocr(lang: str) -> PaddleOCR:
    if lang not in ocr_cache:
        ocr_cache[lang] = PaddleOCR(use_angle_cls=OCR_USE_ANGLE, lang=lang, show_log=False)
    return ocr_cache[lang]


def _decode_image(data: bytes) -> np.ndarray:
    image_array = np.frombuffer(data, np.uint8)
    image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError('Invalid image')
    return image


def _sort_entries(entries: list) -> list:
    def _pos(entry: list) -> Tuple[float, float]:
        points = entry[0]
        xs = [pt[0] for pt in points]
        ys = [pt[1] for pt in points]
        return float(min(ys)), float(min(xs))

    return sorted(entries, key=_pos)


def _resize_image(image: np.ndarray) -> np.ndarray:
    height, width = image.shape[:2]
    max_side = max(height, width)
    min_side = min(height, width)
    if max_side > OCR_MAX_SIDE:
        scale = OCR_MAX_SIDE / max_side
    elif min_side < OCR_UPSCALE_MIN:
        scale = OCR_UPSCALE_MIN / min_side
    else:
        return image
    return cv2.resize(image, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)


def _preprocess_image(image: np.ndarray) -> np.ndarray:
    resized = _resize_image(image)
    gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)
    denoised = cv2.bilateralFilter(gray, 9, 75, 75)
    thresh = cv2.adaptiveThreshold(
        denoised,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        31,
        11,
    )
    return cv2.cvtColor(thresh, cv2.COLOR_GRAY2BGR)


def _run_ocr(image: np.ndarray, lang: str) -> Tuple[List[str], float]:
    ocr = _load_ocr(lang)
    result = ocr.ocr(image, cls=True)
    lines: List[str] = []
    scores: List[float] = []

    if not result or not result[0]:
        return [], 0.0

    entries = _sort_entries(result[0])
    for entry in entries:
        text = entry[1][0]
        score = float(entry[1][1])
        if score >= OCR_MIN_CONF:
            lines.append(text)
            scores.append(score)

    if not lines:
        for entry in entries:
            text = entry[1][0]
            score = float(entry[1][1])
            lines.append(text)
            scores.append(score)

    confidence = float(np.mean(scores)) if scores else 0.0
    return lines, confidence


def _best_pass(image: np.ndarray, lang: str) -> Tuple[List[str], float]:
    if not OCR_PREPROCESS:
        return _run_ocr(image, lang)
    original_lines, original_conf = _run_ocr(image, lang)
    processed = _preprocess_image(image)
    processed_lines, processed_conf = _run_ocr(processed, lang)
    if processed_conf >= original_conf and len(processed_lines) >= len(original_lines):
        return processed_lines, processed_conf
    return original_lines, original_conf


def _auto_lang_ocr(image: np.ndarray) -> Tuple[List[str], float, str]:
    lines_es, conf_es = _best_pass(image, 'es')
    lines_en, conf_en = _best_pass(image, 'en')
    if conf_es >= conf_en:
        return lines_es, conf_es, 'es'
    return lines_en, conf_en, 'en'


@app.post('/ocr/receipt', response_model=OCRResponse)
async def ocr_receipt(image: UploadFile = File(...)):
    if not image.content_type or not image.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail='File must be an image')

    data = await image.read()
    try:
        decoded = _decode_image(data)
    except ValueError:
        raise HTTPException(status_code=400, detail='Invalid image data')

    if OCR_LANG == 'auto':
        lines, confidence, language = _auto_lang_ocr(decoded)
    else:
        lines, confidence = _best_pass(decoded, OCR_LANG)
        language = OCR_LANG

    parsed = extract_receipt_fields(lines)

    return {
        **parsed,
        'confidence': confidence,
        'language': language,
    }


@app.get('/health')
def health():
    return {'status': 'ok'}
