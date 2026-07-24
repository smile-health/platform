import { fetchScheduledDataEmpty } from '../jobs/fetchScheduledDataEmpty';

export function start12HIntervalScheduler() {
    console.log('Starting 12 Hour interval scheduler...');

    setInterval(
        async () => {
            console.log('Scheduling fetchScheduledEvents job...');
            await fetchScheduledDataEmpty();
        },
        Number(process.env.REDIS_SCHEDULED_EVENTS_LOCK_KEY_TTL) *
            Number(process.env.REDIS_SCHEDULED_EVENTS_LOCK_RETRY_INTERVAL_12H),
    ); // Run every 12 hour
    console.log('12 Hour interval scheduler started.');
}
