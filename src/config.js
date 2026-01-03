function buildIngestorConfig({ logDir, db }) {
  if (!db || !db.type || !db.connection) {
    throw new Error("DB config missing");
  }

  return {
    logDir,
    db: {
      type: db.type,
      connection: db.connection,
      table: db.table || "logs"
    },
    batch: {
      size: 200,
      maxRetries: 3
    }
  };
}

module.exports = { buildIngestorConfig };