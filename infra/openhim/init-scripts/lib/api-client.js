/**
 * OpenHIM Import - API Client Module
 *
 * Provides HTTPS API client with authentication, retry logic, and error handling
 */

const https = require("https");

class ApiClient {
  constructor(logger, config = {}) {
    this.logger = logger;
    this.host = config.host || process.env.OPENHIM_HOST || "localhost";
    this.port =
      config.port || parseInt(process.env.OPENHIM_API_PORT || "8080", 10);
    this.rootUser =
      config.rootUser || process.env.OPENHIM_ROOT_USER || "root@openhim.org";
    this.rootPassword =
      config.rootPassword ||
      process.env.OPENHIM_ROOT_PASSWORD;
    this.maxRetries = config.maxRetries || 3;
    this.retryDelay = config.retryDelay || 1000; // ms

    // HTTPS Agent with self-signed certificate handling
    this.agent = new https.Agent({
      rejectUnauthorized: false, // Allow self-signed certificates
    });
  }

  /**
   * Encode credentials for Basic Authentication
   */
  encodeBasicAuth(username, password) {
    return Buffer.from(`${username}:${password}`).toString("base64");
  }

  /**
   * Get Authorization header
   */
  getAuthHeader() {
    return `Basic ${this.encodeBasicAuth(this.rootUser, this.rootPassword)}`;
  }

