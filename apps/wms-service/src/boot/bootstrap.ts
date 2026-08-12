import { authenticateDatabase } from '../infrastructure/database/db.connection';
import { verifyS3Connection } from '../infrastructure/fileStorage/s3Client';
import { connectRabbitMQ } from '../infrastructure/queue/rabbitmq/rabbitmq';
import { initSchedulers } from '../interfaces/schedulers/runners/initSchedulers';

// It is used for running operations before we start the application.
export async function bootstrap() {
    const results = {
        database: false,
        s3: false,
        rabbitMQ: false,
        schedulers: false,
    };
    try {
        console.log('[BOOTSTRAP] Starting bootstrap process...');

        await authenticateDatabase();
        results.database = true;
        console.log('[BOOTSTRAP] Database connected successfully');

        await connectRabbitMQ();
        results.rabbitMQ = true;
        console.log('[BOOTSTRAP] RabbitMQ connected successfully');

        initSchedulers();
        results.schedulers = true;
        console.log('[BOOTSTRAP] Schedulers initialized successfully');
        console.log('[BOOTSTRAP] Application bootstrapped successfully');

        await verifyS3Connection();
        results.s3 = true;
        console.log('[BOOTSTRAP] S3 connection verified successfully');

        return {
            status: 'success',
            message: 'Bootstrap completed successfully',
            timestamp: new Date().toISOString(),
        };
    } catch (error) {
        console.error('[BOOTSTRAP] Error during bootstrap:', error);

        return {
            status: 'partial',
            message: `Bootstrap completed with errors: ${error}`,
            timestamp: new Date().toISOString(),
            details: results,
        };
    }
}
