import { Novu } from "@novu/api";
import log from "encore.dev/log";

// Mirrors packages/lib/novu/client.ts's createNovuClient/getNovuClient.
// Tried Encore's own secret() (encore.dev/config) first, but it can only be
// loaded from within a service's own file tree — this module is intentionally
// a plain shared/ module used by several different services (waste,
// partnership, manual-scale-request, jobs, scheduled-event-dispatcher), not
// itself a service, so secret() rejects it at build time ("secrets must be
// loaded from within services"). Falls back to the same raw process.env read
// the original itself uses (NOVU_SECRET_KEY), set via each environment's
// .env file per this repo's existing convention (see Makefile's
// env-dev/env-staging/env-prod targets).
let cachedClient: Novu | undefined;
let warnedMissingKey = false;

export function getNovuClient(): Novu | undefined {
  if (cachedClient) {
    return cachedClient;
  }

  const key = process.env.NOVU_SECRET_KEY;
  if (!key) {
    if (!warnedMissingKey) {
      log.error("NovuSecretKey not set — Novu notifications will be skipped until it is");
      warnedMissingKey = true;
    }
    return undefined;
  }

  const serverURL = process.env.NOVU_API_URL;
  cachedClient = new Novu({ secretKey: key, ...(serverURL ? { serverURL } : {}) });
  return cachedClient;
}
