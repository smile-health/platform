import { rateLimiter, RedisStore } from "hono-rate-limiter";
import { Redis } from "ioredis";
import config from "../config/rateLimiterConfig";

const redisClient = new Redis({
  maxRetriesPerRequest: undefined,
  host: config.redis_host,
  port: config.redis_port,
  password: config.redis_password,
  lazyConnect: true,
});

const store = new RedisStore({
  // wrap ioredis to match the RedisClient interface
  client: {
    scriptLoad: (script: string) =>
      redisClient.script("LOAD", script) as Promise<string>,
    evalsha: (sha: string, keys: string[], args: string[]) =>
      redisClient.evalsha(sha, keys.length, ...keys, ...args),
    decr: (key: string) => redisClient.decr(key),
    del: (key: string) => redisClient.del(key),
  },
});

export const loginRateLimiter = rateLimiter({
  limit: config.max_attempt,
  message: { message: "Too many requests, please try again after some time" },
  windowMs: config.window,
  keyGenerator: (c) => c.req.header("x-forwarded-for") ?? "", // Use IP address as key
  skipSuccessfulRequests: true,
  store: store,
});
