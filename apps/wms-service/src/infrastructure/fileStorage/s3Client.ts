import { S3Client, S3ClientConfig, HeadBucketCommand } from '@aws-sdk/client-s3';
import awsConfig from '../../config/aws.config';

const s3ClientConfig: S3ClientConfig = {
    region: awsConfig.AWS_REGION,
    credentials: {
        accessKeyId: awsConfig.AWS_ACCESS_KEY_ID!,
        secretAccessKey: awsConfig.AWS_SECRET_ACCESS_KEY!,
    },
    ...(awsConfig.ENDPOINT ? { endpoint: awsConfig.ENDPOINT, forcePathStyle: true } : {}),
};

const client = new S3Client(s3ClientConfig);

export default client;

export async function verifyS3Connection() {
    try {
        await client.send(new HeadBucketCommand({ Bucket: awsConfig.S3_BUCKET })); // lightweight, read-only
        console.log('[S3] Connection listed buckets successfully.');
    } catch (error) {
        console.error('[S3] Connection failed:', error);
        throw new Error('Failed to connect to S3');
    }
}
