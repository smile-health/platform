import { fetchScheduledEvents } from '../jobs/fetchScheduledEvents';

export function startMinuteIntervalScheduler() {
    console.log('Starting minute interval scheduler...');
    setInterval(
        async () => {
            console.log('Scheduling fetchScheduledEvents job...');
            await fetchScheduledEvents();
        },
        Number(process.env.REDIS_SCHEDULED_EVENTS_LOCK_KEY_TTL) *
            Number(process.env.REDIS_SCHEDULED_EVENTS_LOCK_RETRY_INTERVAL),
    ); // Run every minute
    console.log('Minute interval scheduler started.');
}
