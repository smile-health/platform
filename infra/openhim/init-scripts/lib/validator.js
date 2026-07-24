/**
 * OpenHIM Import - Validator Module
 *
 * Validates JSON files and resource schemas
 */

const fs = require("fs");

class Validator {
  constructor(logger) {
    this.logger = logger;
  }

  /**
   * Validate JSON file syntax and structure
   *
   * @param {string} filePath - Path to JSON file
   * @returns {object} Parsed JSON object
   * @throws {Error} If file doesn't exist or JSON is invalid
   */
  validateJsonFile(filePath) {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`Config file not found: ${filePath}`);
    }

    // Read file
    let content;
    try {
      content = fs.readFileSync(filePath, "utf8");
    } catch (error) {
      throw new Error(`Failed to read config file: ${error.message}`);
    }

    // Parse JSON
    let config;
    try {
      config = JSON.parse(content);
    } catch (error) {
      throw new Error(`Invalid JSON in config file: ${error.message}`);
    }

    // Validate structure (should have Users, Clients, Channels arrays)
    if (!config.Users || !Array.isArray(config.Users)) {
      throw new Error('Config missing "Users" array');
    }

    if (!config.Clients || !Array.isArray(config.Clients)) {
      throw new Error('Config missing "Clients" array');
    }

    if (!config.Channels || !Array.isArray(config.Channels)) {
      throw new Error('Config missing "Channels" array');
    }

    this.logger.info(
      `Config file validated successfully: ${config.Users.length} users, ${config.Clients.length} clients, ${config.Channels.length} channels`
    );

    return config;
  }

  /**
   * Validate user schema
   * Checks for required fields
   *
   * @param {object} user - User object
   * @param {number} index - Index in array (for error messages)
   * @throws {Error} If required fields missing
   */
  validateUserSchema(user, index = null) {
    const indexStr = index != null ? ` at index ${index}` : "";

    // Required fields
    const requiredFields = ["email", "firstname", "surname", "provider"];

    for (const field of requiredFields) {
      if (!user[field]) {
        throw new Error(`User${indexStr} missing required field: "${field}"`);
      }
    }

    // Email format validation
    if (!this.isValidEmail(user.email)) {
      throw new Error(
        `User${indexStr} has invalid email format: "${user.email}"`
      );
    }

    // Groups should be an array
    if (user.groups && !Array.isArray(user.groups)) {
      throw new Error(
        `User${indexStr} has invalid "groups" field: should be an array`
      );
    }
  }

  /**
   * Validate client schema
   * Checks for required fields
   *
   * @param {object} client - Client object
   * @param {number} index - Index in array (for error messages)
   * @throws {Error} If required fields missing
   */
  validateClientSchema(client, index = null) {
    const indexStr = index != null ? ` at index ${index}` : "";

    // Required fields
    const requiredFields = ["clientID", "name", "roles"];

    for (const field of requiredFields) {
      if (!client[field]) {
        throw new Error(`Client${indexStr} missing required field: "${field}"`);
      }
    }

    // clientID should be string
    if (typeof client.clientID !== "string") {
      throw new Error(
        `Client${indexStr} has invalid "clientID": should be a string`
      );
    }

    // Roles should be an array
    if (!Array.isArray(client.roles)) {
      throw new Error(
        `Client${indexStr} has invalid "roles" field: should be an array`
      );
    }

    // Password fields should be present if provided
    if (client.passwordHash && !client.passwordSalt) {
      throw new Error(
        `Client${indexStr} has passwordHash but missing passwordSalt`
      );
    }

    if (client.passwordSalt && !client.passwordHash) {
      throw new Error(
        `Client${indexStr} has passwordSalt but missing passwordHash`
      );
    }
  }

  /**
   * Validate channel schema
   * Checks for required fields
   *
   * @param {object} channel - Channel object
   * @param {number} index - Index in array (for error messages)
   * @throws {Error} If required fields missing
   */
  validateChannelSchema(channel, index = null) {
    const indexStr = index != null ? ` at index ${index}` : "";

    // Required fields
    const requiredFields = ["name", "urlPattern", "methods", "type", "routes"];

    for (const field of requiredFields) {
      if (field !== "routes" && !channel[field]) {
        throw new Error(
          `Channel${indexStr} missing required field: "${field}"`
        );
      }
    }

    // Methods should be an array
    if (!Array.isArray(channel.methods)) {
      throw new Error(
        `Channel${indexStr} has invalid "methods" field: should be an array`
      );
    }

    // Routes should be an array
    if (!Array.isArray(channel.routes)) {
      throw new Error(
        `Channel${indexStr} has invalid "routes" field: should be an array`
      );
    }

    // At least one route is required
    if (channel.routes.length === 0) {
      throw new Error(`Channel${indexStr} must have at least one route`);
    }

    // Validate each route
    for (let i = 0; i < channel.routes.length; i++) {
      const route = channel.routes[i];
      if (!route.name || !route.host || !route.port || !route.path) {
        throw new Error(
          `Channel${indexStr} route[${i}] missing required fields (name, host, port, path)`
        );
      }
    }
  }

  /**
   * Validate that all referenced clients exist
   *
   * @param {object} channel - Channel object
   * @param {Set<string>} importedClientIDs - Set of client IDs that were imported
   * @throws {Error} If referenced client doesn't exist
   */
  validateChannelClients(channel, importedClientIDs) {
    if (!channel.allow || !Array.isArray(channel.allow)) {
      return; // No client restrictions
    }

    for (const clientID of channel.allow) {
      if (!importedClientIDs.has(clientID)) {
        throw new Error(
          `Channel "${channel.name}" references non-existent client: "${clientID}"`
        );
      }
    }
  }

  /**
   * Validate email format
   *
   * @param {string} email - Email address
   * @returns {boolean}
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate all users in config
   *
   * @param {object} config - Config object with Users array
   * @throws {Error} On validation failure
   */
  validateAllUsers(config) {
    if (!config.Users || !Array.isArray(config.Users)) {
      return;
    }

    for (let i = 0; i < config.Users.length; i++) {
      try {
        this.validateUserSchema(config.Users[i], i);
      } catch (error) {
        throw new Error(`User validation error: ${error.message}`);
      }
    }
  }

  /**
   * Validate all clients in config
   *
   * @param {object} config - Config object with Clients array
   * @throws {Error} On validation failure
   */
  validateAllClients(config) {
    if (!config.Clients || !Array.isArray(config.Clients)) {
      return;
    }

    for (let i = 0; i < config.Clients.length; i++) {
      try {
        this.validateClientSchema(config.Clients[i], i);
      } catch (error) {
        throw new Error(`Client validation error: ${error.message}`);
      }
    }
  }

  /**
   * Validate all channels in config
   *
   * @param {object} config - Config object with Channels array
   * @param {Set<string>} importedClientIDs - Set of imported client IDs (for dependency check)
   * @throws {Error} On validation failure
   */
  validateAllChannels(config, importedClientIDs = null) {
    if (!config.Channels || !Array.isArray(config.Channels)) {
      return;
    }

    for (let i = 0; i < config.Channels.length; i++) {
      try {
        this.validateChannelSchema(config.Channels[i], i);

        // Check client dependencies if importedClientIDs provided
        if (importedClientIDs) {
          this.validateChannelClients(config.Channels[i], importedClientIDs);
        }
      } catch (error) {
        throw new Error(`Channel validation error: ${error.message}`);
      }
    }
  }

  /**
   * Validate entire config
   *
   * @param {object} config - Config object
   * @throws {Error} On validation failure
   */
  validateConfig(config) {
    this.logger.info("Validating configuration structure...");

    try {
      this.validateAllUsers(config);
      this.logger.info(`Users validated: ${config.Users.length} users`);

      this.validateAllClients(config);
      this.logger.info(`Clients validated: ${config.Clients.length} clients`);

      // Build set of client IDs for channel validation
      const clientIDs = new Set();
      if (config.Clients && Array.isArray(config.Clients)) {
        config.Clients.forEach((client) => {
          clientIDs.add(client.clientID);
        });
      }

      this.validateAllChannels(config, clientIDs);
      this.logger.info(
        `Channels validated: ${config.Channels.length} channels`
      );

      this.logger.success("All validations passed!");
    } catch (error) {
      throw new Error(`Validation failed: ${error.message}`);
    }
  }
}

module.exports = Validator;
