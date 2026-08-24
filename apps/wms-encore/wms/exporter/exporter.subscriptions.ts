import { Subscription } from "encore.dev/pubsub";
import { exportRequested, type ExportRequestedEvent } from "../../shared/export/export.topics";

const onExportRequested = async (event: ExportRequestedEvent) => {
  // TODO: query the DB (or ClickHouse/read replica) directly for
  // event.exportType + event.filters, build the file, notify via
  // notification-dispatch when done. Deliberately NOT calling back into
  // whichever module published this event.
  void event;
};

new Subscription(exportRequested, "exporter-handle-export-requested", {
  handler: onExportRequested,
});