  /**
   * Make HTTP request with retry logic
   * @param {string} method - HTTP method (GET, POST, PUT)
   * @param {string} endpoint - API endpoint path
   * @param {object} data - Request body (optional)
   * @param {number} attempt - Current attempt number (for retry logic)
   * @returns {Promise<{body: object, statusCode: number}>}
   */
  async makeRequest(method, endpoint, data = null, attempt = 1) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.host,
        port: this.port,
        path: endpoint,
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: this.getAuthHeader(),
        },
        agent: this.agent,
      };

      // Calculate request body
      let requestBody = null;
      if (data) {
        requestBody = JSON.stringify(data);
        options.headers["Content-Length"] = Buffer.byteLength(requestBody);
      }

      const request = https.request(options, (response) => {
        let responseBody = "";

        response.on("data", (chunk) => {
          responseBody += chunk;
        });

        response.on("end", () => {
          try {
            const body = responseBody ? JSON.parse(responseBody) : null;
            resolve({
              body: body,
              statusCode: response.statusCode,
            });
          } catch (error) {
            // If JSON parse fails, return raw body
            resolve({
              body: responseBody,
              statusCode: response.statusCode,
            });
          }
        });
      });

      request.on("error", async (error) => {
        if (attempt < this.maxRetries && error.code === "ECONNREFUSED") {
          // Retry on connection refused
          await this.sleep(this.retryDelay * attempt); // Exponential backoff
          try {
            const result = await this.makeRequest(
              method,
              endpoint,
              data,
              attempt + 1
            );
            resolve(result);
          } catch (retryError) {
            reject(retryError);
          }
        } else {
          reject(error);
        }
      });

      if (requestBody) {
        request.write(requestBody);
      }

      request.end();
    });
  }

  /**
   * Sleep utility for retry delays
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * GET request
   */
  async get(endpoint) {
    const response = await this.makeRequest("GET", endpoint);
    return response.body;
  }

  /**
   * POST request
   */
  async post(endpoint, data) {
    const response = await this.makeRequest("POST", endpoint, data);
    return response;
  }

  /**
   * PUT request
   */
  async put(endpoint, data) {
    const response = await this.makeRequest("PUT", endpoint, data);
    return response;
  }

  /**
   * Check if user exists
   * @param {string} email - User email address
   * @returns {Promise<boolean>}
   */
  async userExists(email) {
    try {
      const response = await this.makeRequest(
        "GET",
        `/users/${encodeURIComponent(email)}`
      );
      return response.statusCode === 200;
    } catch (error) {
      this.logger.error(`Failed to check user existence: ${error.message}`);
      return false;
    }
  }

  /**
   * Create user
   * @param {object} userData - User data object
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async createUser(userData) {
    try {
      const response = await this.post("/users", userData);

      if (response.statusCode === 201 || response.statusCode === 200) {
        return { success: true, message: `User ${userData.email} created` };
      }

      // Check for "already exists" error
      if (
        response.statusCode === 409 ||
        (response.body &&
          response.body.message &&
          response.body.message.includes("already exists"))
      ) {
        return {
          success: true,
          message: `User ${userData.email} already exists (idempotent)`,
        };
      }

      throw new Error(
        `HTTP ${response.statusCode}: ${JSON.stringify(response.body)}`
      );
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Check if client exists
   * @param {string} clientID - Client ID
   * @returns {Promise<boolean>}
   */
  async clientExists(clientID) {
    try {
      const response = await this.makeRequest(
        "GET",
        `/clients/${encodeURIComponent(clientID)}`
      );
      return response.statusCode === 200;
    } catch (error) {
      this.logger.error(`Failed to check client existence: ${error.message}`);
      return false;
    }
  }

  /**
   * Create client
   * @param {object} clientData - Client data object
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async createClient(clientData) {
    try {
      const response = await this.post("/clients", clientData);

      if (response.statusCode === 201 || response.statusCode === 200) {
        return {
          success: true,
          message: `Client ${clientData.clientID} created`,
        };
      }

      // Check for "already exists" error
      if (
        response.statusCode === 409 ||
        (response.body &&
          response.body.message &&
          response.body.message.includes("already exists"))
      ) {
        return {
          success: true,
          message: `Client ${clientData.clientID} already exists (idempotent)`,
        };
      }

      throw new Error(
        `HTTP ${response.statusCode}: ${JSON.stringify(response.body)}`
      );
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Check if channel exists by name
   * @param {string} channelName - Channel name
   * @returns {Promise<boolean>}
   */
  async channelExists(channelName) {
    try {
      const channels = await this.get("/channels");

      if (Array.isArray(channels)) {
        return channels.some((ch) => ch.name === channelName);
      }

      return false;
    } catch (error) {
      this.logger.error(`Failed to check channel existence: ${error.message}`);
      return false;
    }
  }

  /**
   * Create channel
   * @param {object} channelData - Channel data object
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async createChannel(channelData) {
    try {
      const response = await this.post("/channels", channelData);

      if (response.statusCode === 201 || response.statusCode === 200) {
        return {
          success: true,
          message: `Channel ${channelData.name} created`,
        };
      }

      // Check for "already exists" error
      if (
        response.statusCode === 409 ||
        (response.body &&
          response.body.message &&
          response.body.message.includes("already exists"))
      ) {
        return {
          success: true,
          message: `Channel ${channelData.name} already exists (idempotent)`,
        };
      }

      throw new Error(
        `HTTP ${response.statusCode}: ${JSON.stringify(response.body)}`
      );
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Check if mediator exists by URN
   * @param {string} urn - Mediator URN (e.g. urn:mediator:smile-rule-router)
   * @returns {Promise<boolean>}
   */
  async mediatorExists(urn) {
    try {
      const mediators = await this.get("/mediators");

      if (Array.isArray(mediators)) {
        return mediators.some((m) => m.urn === urn);
      }

      return false;
    } catch (error) {
      this.logger.error(
        `Failed to check mediator existence: ${error.message}`
      );
      return false;
    }
  }

  /**
   * Create (register) a mediator
   * @param {object} mediatorData - Mediator definition object (runtime fields already stripped)
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async createMediator(mediatorData) {
    try {
      const response = await this.post("/mediators", mediatorData);

      if (response.statusCode === 201 || response.statusCode === 200) {
        return {
          success: true,
          message: `Mediator ${mediatorData.urn} registered`,
        };
      }

      // Idempotent — already registered
      if (
        response.statusCode === 409 ||
        (response.body &&
          response.body.message &&
          response.body.message.includes("already exists"))
      ) {
        return {
          success: true,
          message: `Mediator ${mediatorData.urn} already exists (idempotent)`,
        };
      }

      throw new Error(
        `HTTP ${response.statusCode}: ${JSON.stringify(response.body)}`
      );
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  /**
   * Wait for OpenHIM to be healthy
   * @param {number} timeoutSeconds - Timeout in seconds
   * @returns {Promise<boolean>}
   */
  async waitForHealthy(timeoutSeconds = 60) {
    const startTime = Date.now();
    const timeoutMs = timeoutSeconds * 1000;

    while (Date.now() - startTime < timeoutMs) {
      try {
        const response = await this.makeRequest("GET", "/heartbeat");
        if (response.statusCode === 200) {
          return true;
        }
      } catch (error) {
        // Continue retrying on error
      }

      // Wait 1 second before retry
      await this.sleep(1000);
    }

    return false;
  }
}

module.exports = ApiClient;
