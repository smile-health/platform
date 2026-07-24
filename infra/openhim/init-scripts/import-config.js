#!/usr/bin/env node

/**
 * OpenHIM Import Configuration Script
 *
 * Main entry point for importing OpenHIM configuration from JSON export
 *
 * Exit Codes:
 *   0 - Success (all resources imported)
 *   1 - Failure (validation error or import failure)
 *
 * Usage:
 *   node /app/init-scripts/import-config.js
 */

const Logger = require("./lib/logger.js");
const ApiClient = require("./lib/api-client.js");
const DataTransformer = require("./lib/data-transformer.js");
const Validator = require("./lib/validator.js");

/**
 * Main async function
 */
async function main() {
  // Initialize logger
  const logDir = process.env.OPENHIM_LOG_DIR || "/var/log/openhim";
  const logger = new Logger(logDir);

  try {
    logger.info("Starting OpenHIM Configuration Import");
    logger.info(
      `OpenHIM Host: ${process.env.OPENHIM_HOST || "localhost"}:${process.env.OPENHIM_API_PORT || "8080"}`
    );

    // Configuration
    const configFile =
      process.env.OPENHIM_CONFIG_FILE ||
      "/etc/openhim/config/openhim-insert.json";
    logger.info(`Config File: ${configFile}`);

    // ====================================================================
    // PHASE 0: Check if config file exists
    // ====================================================================
    const fs = require("fs");
    if (!fs.existsSync(configFile)) {
      logger.warn(
        "Configuration file not found (optional for fresh OpenHIM setup)",
        "CONFIG"
      );
      logger.info("");
      logger.info("=".repeat(70));
      logger.info("No configuration to import - fresh OpenHIM setup");
      logger.info("=".repeat(70));
      logger.info("");
      logger.success(
        "Import script completed successfully (no config to import)"
      );
      logger.info(`Log file: ${logger.getLogFile()}`);
      logger.info("");
      process.exit(0);
    }

    // ====================================================================
    // PHASE 1: Initialize components
    // ====================================================================
    const apiClient = new ApiClient(logger, {
      host: process.env.OPENHIM_HOST,
      port: process.env.OPENHIM_API_PORT,
      rootUser: process.env.OPENHIM_ROOT_USER,
      rootPassword: process.env.OPENHIM_ROOT_PASSWORD,
    });

    const transformer = new DataTransformer();
    const validator = new Validator(logger);

    // ====================================================================
    // PHASE 2: Validate configuration
    // ====================================================================
    logger.info("");
    logger.info("=".repeat(70));
    logger.info("PHASE 2: Validating Configuration");
    logger.info("=".repeat(70));

    const config = validator.validateJsonFile(configFile);
    validator.validateConfig(config);

    // ====================================================================
    // PHASE 3: Wait for OpenHIM to be healthy
    // ====================================================================
    logger.info("");
    logger.info("=".repeat(70));
    logger.info("PHASE 3: Waiting for OpenHIM to be Ready");
    logger.info("=".repeat(70));

    const isHealthy = await apiClient.waitForHealthy(60);
    if (!isHealthy) {
      throw new Error("OpenHIM did not become healthy within 60 seconds");
    }

    logger.success("OpenHIM is healthy and ready", "HEALTH");

    // ====================================================================
    // PHASE 4: Import Users
    // ====================================================================
    logger.info("");
    logger.info("=".repeat(70));
    logger.info("PHASE 4: Importing Users");
    logger.info("=".repeat(70));

    const userCount = config.Users.length;
    logger.info(`Processing ${userCount} users...`);

    for (let i = 0; i < config.Users.length; i++) {
      const user = config.Users[i];
      const email = user.email;

      logger.info(`[${i + 1}/${userCount}] Processing user: ${email}`, "USERS");

      try {
        // Check if user exists
        const exists = await apiClient.userExists(email);

        if (exists) {
          logger.skip(`User ${email} already exists`, "USERS");
          logger.incrementSkipped("users");
          continue;
        }

        // Transform user (strip IDs, delete expired tokens)
        const transformedUser = transformer.transformUserForApi(user);

        // Create user
        const result = await apiClient.createUser(transformedUser);

        if (result.success) {
          logger.create(`User ${email} created successfully`, "USERS");
          logger.incrementCreated("users");
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        logger.error(
          `Failed to create user ${email}: ${error.message}`,
          "USERS"
        );
        logger.incrementFailed("users");
      }
    }

    const userStats = logger.getStats().users;
    logger.info(
      `Users: Created=${userStats.created}, Skipped=${userStats.skipped}, Failed=${userStats.failed}`
    );

    // ====================================================================
    // PHASE 5: Import Clients
    // ====================================================================
    logger.info("");
    logger.info("=".repeat(70));
    logger.info("PHASE 5: Importing Clients");
    logger.info("=".repeat(70));

    const clientCount = config.Clients.length;
    logger.info(`Processing ${clientCount} clients...`);

    const importedClientIDs = new Set();

    for (let i = 0; i < config.Clients.length; i++) {
      const client = config.Clients[i];
      const clientID = client.clientID;

      logger.info(
        `[${i + 1}/${clientCount}] Processing client: ${clientID}`,
        "CLIENTS"
      );

      try {
        // Check if client exists
        const exists = await apiClient.clientExists(clientID);

        if (exists) {
          logger.skip(`Client ${clientID} already exists`, "CLIENTS");
          logger.incrementSkipped("clients");
          importedClientIDs.add(clientID);
          continue;
        }

        // Transform client (strip IDs)
        const transformedClient = transformer.transformClientForApi(client);

        // Create client
        const result = await apiClient.createClient(transformedClient);

        if (result.success) {
          logger.create(`Client ${clientID} created successfully`, "CLIENTS");
          logger.incrementCreated("clients");
          importedClientIDs.add(clientID);
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        logger.error(
          `Failed to create client ${clientID}: ${error.message}`,
          "CLIENTS"
        );
        logger.incrementFailed("clients");
      }
    }

    const clientStats = logger.getStats().clients;
    logger.info(
      `Clients: Created=${clientStats.created}, Skipped=${clientStats.skipped}, Failed=${clientStats.failed}`
    );

    // ====================================================================
    // PHASE 6: Import Channels
    // ====================================================================
    logger.info("");
    logger.info("=".repeat(70));
    logger.info("PHASE 6: Importing Channels");
    logger.info("=".repeat(70));

    const channelCount = config.Channels.length;
    logger.info(`Processing ${channelCount} channels...`);

    for (let i = 0; i < config.Channels.length; i++) {
      const channel = config.Channels[i];
      const channelName = channel.name;

      logger.info(
        `[${i + 1}/${channelCount}] Processing channel: ${channelName}`,
        "CHANNELS"
      );

      try {
        // Validate channel client dependencies
        validator.validateChannelClients(channel, importedClientIDs);

        // Check if channel exists
        const exists = await apiClient.channelExists(channelName);

        if (exists) {
          logger.skip(`Channel ${channelName} already exists`, "CHANNELS");
          logger.incrementSkipped("channels");
          continue;
        }

        // Transform channel (strip IDs)
        const transformedChannel = transformer.transformChannelForApi(channel);

        // Create channel
        const result = await apiClient.createChannel(transformedChannel);

        if (result.success) {
          logger.create(
            `Channel ${channelName} created successfully`,
            "CHANNELS"
          );
          logger.incrementCreated("channels");
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        logger.error(
          `Failed to create channel ${channelName}: ${error.message}`,
          "CHANNELS"
        );
        logger.incrementFailed("channels");
      }
    }

    const channelStats = logger.getStats().channels;
    logger.info(
      `Channels: Created=${channelStats.created}, Skipped=${channelStats.skipped}, Failed=${channelStats.failed}`
    );

    // ====================================================================
    // PHASE 7: Import Mediators (if any)
    // ====================================================================
    if (config.Mediators && config.Mediators.length > 0) {
      logger.info("");
      logger.info("=".repeat(70));
      logger.info("PHASE 7: Importing Mediators");
      logger.info("=".repeat(70));

      const mediatorCount = config.Mediators.length;
      logger.info(`Processing ${mediatorCount} mediators...`);

      // Runtime fields added by OpenHIM — must be stripped before POST
      const RUNTIME_FIELDS = ["_lastHeartbeat", "_uptime", "_id", "__v"];

      for (let i = 0; i < config.Mediators.length; i++) {
        const mediator = config.Mediators[i];
        const urn = mediator.urn;

        logger.info(
          `[${i + 1}/${mediatorCount}] Processing mediator: ${urn}`,
          "MEDIATORS"
        );

        try {
          // Check if mediator exists by URN
          const exists = await apiClient.mediatorExists(urn);

          if (exists) {
            logger.skip(`Mediator ${urn} already exists`, "MEDIATORS");
            logger.incrementSkipped("mediators");
            continue;
          }

          // Strip runtime/internal fields before import
          const transformedMediator = Object.assign({}, mediator);
          for (const field of RUNTIME_FIELDS) {
            delete transformedMediator[field];
          }

          // Create mediator
          const result = await apiClient.createMediator(transformedMediator);

          if (result.success) {
            logger.create(`Mediator ${urn} created successfully`, "MEDIATORS");
            logger.incrementCreated("mediators");
          } else {
            throw new Error(result.message);
          }
        } catch (error) {
          logger.error(
            `Failed to import mediator ${urn}: ${error.message}`,
            "MEDIATORS"
          );
          logger.incrementFailed("mediators");
        }
      }

      const mediatorStats = logger.getStats().mediators;
      logger.info(
        `Mediators: Created=${mediatorStats.created}, Skipped=${mediatorStats.skipped}, Failed=${mediatorStats.failed}`
      );
    }

    // ====================================================================
    // PHASE 8: Import ContactGroups (if any)
    // ====================================================================
    if (config.ContactGroups && config.ContactGroups.length > 0) {
      logger.info("");
      logger.info("=".repeat(70));
      logger.info("PHASE 8: Importing ContactGroups");
      logger.info("=".repeat(70));

      logger.warn("ContactGroups import not yet implemented", "CONTACTGROUPS");
      logger.info("Skipping contact groups import (not yet implemented)");
    }

    // ====================================================================
    // Done: Generate summary and exit with 0 or 1
    // ====================================================================
    logger.info("");
    logger.summary();

    const stats = logger.getStats();
    const anyFailed =
      stats.users.failed > 0 ||
      stats.clients.failed > 0 ||
      stats.channels.failed > 0 ||
      stats.mediators.failed > 0;

    if (anyFailed) {
      logger.error(
        "Import completed with failures — review errors above",
        "SUMMARY"
      );
      process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    // Fatal error occurred
    logger.error("");
    logger.error("=".repeat(70));
    logger.error("FATAL ERROR");
    logger.error("=".repeat(70));
    logger.error(error.message);

    if (error.stack) {
      logger.error("Stack trace:");
      logger.error(error.stack);
    }

    logger.error("");
    logger.error("Import failed. Please review the error above and try again.");
    logger.error(`Log file: ${logger.getLogFile()}`);
    logger.error("");

    process.exit(1);
  }
}

// Run main function
main();
