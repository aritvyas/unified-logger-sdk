const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

class Logger {
  constructor({ service, logging }) {
    if (!service?.name) {
      throw new Error("service.name is required");
    }

    this.service = {
      name: service.name,
      version: service.version || null
    };

    const baseDir = logging?.logDir || "./logs";
    this.activeDir = path.join(baseDir, "active");
    fs.mkdirSync(this.activeDir, { recursive: true });

    // one file per process run → avoids pollution
    const fileName = `${service.name}-${process.pid}-${Date.now()}.log`;
    this.file = path.join(this.activeDir, fileName);
  }

  write(level, message, data) {
    const entry = {
      logId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      level,
      service: this.service,
      message,
      data: data ?? null
    };

    fs.appendFileSync(
      this.file,
      JSON.stringify(entry) + "\n",
      { encoding: "utf8" }
    );
  }

  info(message, data) {
    this.write("INFO", message, data);
  }

  error(message, data) {
    this.write("ERROR", message, data);
  }

  warn(message, data) {
    this.write("WARN", message, data);
  }

  debug(message, data) {
    this.write("DEBUG", message, data);
  }
}

module.exports = { Logger };