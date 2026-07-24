import {
  setupDependencies,
  performHealthCheck,
  handleShutdown,
} from "./wire";

async function startWorker() {
  try {
    // Setup dependencies and check health
    const deps = await setupDependencies();
    await performHealthCheck(deps);

    // Start RabbitMQ consumer
    deps.logger.info("Starting RabbitMQ event consumer...");
    await deps.eventConsumer.start(
      (message) => deps.routerService.handleEvent(message),
      1,     // prefetch count
      false  // manual ack
    );

    deps.logger.info("Worker ready - consuming events");

    // Setup graceful shutdown
    process.on("SIGTERM", () => handleShutdown(deps));
    process.on("SIGINT", () => handleShutdown(deps));

    return { deps };
  } catch (error) {
    console.error("Failed to start worker:", error);
    process.exit(1);
  }
}

startWorker();

export { startWorker, handleShutdown };
