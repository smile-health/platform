import type { CreateWorkflowDto, UpdateWorkflowDto } from "@novu/api/models/components";
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
      const existing = await novu.workflows
        .get(workflow.workflowId)
        .then((res) => res.result)
        .catch(() => undefined);

      if (existing) {
        await novu.workflows.update(
          {
            ...workflow,
            preferences: existing.preferences,
            origin: existing.origin,
          } as unknown as UpdateWorkflowDto,
          workflow.workflowId,
        );
        console.log(`Updated workflow: ${workflow.workflowId}`);
      } else {
        await novu.workflows.create(workflow as CreateWorkflowDto);
        console.log(`Imported workflow: ${workflow.workflowId}`);
      }
    } catch (error) {
      const details =
        error && typeof error === "object" && "errors" in error
          ? JSON.stringify((error as { errors: unknown }).errors)
          : undefined;
      console.error(
        `Failed to import workflow ${workflow.workflowId}: ${error}${details ? ` - ${details}` : ""}`,
      );
    }
  }
}

importWorkflows();
