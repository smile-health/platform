/**
 * Transformer Registry, Maps RabbitMQ topics to transformer instances
 * Provides centralized lookup and caching of transformers
 */

import type { Logger } from "pino";
import type { Env } from "../../config/env";
import {
  BaseTransformer,
  OrderCreatedTransformer,
  PassThroughTransformer,
} from "./transformer.base";

// Registry for managing transformer instances, Uses lazy initialization for transformers
export class TransformerRegistry {
  private transformers = new Map<string, BaseTransformer>();
  private logger: Logger;
  private env: Env;

  constructor(env: Env, logger: Logger) {
    this.env = env;
    this.logger = logger;
    this.initializeDefaultTransformers();
  }

  // Registers a transformer for a specific topic
  register(topic: string, transformer: BaseTransformer): void {
    if (this.transformers.has(topic)) {
      this.logger.warn({ topic }, "Overwriting existing transformer");
    }

    this.transformers.set(topic, transformer);
    this.logger.debug(
      { topic, type: transformer.constructor.name },
      "Transformer registered",
    );
  }

  // Gets a transformer for a topic, falls back to PassThroughTransformer if none is registered.
  get(topic: string): BaseTransformer {
    const transformer = this.transformers.get(topic);

    if (!transformer) {
      this.logger.debug(
        { topic },
        "No specific transformer registered — using PassThroughTransformer as fallback",
      );
      return new PassThroughTransformer(topic);
    }

    return transformer;
  }

  // Checks if a transformer is registered for a topic
  has(topic: string): boolean {
    return this.transformers.has(topic);
  }

  // Gets all registered transformers
  getAll(): Map<string, BaseTransformer> {
    return new Map(this.transformers);
  }

  // Gets all registered topics
  getTopics(): string[] {
    return Array.from(this.transformers.keys());
  }

  // Clears all registered transformers, Useful for testing
  clear(): void {
    this.transformers.clear();
    this.logger.debug("Transformer registry cleared");
  }

  // Initializes default transformers. Only register topic-specific transformers here when a topic genuinely needs field mapping or restructuring.
  private initializeDefaultTransformers(): void {
    // order.created: has field-mapping mode (id → order_id) when ENABLE_PAYLOAD_TRANSFORMATION=true
    this.register("order.created", new OrderCreatedTransformer(this.env));

    this.logger.info(
      { count: this.transformers.size },
      "Default transformers initialized (all other topics use PassThroughTransformer)",
    );
  }
}

// Factory function to create a configured registry
export function createTransformerRegistry(
  env: Env,
  logger: Logger,
): TransformerRegistry {
  return new TransformerRegistry(env, logger);
}
