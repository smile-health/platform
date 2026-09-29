import dotenv from "dotenv";

dotenv.config();

export default {
  protocol: process.env.RABBITMQ_PROTOCOL ?? "amqp",
  host: process.env.RABBITMQ_HOST ?? "localhost",
  port: Number(process.env.RABBITMQ_PORT ?? 5672),
  username: process.env.RABBITMQ_USERNAME ?? "guest",
  password: process.env.RABBITMQ_PASSWORD ?? "guest",
  vhost: process.env.RABBITMQ_VHOST ?? "/",
};
