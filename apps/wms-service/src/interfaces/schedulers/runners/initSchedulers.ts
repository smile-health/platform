import { start12HIntervalScheduler } from './12HInterval';
import { startMinuteIntervalScheduler } from './minuteInterval';

export function initSchedulers() {
    console.log('Initializing schedulers...');
    startMinuteIntervalScheduler();
    // start12HIntervalScheduler();
    console.log('Schedulers initialized.');
}
