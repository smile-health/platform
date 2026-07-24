import dotenv from "dotenv";

dotenv.config();

export default {
  max_attempt: Number(process.env.RATE_LIMITER_MAX_ATTEMPT ?? 5),
  window: Number(process.env.RATE_LIMITER_WINDOW ?? 5 * 60 * 1000),
  redis_host: process.env.REDIS_HOST ?? "localhost",
  redis_port: Number(process.env.REDIS_PORT ?? 6379),
  redis_password: process.env.REDIS_PASSWORD ?? "",
};
