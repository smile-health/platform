export interface WasteStatusUpdateService {
    logInfo(message: string, event: string, metadata?: Record<string, unknown>): void;
    logInfoAsync(message: string, event: string, metadata?: Record<string, unknown>): Promise<void>
    logError(error: Error, event: string, metadata?: Record<string, unknown>): void;
}
