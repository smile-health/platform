import { CacheCluster } from "encore.dev/storage/cache";

// DEBUG: verify env injection at runtime (remove after confirming)
console.log("[wms-encore:env-debug] DB_PASSWORD set:", !!process.env.DB_PASSWORD, "len:", (process.env.DB_PASSWORD || "").length);
console.log("[wms-encore:env-debug] REDIS_PASSWORD set:", !!process.env.REDIS_PASSWORD, "len:", (process.env.REDIS_PASSWORD || "").length);
console.log("[wms-encore:env-debug] CORE_API_URL:", process.env.CORE_API_URL);

export const cacheCluster = new CacheCluster("wms-cache", {
  evictionPolicy: "allkeys-lru",
});
