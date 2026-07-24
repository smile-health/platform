// RabbitMQ Module Exports

export {
  createRabbitMQConnection,
  createChannel,
  closeRabbitMQConnection,
  declareExchange,
  declareQueue,
  bindQueue,
  setQoS,
} from "./connection";

export { EventConsumer, createEventConsumer } from "./consumer";

export type { RabbitMQConnectOptions } from "./connection";
export type { MessageHandler, ConsumerConfig } from "./consumer";
