// Scaffolding only — empty implementation.
// TODO: wrap @smile-health/lib's rabbitmq/Consumer to listen on whichever
// legacy queues apps/interop-service or apps/sync-service still publish to
// (e.g. sync-service's SMILE 3.0 -> 5.0 migration events), and republish as
// an Encore Topic (see shared/export/export.topics.ts for the pattern) so
// the rest of backend/api only ever deals with typed Encore topics.
//
// import { Consumer } from "@smile-health/lib/rabbitmq";

export async function startLegacyConsumers(): Promise<void> {
  // TODO: real wiring.
}
