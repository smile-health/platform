import path from 'path';
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import S3FileServiceRepository from '../../../domain/services/S3FileService';
import awsConfig from '../../../config/aws.config';
import client from '../../../infrastructure/fileStorage/s3Client';

export interface UploadFile {
    originalname: string;
    buffer: Buffer;
    mimetype: string;
}

export default class S3FileServiceRepositoryImpl implements S3FileServiceRepository {
    async getPresignedUrl(documentPath: string): Promise<string> {
        const getObjectCommand = new GetObjectCommand({
            Bucket: awsConfig.S3_BUCKET,
            Key: documentPath,
        });

        // Generate a pre-signed URL that expires in 1 hour (3600 seconds)
        const presignedUrl = await getSignedUrl(client, getObjectCommand, {
            expiresIn: 3600,
        });

        return presignedUrl;
    }

    async uploadImage(
        file: UploadFile,
        keyId: string,
        hfId: string,
        folder?: string,
        previousDocumentPath?: string,
    ): Promise<{ doc_number: string; document_path: string }> {
        try {
            if (previousDocumentPath) {
                try {
                    const deleteCommand = new DeleteObjectCommand({
                        Bucket: awsConfig.S3_BUCKET,
                        Key: previousDocumentPath,
                    });
                    await client.send(deleteCommand);
                    console.log(`[S3] Successfully deleted old file: ${previousDocumentPath}`);
                } catch (deleteError) {
                    // Log the error but do not rethrow, as a failed deletion should not prevent a new upload.
                    console.error(
                        `[S3] Failed to delete old file: ${previousDocumentPath}`,
                        deleteError,
                    );
                }
            }

            // 2. Extract the file extension
            const fileExtension = path.extname(file.originalname);

            // 3. Create a unique file name using the keyId and timestamp
            const fileName = `${keyId}-${hfId}${fileExtension}`;

            // 4. Define the S3 key (document path)
            const documentPath = `${folder ?? 'main'}/${fileName}`;

            // 5. Create the S3 PutObjectCommand to upload the file
            const uploadCommand = new PutObjectCommand({
                Bucket: awsConfig.S3_BUCKET,
                Key: documentPath,
                Body: file.buffer,
                ContentType: file.mimetype,
            });

            // 6. Send the command to S3 to perform the upload
            await client.send(uploadCommand);
            console.log(`[S3] File uploaded successfully to: ${documentPath}`);

            return {
                doc_number: keyId,
                document_path: documentPath,
            };
        } catch (error) {
            console.error('[S3] File upload failed:', error);
            throw new Error('Failed to upload file to S3');
        }
    }
}
