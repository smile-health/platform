import { Topic } from "encore.dev/pubsub";

// One shared event ANY module can publish to request an async export —
// deliberately generic so scm/materials, scm/order, core/user, etc. can all
// reuse it instead of each module rolling its own export topic.
export interface ExportRequestedEvent {
  requestId: string;
  requestedBy: number;
  /** Which dataset to export — the exporter switches on this, not on who published it. */
  exportType: string;
  filters: Record<string, unknown>;
}

export const exportRequested = new Topic<ExportRequestedEvent>("export-requested", {
  deliveryGuarantee: "at-least-once",
});
