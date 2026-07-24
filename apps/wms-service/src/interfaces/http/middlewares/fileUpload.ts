import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';

import s3Client from '../../../infrastructure/fileStorage/s3Client';
import awsConfig from '../../../config/aws.config';
import { optimizeImage } from '../../../shared/utils/optimizeImage';

export const manifestUpload = multer({
    storage: multerS3({
        s3: s3Client,
        bucket: awsConfig.S3_BUCKET!,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: (req, file, cb) => {
            const fileName = `${Date.now().toString()}-${file.originalname}`;
            cb(null, `manifests/${fileName}`);
        },
    }),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB limit
    },
});

export const manifestInMemory = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 20 * 1024 * 1024, // 5 MB limit
    },
});

export async function compressManifestImage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.file) return next();

    const originalSizeMB = req.file.size / (1024 * 1024);
    console.log(`[ImageUpload] Original size: ${originalSizeMB.toFixed(2)} MB`);

    // Optimize/compress image
    const optimizedBuffer = await optimizeImage(req.file.buffer);

    const optimizedSizeMB = optimizedBuffer.length / (1024 * 1024);
    console.log(`[ImageUpload] Optimized size: ${optimizedSizeMB.toFixed(2)} MB`);

    // Replace original file buffer
    req.file.buffer = optimizedBuffer;
    req.file.size = optimizedBuffer.length;
    req.file.mimetype = "image/webp";
    req.file.originalname = req.file.originalname.replace(/\.[^.]+$/, ".webp");

    // Reject if still larger than 5MB
    if (req.file.size > 5 * 1024 * 1024) {
      res.status(400).json({
        message: "Image too large even after optimization (max 5MB).",
      });
      return;
    }

    next();
  } catch (err) {
    console.error("[ImageUpload] Compression failed:", err);
    res.status(500).json({ message: "Failed to process image upload." });
    return;
  }
}
