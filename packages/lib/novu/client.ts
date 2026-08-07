import { Novu } from "@novu/api";
import { logger } from "../logger.js";

export interface NovuConfig {
  secretKey: string;
}

let cachedClient: Novu | undefined;

export function createNovuClient(config: NovuConfig): Novu | undefined {
  if (!config.secretKey) {
    logger.error("[NOVU] Missing secretKey - failed initialization");
    return undefined;
  }

  return new Novu({ secretKey: config.secretKey });
}

export function createNovuClientFromEnv(): Novu | undefined {
  const secretKey = process.env.NOVU_SECRET_KEY;

  if (!secretKey) {
    logger.error(
      "[NOVU] NOVU_SECRET_KEY not set - failed initialization"
    );
    return undefined;
  }

  return createNovuClient({ secretKey });
}

export function getNovuClient(): Novu | undefined {
  if (cachedClient) {
    return cachedClient;
  }

  cachedClient = createNovuClientFromEnv();
  return cachedClient;
}
