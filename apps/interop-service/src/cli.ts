/**
 * CLI Interface
 * Provides command-line tools for operations and management
 */

import {
  setupDependencies,
  performHealthCheck,
  closeDependencies,
} from "./wire";
import type { RabbitMQMessage } from "./common/types/message";

/**
 * Parse CLI arguments
 *
 * @returns Parsed command and arguments
 */
function parseArgs(): { command: string; args: string[] } {
  const args = process.argv.slice(2);
  return {
    command: args[0] || "help",
    args: args.slice(1),
  };
}

/**
 * Display help message
 */
function showHelp(): void {
  console.log(`
Interop Service CLI

Usage: node cli.ts <command> [options]

Commands:
  health              Check service health and dependencies
  seed                Seed initial route mappings
  validate-config     Validate environment configuration
  test-event          Send a test event through the router
  show-routes         Display configured route mappings
  refresh-routes      Refresh route mappings from database
  help                Show this help message

Examples:
  node cli.ts health
  node cli.ts seed
  node cli.ts validate-config
  node cli.ts test-event order.created
  node cli.ts show-routes
  node cli.ts refresh-routes
`);
}

/**
 * Health check command
 */
async function cmdHealth(): Promise<void> {
  try {
    const deps = await setupDependencies();
    const health = await performHealthCheck(deps);

    console.log("\n" + health.summary);

    await closeDependencies(deps);

    if (health.status === "unhealthy") {
      process.exit(1);
    }
  } catch (error) {
    console.error("Health check failed:", error);
    process.exit(1);
  }
}

/**
 * Seed route mappings command
 */
