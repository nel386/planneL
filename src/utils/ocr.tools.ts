import { Platform } from 'react-native';
import { OCR_BASE_URL } from './config';
import { getFileName, getMimeType } from './media.tools';
import { OcrResponse } from './ocr.types';

const OCR_TIMEOUT_MS = 20000;
const OCR_MAX_RETRIES = 1;

const normalizeBaseUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  const withScheme = trimmed.startsWith('http') ? trimmed : `http://${trimmed}`;
  return withScheme.replace(/\/+$/, '');
};

const resolveOcrBaseUrl = (value: string) => {
  const normalized = normalizeBaseUrl(value);
  if (!normalized) return normalized;
  if (Platform.OS !== 'android') return normalized;
  if (normalized.includes('localhost')) return normalized.replace('localhost', '10.0.2.2');
  if (normalized.includes('127.0.0.1')) return normalized.replace('127.0.0.1', '10.0.2.2');
  return normalized;
};

const isRetryableError = (error: unknown) => {
  const err = error as { name?: string; message?: string };
  return err?.name === 'AbortError' || err?.message?.includes('Network request failed');
};

export const uploadReceipt = async (uri: string): Promise<OcrResponse> => {
  const baseUrl = resolveOcrBaseUrl(OCR_BASE_URL);
  if (!baseUrl) {
    throw new Error('OCR no configurado. Define EXPO_PUBLIC_OCR_URL.');
  }
  const form = new FormData();
  const filename = getFileName(uri);
  const type = getMimeType(uri);
  form.append('image', {
    uri,
    name: filename,
    type,
  } as any);

  for (let attempt = 0; attempt <= OCR_MAX_RETRIES; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), OCR_TIMEOUT_MS);
    try {
      const response = await fetch(`${baseUrl}/ocr/receipt`, {
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
      if (attempt < OCR_MAX_RETRIES && isRetryableError(error)) {
        continue;
      }
      if (err?.name === 'AbortError') {
        throw new Error('OCR timeout. Intenta de nuevo con una conexion mas estable.');
      }
      const hint =
        Platform.OS === 'android' && OCR_BASE_URL.includes('localhost')
          ? 'Si usas emulador Android, utiliza 10.0.2.2.'
          : undefined;
      const details = [err?.message, hint].filter(Boolean).join(' ');
      throw new Error(details || `No se pudo conectar con el OCR (${baseUrl}).`);
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error('OCR fallo inesperado.');
};
