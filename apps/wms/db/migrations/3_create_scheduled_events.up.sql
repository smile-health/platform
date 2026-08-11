-- subject_id (not waste_bag_id): scheduled_events is shared across waste-bag,
-- manual-scale-request, and partnership follow-ups — generic id, not just waste
-- bags. previous_status/new_status promoted to real columns (not encoded into
-- event_type as a string) so processScheduledEvent can re-publish an accurate
-- payload onto the right topic without parsing anything.
CREATE TABLE scheduled_events (
    id SERIAL PRIMARY KEY,
    subject_id INTEGER NOT NULL,
    event_type TEXT NOT NULL,
    previous_status TEXT NOT NULL,
    new_status TEXT NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
