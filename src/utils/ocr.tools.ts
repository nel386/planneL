import { OCR_BASE_URL } from './config';
import { OcrResponse } from './ocr.types';

export const uploadReceipt = async (uri: string): Promise<OcrResponse> => {
  const form = new FormData();
  form.append('image', {
    uri,
    name: 'ticket.jpg',
    type: 'image/jpeg',
  } as any);

  const response = await fetch(`${OCR_BASE_URL}/ocr/receipt`, {
    method: 'POST',
    body: form,
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'OCR failed');
  }

  return response.json();
};
