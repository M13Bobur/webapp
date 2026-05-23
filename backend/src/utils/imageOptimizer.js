import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export const optimizeImage = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const webpPath = filePath.replace(ext, '.webp');

  try {
    await sharp(filePath)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(webpPath);

    if (fs.existsSync(filePath) && filePath !== webpPath) {
      fs.unlinkSync(filePath);
    }
    return path.basename(webpPath);
  } catch {
    return path.basename(filePath);
  }
};
