const { Logger } = require("./logger");
const { startIngestor } = require("./ingestor");
const { buildIngestorConfig } = require("./config");

function createLogger(options) {
  return new Logger(options);
}

module.exports = {
  createLogger,
  startIngestor,
  buildIngestorConfig
};