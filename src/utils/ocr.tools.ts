import { OCR_BASE_URL } from './config';
import { getFileName, getMimeType } from './media.tools';
import { OcrResponse } from './ocr.types';

const OCR_TIMEOUT_MS = 20000;

export const uploadReceipt = async (uri: string): Promise<OcrResponse> => {
  const form = new FormData();
  const filename = getFileName(uri);
  const type = getMimeType(uri);
  form.append('image', {
    uri,
    name: filename,
    type,
  } as any);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OCR_TIMEOUT_MS);
  try {
    const response = await fetch(`${OCR_BASE_URL}/ocr/receipt`, {
      method: 'POST',
      body: form,
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'OCR failed');
    }

    return response.json();
  } catch (error) {
    const err = error as { name?: string; message?: string };
    if (err?.name === 'AbortError') {
      throw new Error('OCR timeout. Intenta de nuevo con una conexion mas estable.');
    }
    throw new Error(err?.message || `No se pudo conectar con el OCR (${OCR_BASE_URL}).`);
  } finally {
    clearTimeout(timeout);
  }
};
