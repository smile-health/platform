// Mirrors apps/wms-service's infrastructure/fileStorage/s3Client.ts +
// infrastructure/database/repositories/S3FileServiceRepositoryImpl.ts.
//
// Several waste/* modules have documented TODOs for two pieces of the
// original's file handling: resolving a stored manifestDocPath into a
// presigned (time-limited) URL for read access, and uploading a new
// manifest doc image. This module ports both, following the same
// graceful-when-unconfigured convention as
// shared/notifications/novu-client.ts (env-var based, returns undefined/null
// rather than throwing when S3 isn't configured for the current
// environment, so local/test runs without S3 credentials don't crash).
import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import log from "encore.dev/log";

let cachedClient: S3Client | undefined;
let warnedMissingConfig = false;

function getBucket(): string | undefined {
  return process.env.S3_BUCKET;
}

function getClient(): S3Client | undefined {
  if (cachedClient) {
    return cachedClient;
  }

  const region = process.env.AWS_REGION;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const bucket = getBucket();

  if (!region || !accessKeyId || !secretAccessKey || !bucket) {
    if (!warnedMissingConfig) {
      log.error(
        "S3 storage isn't configured (AWS_REGION/AWS_ACCESS_KEY_ID/AWS_SECRET_ACCESS_KEY/S3_BUCKET) — file operations will be skipped until it is",
      );
      warnedMissingConfig = true;
    }
    return undefined;
  }

  cachedClient = new S3Client({ region, credentials: { accessKeyId, secretAccessKey } });
  return cachedClient;
}

// Mirrors S3FileServiceRepositoryImpl.getPresignedUrl exactly: a read-only
// GetObjectCommand, presigned for 1 hour. Returns undefined (rather than
// throwing) when S3 isn't configured or the presign call fails — callers
// should fall back to the raw stored path, same as this port's existing
// "not wired yet" behavior, just now succeeding when S3 IS configured.
export async function getPresignedUrl(documentPath: string | null | undefined): Promise<string | undefined> {
  if (!documentPath) return undefined;
  const client = getClient();
  const bucket = getBucket();
  if (!client || !bucket) return undefined;

  try {
    const command = new GetObjectCommand({ Bucket: bucket, Key: documentPath });
    return await getSignedUrl(client, command, { expiresIn: 3600 });
  } catch (error) {
    log.error("failed to generate S3 presigned URL", {
      documentPath,
      error: error instanceof Error ? error.message : String(error),
    });
    return undefined;
  }
}

export interface UploadFileInput {
  originalname: string;
  buffer: Uint8Array;
  mimetype: string;
}

// Mirrors S3FileServiceRepositoryImpl.uploadImage: best-effort delete of the
// previous document (failure logged, not thrown — a failed delete shouldn't
// block a new upload), then a PutObjectCommand keyed by
// `${folder ?? "main"}/${keyId}-${hfId}${ext}`. Throws only when S3 isn't
// configured at all or the actual PutObjectCommand fails — matching the
// original's throw-on-upload-failure behavior (the delete step is the only
// swallowed-error branch).
export async function uploadFile(
  file: UploadFileInput,
  keyId: string,
  hfId: string,
  folder?: string,
  previousDocumentPath?: string,
): Promise<{ docNumber: string; documentPath: string }> {
  const client = getClient();
  const bucket = getBucket();
  if (!client || !bucket) {
    throw new Error("S3 storage isn't configured");
  }

  if (previousDocumentPath) {
    try {
      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: previousDocumentPath }));
    } catch (error) {
      log.error("failed to delete previous S3 file", {
        previousDocumentPath,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const extension = file.originalname.includes(".")
    ? file.originalname.slice(file.originalname.lastIndexOf("."))
    : "";
  const fileName = `${keyId}-${hfId}${extension}`;
  const documentPath = `${folder ?? "main"}/${fileName}`;

  await client.send(
    new PutObjectCommand({ Bucket: bucket, Key: documentPath, Body: file.buffer, ContentType: file.mimetype }),
  );

  return { docNumber: keyId, documentPath };
}
