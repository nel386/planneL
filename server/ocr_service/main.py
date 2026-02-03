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


def _run_ocr(image: np.ndarray, lang: str) -> Tuple[List[str], float]:
    ocr = _load_ocr(lang)
    result = ocr.ocr(image, cls=True)
    lines: List[str] = []
    scores: List[float] = []

    if not result or not result[0]:
        return [], 0.0

    for entry in result[0]:
        text = entry[1][0]
        score = float(entry[1][1])
        lines.append(text)
        scores.append(score)

    confidence = float(np.mean(scores)) if scores else 0.0
    return lines, confidence


def _auto_lang_ocr(image: np.ndarray) -> Tuple[List[str], float, str]:
    lines_es, conf_es = _run_ocr(image, 'es')
    lines_en, conf_en = _run_ocr(image, 'en')
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
        lines, confidence = _run_ocr(decoded, OCR_LANG)
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