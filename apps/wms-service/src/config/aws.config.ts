export default {
    AWS_REGION: process.env.AWS_REGION,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    S3_BUCKET: process.env.S3_BUCKET,
    // MinIO-compatible endpoint. Falls back to AWS public if not set.
    ENDPOINT: process.env.AWS_ENDPOINT
        ? process.env.AWS_ENDPOINT
        : process.env.MINIO_ENDPOINT
          ? `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT || 9000}`
          : undefined,
};
