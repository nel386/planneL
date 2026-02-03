import * as FileSystem from 'expo-file-system/legacy';

const RECEIPTS_DIR = `${FileSystem.documentDirectory}receipts`;

export const ensureReceiptsDir = async () => {
  if (!FileSystem.documentDirectory) return;
  try {
    await FileSystem.makeDirectoryAsync(RECEIPTS_DIR, { intermediates: true });
  } catch {
    // ignore if exists
  }
};

export const getUriExtension = (uri: string) => {
  const parts = uri.split('.');
  if (parts.length > 1) {
    return parts[parts.length - 1].split('?')[0];
  }
  return 'jpg';
};

export const getFileName = (uri: string) => {
  const cleaned = uri.split('?')[0];
  const parts = cleaned.split('/');
  const name = parts[parts.length - 1];
  if (name && name.includes('.')) {
    return name;
  }
  const ext = getUriExtension(uri);
  return `receipt-${Date.now()}.${ext}`;
};

export const getMimeType = (uri: string) => {
  const ext = getUriExtension(uri).toLowerCase();
  const map: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    heic: 'image/heic',
    heif: 'image/heif',
    webp: 'image/webp',
  };
  return map[ext] ?? 'application/octet-stream';
};

export const saveImageToApp = async (uri: string) => {
  await ensureReceiptsDir();
  const ext = getUriExtension(uri);
  const filename = `receipt-${Date.now()}.${ext}`;
  const dest = `${RECEIPTS_DIR}/${filename}`;
  await FileSystem.copyAsync({ from: uri, to: dest });
  return dest;
};
