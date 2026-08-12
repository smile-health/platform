import { getNovuClient } from "./client.js";
import workflows from "./workflows.json" with { type: "json" };

async function importWorkflows() {
  const novu = getNovuClient();

  if (!novu) {
    console.error("NOVU_SECRET_KEY not set - aborting import");
    process.exit(1);
  }

  for (const workflow of workflows) {
    try {
      await novu.workflows.create(workflow as any);
      console.log(`Imported workflow: ${workflow.workflowId}`);
    } catch (error) {
      console.error(`Failed to import workflow ${workflow.workflowId}: ${error}`);
    }
  }
}

importWorkflows();
