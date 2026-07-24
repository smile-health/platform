export interface logMessage {
    level: 'INFO' | 'ERROR';
    error?: string;
    event: string;
    message: string;
    timestamp: string;
    metadata: Record<string, unknown> | undefined;
}
