import { CacheCluster } from "encore.dev/storage/cache";

export const cacheCluster = new CacheCluster("wms-cache", {
  evictionPolicy: "allkeys-lru",
});
