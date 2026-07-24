export interface ManualScaleRequestService {
    logInfo(message: string, event: string, metadata?: Record<string, unknown>): void;
    logError(error: Error, event: string, metadata?: Record<string, unknown>): void;
}
