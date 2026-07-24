import InfraRegistry from '../infrastructure/database/repositories/infraRegistry';

export async function boot() {
    console.log('[BOOT] Initializing services...');

    await InfraRegistry.load();
    console.log('[BOOT] Infrastructure registry services initialized successfully.');

    console.log('[BOOT] All services loaded');

    // Return status boot
    return {
        status: 'success',
        message: 'Boot completed successfully',
        timestamp: new Date().toISOString(),
    };
}
