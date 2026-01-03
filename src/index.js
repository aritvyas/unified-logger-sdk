const { Logger } = require("./logger");
const { startIngestor } = require("./ingestor");
const { buildIngestorConfig } = require("./config");

function createLogger(opts) {
  return new Logger(opts);
}

module.exports = {
  createLogger,
  startIngestor,
  buildIngestorConfig
};