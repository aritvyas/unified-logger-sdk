const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

class Logger {
  constructor({ service, logging }) {
    if (!service?.name) {
      throw new Error("service.name is required");
    }

    this.service = service;
    this.logDir = logging?.logDir || "./logs";
    this.activeDir = path.join(this.logDir, "active");

    fs.mkdirSync(this.activeDir, { recursive: true });

    this.file = path.join(this.activeDir, `${service.name}.log`);
  }

  write(level, message, data = {}) {
    const entry = {
      log_id: crypto.randomUUID(),              
      log_time: new Date().toISOString(),      
      who_service: this.service.name,          
      what_level: level,                        
      what_message: message,                  
      why_code: data.why_code || null,          
      payload: data.payload || data || null    
    };

    fs.appendFileSync(this.file, JSON.stringify(entry) + "\n");
  }

  info(message, payload) {
    this.write("INFO", message, payload);
  }

  error(message, payload) {
    this.write("ERROR", message, payload);
  }

  warn(message, payload) {
    this.write("WARN", message, payload);
  }

  debug(message, payload) {
    this.write("DEBUG", message, payload);
  }
}

module.exports = { Logger };