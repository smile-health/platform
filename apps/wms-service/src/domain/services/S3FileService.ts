import { UploadFile } from '../../infrastructure/database/repositories/S3FileServiceRepositoryImpl';

export default interface S3FileServiceRepository {
    getPresignedUrl(documentPath: string): Promise<string>;
    uploadImage(
        file: UploadFile,
        keyId: string,
        hfId: string,
        folder?: string,
        previousDocumentPath?: string,
    ): Promise<{ doc_number: string; document_path: string }>;
}
