function buildIngestorConfig({ logDir, db, batch }) {
  if (!logDir) {
    throw new Error("logDir is required");
  }

  if (!db?.type || !db?.connection) {
    throw new Error("db.type and db.connection are required");
  }

  return {
    logDir,
    db: {
      type: db.type,                
      connection: db.connection,
      table: db.table || "unified_logs"
    },
    batch: {
      size: batch?.size || 200,
      maxRetries: batch?.maxRetries || 3
    }
  };
}

module.exports = { buildIngestorConfig };