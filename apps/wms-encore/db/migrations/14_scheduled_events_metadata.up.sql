-- Restores the fields ProcessScheduledEventUseCase's original ScheduledEvent
-- entity actually needs to do real work: metadata (treatment start/end times,
-- user/entity for notifications, disposal-method data — JSON, mirrors the
-- original's `metadata: string` column, parsed with JSON.parse there), a real
-- retry/failure story (status + retry_left, mirrors the original's
-- 'PENDING'|'IN_PROGRESS'|'FAILED' + retryLeft), and created_by (who/what
-- started the underlying operation, for notifications and audit).
ALTER TABLE scheduled_events ADD COLUMN metadata JSONB;
ALTER TABLE scheduled_events ADD COLUMN created_by TEXT NOT NULL DEFAULT '';
ALTER TABLE scheduled_events ADD COLUMN status TEXT NOT NULL DEFAULT 'PENDING'
  CHECK (status IN ('PENDING', 'IN_PROGRESS', 'FAILED'));
ALTER TABLE scheduled_events ADD COLUMN retry_left INTEGER NOT NULL DEFAULT 3;
