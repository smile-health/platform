import { Service } from "encore.dev/service";
import { errorEnvelope } from "../../shared/http/envelope";

// Scaffolding only. Subscribes to shared/export/export.topics.ts's
// exportRequested event, published by any number of modules. Queries the DB
// DIRECTLY here rather than making RPC calls back into materials/order/etc
// — avoids turning a hot, latency-sensitive service into the bottleneck for
// bulk export reads (see prior discussion: route bulk reads through
// ClickHouse / a read replica where possible, not through a live service's
// RPC path).
export default new Service("exporter", {
  middlewares: [errorEnvelope],
});
