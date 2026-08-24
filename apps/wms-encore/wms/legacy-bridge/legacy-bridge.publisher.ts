// Scaffolding only — empty implementation.
// TODO: wrap @smile-health/lib's rabbitmq/Publisher for the reverse
// direction — an Encore Subscription in here that re-publishes onto a
// legacy RabbitMQ topic/queue for apps that haven't migrated yet.
//
// import { Publisher } from "@smile-health/lib/rabbitmq";

export async function publishToLegacyQueue(_queue: string, _payload: unknown): Promise<void> {
  // TODO: real wiring.
}
