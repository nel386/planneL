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

export const saveImageToApp = async (uri: string) => {
  await ensureReceiptsDir();
  const ext = getUriExtension(uri);
  const filename = `receipt-${Date.now()}.${ext}`;
  const dest = `${RECEIPTS_DIR}/${filename}`;
  await FileSystem.copyAsync({ from: uri, to: dest });
  return dest;
};
