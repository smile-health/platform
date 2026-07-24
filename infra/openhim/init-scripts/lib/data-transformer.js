/**
 * OpenHIM Import - Data Transformer Module
 *
 * Transforms exported JSON data for API import
 * - Strips MongoDB ObjectIDs (updatedBy.id)
 * - Deletes expired tokens
 */

class DataTransformer {
  /**
   * Transform user for API import
   *
   * @param {object} user - User object from export
   * @returns {object} Transformed user object
   */
  transformUserForApi(user) {
    // Deep copy to avoid modifying original
    const transformed = JSON.parse(JSON.stringify(user));

    // Remove updatedBy.id if it exists (let OpenHIM generate new ID)
    if (transformed.updatedBy && typeof transformed.updatedBy === "object") {
      delete transformed.updatedBy.id;
    }

    // Delete expired tokens to force new token on login
    if (transformed.expiry) {
      const expiryDate = new Date(transformed.expiry);
      const now = new Date();

      if (expiryDate < now) {
        // Token is expired, delete it
        delete transformed.token;
        delete transformed.expiry;
        delete transformed.tokenType;
      }
    }

    // Password hashes and salts are preserved as-is

    return transformed;
  }

  /**
   * Transform client for API import
   *
   * @param {object} client - Client object from export
   * @returns {object} Transformed client object
   */
  transformClientForApi(client) {
    // Deep copy to avoid modifying original
    const transformed = JSON.parse(JSON.stringify(client));

    // Remove updatedBy.id if it exists (let OpenHIM generate new ID)
    if (transformed.updatedBy && typeof transformed.updatedBy === "object") {
      delete transformed.updatedBy.id;
    }

    // Password hashes and salts are preserved as-is

    return transformed;
  }

  /**
   * Transform channel for API import
   *
   * @param {object} channel - Channel object from export
   * @returns {object} Transformed channel object
   */
  transformChannelForApi(channel) {
    // Deep copy to avoid modifying original
    const transformed = JSON.parse(JSON.stringify(channel));

    // Remove updatedBy.id if it exists (let OpenHIM generate new ID)
    if (transformed.updatedBy && typeof transformed.updatedBy === "object") {
      delete transformed.updatedBy.id;
    }

    // Keep route hostnames, usernames, and passwords as-is

    return transformed;
  }

  /**
   * Strip all MongoDB ObjectIDs from an object recursively
   * Removes any field with '...id' pattern that looks like MongoDB ObjectID
   *
   * @param {object} obj - Object to process
   * @returns {object} Object with IDs removed
   */
  stripObjectIds(obj) {
    if (typeof obj !== "object" || obj === null) {
      return obj;
    }

    // Deep copy
    const transformed = JSON.parse(JSON.stringify(obj));

    // Recursive function to strip IDs
    const stripIds = (current) => {
      if (typeof current !== "object" || current === null) {
        return current;
      }

      if (Array.isArray(current)) {
        return current.map(stripIds);
      }

      // Process object properties
      for (const [key, value] of Object.entries(current)) {
        // Delete 'id' field in nested objects (like updatedBy.id)
        if (
          key === "id" &&
          typeof value === "string" &&
          this.isObjectId(value)
        ) {
          delete current[key];
        } else if (typeof value === "object") {
          current[key] = stripIds(value);
        }
      }

      return current;
    };

    return stripIds(transformed);
  }

  /**
   * Check if a string looks like a MongoDB ObjectID
   * ObjectIDs are 24-character hexadecimal strings
   *
   * @param {string} str - String to check
   * @returns {boolean}
   */
  isObjectId(str) {
    if (typeof str !== "string") {
      return false;
    }

    // MongoDB ObjectID: 24 hex characters
    return /^[0-9a-f]{24}$/i.test(str);
  }

  /**
   * Delete expired tokens from a user object
   * Checks if expiry date is in the past
   *
   * @param {object} user - User object
   * @returns {object} User object without expired token fields
   */
  deleteExpiredTokens(user) {
    // Deep copy
    const transformed = JSON.parse(JSON.stringify(user));

    if (transformed.expiry) {
      const expiryDate = new Date(transformed.expiry);
      const now = new Date();

      if (expiryDate < now) {
        delete transformed.token;
        delete transformed.expiry;
        delete transformed.tokenType;
      }
    }

    return transformed;
  }

  /**
   * Get field value from object using dot notation
   * Example: getFieldByPath(user, 'updatedBy.name')
   *
   * @param {object} obj - Object to search
   * @param {string} path - Dot-notation path
   * @returns {*} Field value or undefined
   */
  getFieldByPath(obj, path) {
    return path.split(".").reduce((current, part) => {
      return current && current[part];
    }, obj);
  }

  /**
   * Set field value in object using dot notation
   * Example: setFieldByPath(user, 'updatedBy.name', 'New Name')
   *
   * @param {object} obj - Object to modify
   * @param {string} path - Dot-notation path
   * @param {*} value - Value to set
   * @returns {object} Modified object
   */
  setFieldByPath(obj, path, value) {
    const keys = path.split(".");
    const lastKey = keys.pop();

    // Navigate/create path
    let current = obj;
    for (const key of keys) {
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }

    current[lastKey] = value;
    return obj;
  }

  /**
   * Apply multiple transformations to an object
   *
   * @param {object} obj - Object to transform
   * @param {string[]} transformations - Array of transformation names
   * @returns {object} Transformed object
   */
  applyTransformations(obj, transformations = []) {
    let result = JSON.parse(JSON.stringify(obj));

    if (transformations.includes("stripIds")) {
      result = this.stripObjectIds(result);
    }

    if (transformations.includes("deleteExpiredTokens")) {
      result = this.deleteExpiredTokens(result);
    }

    return result;
  }
}

module.exports = DataTransformer;
