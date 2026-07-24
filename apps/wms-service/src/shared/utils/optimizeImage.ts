import sharp from "sharp";

/**
 * Optimizes an image buffer efficiently without noticeable quality loss.
 * - Converts to WebP (lossy ~quality 85)
 * - Removes EXIF metadata
 * - Resizes large images (> 2500px width)
 */
export async function optimizeImage(buffer: Buffer): Promise<Buffer> {
  const metadata = await sharp(buffer).metadata();

  // Resize only if image is too large (e.g., from a smartphone camera)
  const resizeOptions =
    metadata.width && metadata.width > 3500
        ? { width: 3500, withoutEnlargement: true }
        : undefined;

  const optimizedBuffer = await sharp(buffer)
    .rotate() // fix EXIF orientation
    .resize(resizeOptions)
    .toFormat("webp", {
      quality: 85,          // efficient lossy compression
      effort: 6,            // balance between speed & compression ratio
      smartSubsample: true, // better color accuracy for photos
    })
    .toBuffer();

  return optimizedBuffer;
}
