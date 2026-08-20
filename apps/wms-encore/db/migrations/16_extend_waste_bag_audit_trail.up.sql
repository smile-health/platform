-- Extends waste_bag_audit_trail with the fields the legacy wms-service
-- WasteBagAuditTrailModel/WasteBagAuditTrailRepositoryImpl exposed (event,
-- source, remarks, waste_bag_status, is_group, is_failed, transport_status,
-- healthcare_facility_id, transporter_id, third_party_provider_id,
-- updated_by) that GET /api/v1/audit-trail (waste-bag-audit-trail module)
-- was silently dropping versus the old service, in favor of the new
-- previous_status/new_status pair (kept, not removed).
--
-- None of these are populated by this port's insertAuditTrailEntry() /
-- recordTransition() today -- the pubsub topics this module subscribes to
-- (../messaging/topics.ts) only carry wasteBagId/previousStatus/newStatus,
-- not event/source/remarks/healthcareFacilityId/etc, so every column here
-- is nullable (or defaulted for the booleans) and goes unset on writes made
-- through this module until an upstream publisher starts sending the data.
--
-- waste_bag_status / is_group were already declared (as Generated<>, with a
-- comment admitting no migration backed them) on WasteBagAuditTrailTable in
-- db/db.ts for waste/waste-treatment-external-group's getWasteBagLogHistory
-- port -- this migration makes those two columns real, fixing that module's
-- previously-undefined runtime behavior as a side effect. waste_bag_qr_code
-- (also referenced there) is left untouched; it is unrelated to the 11
-- fields this migration targets.
--
-- Ids (healthcare_facility_id/transporter_id/third_party_provider_id) use
-- INTEGER rather than the old MySQL model's BIGINT, matching every sibling
-- id column on waste_bag (migration 9) in this Postgres schema.
ALTER TABLE waste_bag_audit_trail
    ADD COLUMN event TEXT,
    ADD COLUMN source TEXT,
    ADD COLUMN remarks TEXT,
    ADD COLUMN waste_bag_status TEXT,
    ADD COLUMN is_group BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN is_failed BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN transport_status TEXT,
    ADD COLUMN healthcare_facility_id INTEGER,
    ADD COLUMN transporter_id INTEGER,
    ADD COLUMN third_party_provider_id INTEGER,
    ADD COLUMN updated_by TEXT;
