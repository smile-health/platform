/**
 * OpenHIM Import - Logger Module
 *
 * Provides structured logging with dual output (stdout + file)
 */

const fs = require("fs");
const path = require("path");

class Logger {
  constructor(logDir = "/var/log/openhim") {
    this.logDir = logDir;
    this.logFile = path.join(
      logDir,
      `import-${this.getTimestamp("YYYY-MM-DD-HH-mm-ss")}.log`
    );
    this.stats = {
      users: { created: 0, skipped: 0, failed: 0 },
      clients: { created: 0, skipped: 0, failed: 0 },
      channels: { created: 0, skipped: 0, failed: 0 },
      mediators: { created: 0, skipped: 0, failed: 0 },
    };

    // Ensure log directory exists
    this.ensureLogDir();

    // Write header to log file
    this.writeToFile("=".repeat(70));
    this.writeToFile(
      `OpenHIM Configuration Import Started: ${new Date().toISOString()}`
    );
    this.writeToFile("=".repeat(70));
  }

  /**
   * Ensure log directory exists
   */
  ensureLogDir() {
    try {
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }
    } catch (error) {
      console.error(`Failed to create log directory: ${error.message}`);
    }
  }

  /**
   * Format timestamp for logging
   * @param {string} format - 'HH:mm:ss' for time only, 'YYYY-MM-DD-HH-mm-ss' for filename
   */
  getTimestamp(format = "HH:mm:ss") {
    const now = new Date();

    if (format === "HH:mm:ss") {
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      return `${hours}:${minutes}:${seconds}`;
    } else if (format === "YYYY-MM-DD-HH-mm-ss") {
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;
    }

    return now.toISOString();
  }

  /**
   * Write to log file only
   */
  writeToFile(message) {
    try {
      fs.appendFileSync(this.logFile, `${message}\n`, { encoding: "utf8" });
    } catch (error) {
      console.error(`Failed to write to log file: ${error.message}`);
    }
  }

  /**
   * ANSI color codes for terminal output
   */
  get colors() {
    return {
      reset: "\x1b[0m",
      blue: "\x1b[34m",
      green: "\x1b[32m",
      yellow: "\x1b[33m",
      red: "\x1b[31m",
      cyan: "\x1b[36m",
    };
  }

  /**
   * Log info message (blue)
   */
  info(message, category = "") {
    const timestamp = this.getTimestamp("HH:mm:ss");
    const prefix = category ? `[${category}]` : "";

    // Colored stdout
    console.log(
      `${this.colors.blue}[${timestamp}] INFO  ${prefix}${message}${this.colors.reset}`
    );

    // File output (no color)
    this.writeToFile(`[${timestamp}] INFO  ${prefix}${message}`);
  }

  /**
   * Log success message (green)
   */
  success(message, category = "") {
    const timestamp = this.getTimestamp("HH:mm:ss");
    const prefix = category ? `[${category}]` : "";

    // Colored stdout
    console.log(
      `${this.colors.green}[${timestamp}] SUCCESS ${prefix}${message}${this.colors.reset}`
    );

    // File output (no color)
    this.writeToFile(`[${timestamp}] SUCCESS ${prefix}${message}`);
  }

  /**
   * Log warning message (yellow)
   */
  warn(message, category = "") {
    const timestamp = this.getTimestamp("HH:mm:ss");
    const prefix = category ? `[${category}]` : "";

    // Colored stdout
    console.log(
      `${this.colors.yellow}[${timestamp}] WARN  ${prefix}${message}${this.colors.reset}`
    );

    // File output (no color)
    this.writeToFile(`[${timestamp}] WARN  ${prefix}${message}`);
  }

  /**
   * Log error message (red)
   */
  error(message, category = "") {
    const timestamp = this.getTimestamp("HH:mm:ss");
    const prefix = category ? `[${category}]` : "";

    // Colored stderr
    console.error(
      `${this.colors.red}[${timestamp}] ERROR ${prefix}${message}${this.colors.reset}`
    );

    // File output (no color)
    this.writeToFile(`[${timestamp}] ERROR ${prefix}${message}`);
  }

  /**
   * Log skip message (default color)
   */
  skip(message, category = "") {
    const timestamp = this.getTimestamp("HH:mm:ss");
    const prefix = category ? `[${category}]` : "";

    // Stdout
    console.log(`[${timestamp}] SKIP  ${prefix}${message}`);

    // File output
    this.writeToFile(`[${timestamp}] SKIP  ${prefix}${message}`);
  }

  /**
   * Log create message (green)
   */
  create(message, category = "") {
    const timestamp = this.getTimestamp("HH:mm:ss");
    const prefix = category ? `[${category}]` : "";

    // Colored stdout
    console.log(
      `${this.colors.green}[${timestamp}] CREATE ${prefix}${message}${this.colors.reset}`
    );

    // File output (no color)
    this.writeToFile(`[${timestamp}] CREATE ${prefix}${message}`);
  }

  /**
   * Increment counters
   */
  incrementCreated(resourceType) {
    if (this.stats[resourceType]) {
      this.stats[resourceType].created++;
    }
  }

  incrementSkipped(resourceType) {
    if (this.stats[resourceType]) {
      this.stats[resourceType].skipped++;
    }
  }

  incrementFailed(resourceType) {
    if (this.stats[resourceType]) {
      this.stats[resourceType].failed++;
    }
  }

  /**
   * Generate and display summary report
   */
  summary() {
    const separator = "=".repeat(70);
    const totalCreated =
      this.stats.users.created +
      this.stats.clients.created +
      this.stats.channels.created +
      this.stats.mediators.created;
    const totalSkipped =
      this.stats.users.skipped +
      this.stats.clients.skipped +
      this.stats.channels.skipped +
      this.stats.mediators.skipped;
    const totalFailed =
      this.stats.users.failed +
      this.stats.clients.failed +
      this.stats.channels.failed +
      this.stats.mediators.failed;

    const hasFailed = totalFailed > 0;
    const statusColor = hasFailed ? this.colors.red : this.colors.green;
    const statusText = hasFailed ? "FAILED" : "SUCCESS";

    // Colored output
    console.log("");
    console.log(separator);
    console.log(
      `${statusColor}OpenHIM Configuration Import Complete - ${statusText}${this.colors.reset}`
    );
    console.log(separator);
    console.log(
      `  Users:     Created=${this.stats.users.created}, Skipped=${this.stats.users.skipped}, Failed=${this.stats.users.failed}`
    );
    console.log(
      `  Clients:   Created=${this.stats.clients.created}, Skipped=${this.stats.clients.skipped}, Failed=${this.stats.clients.failed}`
    );
    console.log(
      `  Channels:  Created=${this.stats.channels.created}, Skipped=${this.stats.channels.skipped}, Failed=${this.stats.channels.failed}`
    );
    console.log(
      `  Mediators: Created=${this.stats.mediators.created}, Skipped=${this.stats.mediators.skipped}, Failed=${this.stats.mediators.failed}`
    );
    console.log(separator);
    console.log(
      `${this.colors.cyan}Total:    Created=${totalCreated}, Skipped=${totalSkipped}, Failed=${totalFailed}${this.colors.reset}`
    );
    console.log(separator);
    console.log(`Log file: ${this.logFile}`);
    console.log("");

    // File output
    this.writeToFile("");
    this.writeToFile(separator);
    this.writeToFile(`OpenHIM Configuration Import Complete - ${statusText}`);
    this.writeToFile(separator);
    this.writeToFile(
      `  Users:     Created=${this.stats.users.created}, Skipped=${this.stats.users.skipped}, Failed=${this.stats.users.failed}`
    );
    this.writeToFile(
      `  Clients:   Created=${this.stats.clients.created}, Skipped=${this.stats.clients.skipped}, Failed=${this.stats.clients.failed}`
    );
    this.writeToFile(
      `  Channels:  Created=${this.stats.channels.created}, Skipped=${this.stats.channels.skipped}, Failed=${this.stats.channels.failed}`
    );
    this.writeToFile(
      `  Mediators: Created=${this.stats.mediators.created}, Skipped=${this.stats.mediators.skipped}, Failed=${this.stats.mediators.failed}`
    );
    this.writeToFile(separator);
    this.writeToFile(
      `Total:    Created=${totalCreated}, Skipped=${totalSkipped}, Failed=${totalFailed}`
    );
    this.writeToFile(separator);
    this.writeToFile(`End Time: ${new Date().toISOString()}`);
    this.writeToFile(
      `Exit Status: ${hasFailed ? "1 (FAILED)" : "0 (SUCCESS)"}`
    );
    this.writeToFile("");
  }

  /**
   * Get log file path
   */
  getLogFile() {
    return this.logFile;
  }

  /**
   * Get current stats
   */
  getStats() {
    return JSON.parse(JSON.stringify(this.stats));
  }
}

module.exports = Logger;
