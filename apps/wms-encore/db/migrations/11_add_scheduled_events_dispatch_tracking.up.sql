-- Closes a real bug: checkAndDispatchDueEvents had no way to tell "already
-- published to scheduled-event-processed" apart from "still due", so every
-- 1-minute cron tick kept re-publishing every past-due row forever. Once a
-- row is dispatched it's excluded from the due-query; the dispatcher deletes
-- the row outright once it finishes handling it (mirrors the original
-- ProcessScheduledEventUseCase's `scheduledEventRepository.removeEvent`).
ALTER TABLE scheduled_events ADD COLUMN dispatched_at TIMESTAMPTZ;
