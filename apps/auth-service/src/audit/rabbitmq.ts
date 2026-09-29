import amqp from "amqplib";
import { logger } from "@smile-health/lib/logger";
import rabbitmqConfig from "../config/rabbitmqConfig";

let connection: amqp.ChannelModel | undefined;
let connecting: Promise<amqp.ChannelModel> | undefined;

// Lazy, shared connection used only for publishing audit-log messages.
// Nothing connects at startup, so auth-service still boots without RabbitMQ.
export async function getConnection(): Promise<amqp.ChannelModel> {
  if (connection) return connection;
  if (connecting) return connecting;

  connecting = amqp
    .connect({
      protocol: rabbitmqConfig.protocol,
      hostname: rabbitmqConfig.host,
      port: rabbitmqConfig.port,
      username: rabbitmqConfig.username,
      password: rabbitmqConfig.password,
      vhost: rabbitmqConfig.vhost,
      heartbeat: 60,
    })
    .then((conn) => {
      connection = conn;
      conn.on("error", (err) => {
        logger.error(`auth-service RabbitMQ connection error: ${err}`);
        connection = undefined;
      });
      conn.on("close", () => {
        connection = undefined;
      });
      return conn;
    })
    .finally(() => {
      connecting = undefined;
    });

  return connecting;
}