async function cmdSeed(): Promise<void> {
  try {
    const deps = await setupDependencies();

    deps.logger.info("Seeding route mappings...");

    // Route mappings matching db-scripts/route-mapping-insert.sql
    const mappings = [
      {
        rabbitmq_topic: "order.created",
        openhim_channel_id: "smile-order-created-channel",
        openhim_channel_name: "SMILE Order Created Channel",
        http_method: "POST",
        request_path: "/pub/smile/orders/order-created",
        enabled: true,
        include_context: true,
        auth_type: "basic",
        max_retries: 3,
        retry_backoff_ms: 1000,
        retry_backoff_multiplier: 2,
        expected_status_codes: "200,201,202,204",
      },
      {
        rabbitmq_topic: "order.status.order.confirm",
        openhim_channel_id: "smile-order-confirmed-channel",
        openhim_channel_name: "SMILE Order Confirmed Channel",
        http_method: "POST",
        request_path: "/pub/smile/orders/order-confirmed",
        enabled: true,
        include_context: true,
        auth_type: "basic",
        max_retries: 3,
        retry_backoff_ms: 1000,
        retry_backoff_multiplier: 2,
        expected_status_codes: "200,201,202,204",
      },
      {
        rabbitmq_topic: "order.status.order.cancel",
        openhim_channel_id: "smile-order-cancelled-channel",
        openhim_channel_name: "SMILE Order Cancelled Channel",
        http_method: "POST",
        request_path: "/pub/smile/orders/order-cancelled",
        enabled: true,
        include_context: true,
        auth_type: "basic",
        max_retries: 3,
        retry_backoff_ms: 1000,
        retry_backoff_multiplier: 2,
        expected_status_codes: "200,201,202,204",
      },
      {
        rabbitmq_topic: "order.status.order.allocate",
        openhim_channel_id: "smile-order-allocated-channel",
        openhim_channel_name: "SMILE Order Allocated Channel",
        http_method: "POST",
        request_path: "/pub/smile/orders/order-allocated",
        enabled: true,
        include_context: true,
        auth_type: "basic",
        max_retries: 3,
        retry_backoff_ms: 1000,
        retry_backoff_multiplier: 2,
        expected_status_codes: "200,201,202,204",
      },
      {
        rabbitmq_topic: "order.status.order.shipped",
        openhim_channel_id: "smile-order-shipped-channel",
        openhim_channel_name: "SMILE Order Shipped Channel",
        http_method: "POST",
        request_path: "/pub/smile/orders/order-shipped",
        enabled: true,
        include_context: true,
        auth_type: "basic",
        max_retries: 3,
        retry_backoff_ms: 1000,
        retry_backoff_multiplier: 2,
        expected_status_codes: "200,201,202,204",
      },
      {
        rabbitmq_topic: "order.status.order.fullfilled", // intentional typo — matches actual topic
        openhim_channel_id: "smile-order-fulfilled-channel",
        openhim_channel_name: "SMILE Order Fulfilled Channel",
        http_method: "POST",
        request_path: "/pub/smile/orders/order-fulfilled",
        enabled: true,
        include_context: true,
        auth_type: "basic",
        max_retries: 3,
        retry_backoff_ms: 1000,
        retry_backoff_multiplier: 2,
        expected_status_codes: "200,201,202,204",
      },
      {
        rabbitmq_topic: "order.status.order.validated",
        openhim_channel_id: "smile-order-validated-channel",
        openhim_channel_name: "SMILE Order Validated Channel",
        http_method: "POST",
        request_path: "/pub/smile/orders/order-validated",
        enabled: true,
        include_context: true,
        auth_type: "basic",
        max_retries: 3,
        retry_backoff_ms: 1000,
        retry_backoff_multiplier: 2,
        expected_status_codes: "200,201,202,204",
      },
    ];

    for (const mapping of mappings) {
      try {
        await deps.routeMappingRepository.upsert(mapping);
        deps.logger.info(`Seeded mapping: ${mapping.rabbitmq_topic}`);
      } catch (error) {
        deps.logger.error(
          { error, topic: mapping.rabbitmq_topic },
          "Failed to seed mapping"
        );
      }
    }

    console.log(`\nSeeded ${mappings.length} route mappings`);

    await closeDependencies(deps);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

/**
 * Validate configuration command
 */
async function cmdValidateConfig(): Promise<void> {
  try {
    const deps = await setupDependencies();

    deps.logger.info("Configuration validated:");
    deps.logger.info({ env: deps.env }, "Environment variables");

    console.log("\nConfiguration is valid");

    await closeDependencies(deps);
  } catch (error) {
    console.error("Configuration validation failed:", error);
    process.exit(1);
  }
}

/**
 * Test event command
 */
async function cmdTestEvent(topic?: string): Promise<void> {
  if (!topic) {
    console.error("Error: topic is required");
    console.log("Usage: node cli.ts test-event <topic>");
    console.log("Example: node cli.ts test-event order.created");
    process.exit(1);
  }

  try {
    const deps = await setupDependencies();

    // Create a test message based on topic
    let payload: Record<string, unknown> = {};
    let context: Record<string, unknown> = {};

    if (topic === "order.created") {
      payload = {
        id: "12345",
        customer_id: "cust-001",
        total_amount: 99.99,
        status: "pending",
        created_at: new Date().toISOString(),
      };
      context = {
        program_id: "test-program",
        workspace_id: "test-workspace",
        user_id: "test-user",
      };
    } else if (topic === "order-comment.created") {
      payload = {
        comment_id: "com-001",
        order_id: "12345",
        comment_text: "Test comment",
        created_at: new Date().toISOString(),
      };
    } else {
      payload = {
        id: Math.random().toString(36).substring(7),
        timestamp: Date.now(),
        data: "test event",
      };
    }

    const testMessage: RabbitMQMessage = {
      topic,
      payload,
      timestamp: Date.now(),
      headers: {},
      context: context as any,
    };

    deps.logger.info({ topic, payload }, `Sending test event: ${topic}`);

    const result = await deps.routerService.handleEvent(testMessage);

    console.log("\nTest event processed:");
    console.log(`   Execution ID: ${result.executionId}`);
    console.log(`   Status: ${result.status}`);
    console.log(`   Total Time: ${result.totalExecutionTimeMs}ms`);

    if (result.errorMessage) {
      console.log(`   Error: ${result.errorMessage}`);
    }

    await closeDependencies(deps);
  } catch (error) {
    console.error("Test event failed:", error);
    process.exit(1);
  }
}

/**
 * Show routes command
 */
async function cmdShowRoutes(): Promise<void> {
  try {
    const deps = await setupDependencies();

    const routes = deps.routeMappingRepository.getEnabledMappings();

    if (routes.length === 0) {
      console.log("\nNo route mappings configured");
    } else {
      console.log("\nConfigured Route Mappings:\n");

      for (const route of routes) {
        console.log(`Topic: ${route.rabbitmq_topic}`);
        console.log(`  Channel: ${route.openhim_channel_id}`);
        console.log(`  Path: ${route.request_path}`);
        console.log(
          `  Status: ${route.enabled ? "✅ Enabled" : "❌ Disabled"}`
        );
        console.log(`  Context: ${route.include_context ? "Yes" : "No"}`);
        console.log(`  Expected Codes: ${route.expected_status_codes}`);
        if (route.description) {
          console.log(`  Description: ${route.description}`);
        }
        console.log();
      }

      console.log(`Total: ${routes.length} routes configured`);
    }

    await closeDependencies(deps);
  } catch (error) {
    console.error("Show routes failed:", error);
    process.exit(1);
  }
}

/**
 * Refresh routes command
 */
async function cmdRefreshRoutes(): Promise<void> {
  try {
    const deps = await setupDependencies();

    console.log("\nRefreshing route mappings from database...");

    await deps.routeMappingRepository.refresh();

    const topics = deps.routeMappingRepository.getTopics();
    const enabledCount = deps.routeMappingRepository.getEnabledMappings().length;

    console.log(`✅ Route mappings refreshed successfully`);
    console.log(`   Total mappings: ${topics.length}`);
    console.log(`   Enabled: ${enabledCount}`);
    console.log(`   Topics: ${topics.join(", ")}`);

    await closeDependencies(deps);
  } catch (error) {
    console.error("Refresh routes failed:", error);
    process.exit(1);
  }
}

/**
 * Main CLI handler
 */
async function main(): Promise<void> {
  const { command, args } = parseArgs();

  try {
    switch (command) {
      case "health":
        await cmdHealth();
        break;

      case "seed":
        await cmdSeed();
        break;

      case "validate-config":
        await cmdValidateConfig();
        break;

      case "test-event":
        await cmdTestEvent(args[0]);
        break;

      case "show-routes":
        await cmdShowRoutes();
        break;

      case "refresh-routes":
        await cmdRefreshRoutes();
        break;

      case "help":
      default:
        showHelp();
        break;
    }
  } catch (error) {
    console.error("CLI error:", error);
    process.exit(1);
  }
}

main();

export { main };
