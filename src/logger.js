const fs = require("fs");
const path = require("path");

class Logger {
  constructor({ service, logging }) {
    this.service = service;
    this.logDir = logging.logDir || "./logs";
    this.activeDir = path.join(this.logDir, "active");

    fs.mkdirSync(this.activeDir, { recursive: true });
    this.file = path.join(this.activeDir, `${service.name}.log`);
  }

  write(level, message, data) {
    const entry = {
      logId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      level,
      service: this.service,
      message,
      data
    };

    fs.appendFileSync(this.file, JSON.stringify(entry) + "\n");
  }

  info(msg, data) { this.write("INFO", msg, data); }
  error(msg, data) { this.write("ERROR", msg, data); }
}

module.exports = { Logger };