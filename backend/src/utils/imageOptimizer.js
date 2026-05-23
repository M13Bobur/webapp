import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export const optimizeImage = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();
  const optimizedPath = filePath.replace(ext, `-opt${ext === '.png' ? '.webp' : ext}`);

  try {
    await sharp(filePath)
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(optimizedPath.replace(ext, '.webp'));

    if (fs.existsSync(filePath) && optimizedPath !== filePath) {
      const webpPath = filePath.replace(ext, '.webp');
      if (fs.existsSync(filePath) && ext !== '.webp') fs.unlinkSync(filePath);
      return path.basename(webpPath);
    }
    return path.basename(filePath);
  } catch {
    return path.basename(filePath);
  }
};
