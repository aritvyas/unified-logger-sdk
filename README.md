Unified Logger SDK

Unified Logger SDK is a durable, disk-first logging system for backend services that require reliable log persistence, structured logging, and database-backed querying without introducing centralized logging infrastructure or vendor lock-in.

The SDK is designed for production systems where log loss, partial writes, or tight coupling to external services is unacceptable.

⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻

Core Principles
	•	Disk-first logging (logs are never written directly to a database)
	•	Structured, schema-stable log format (NDJSON)
	•	Deterministic behavior under high load
	•	No always-on servers or collectors
	•	No external SaaS dependency
	•	Compatible with monoliths and microservices
	•	Works on Windows, Linux, and macOS
	•	Log schema is backward-compatible within a major version

⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻

Architecture Overview

Unified Logger SDK is intentionally split into two components:

1. Node.js Logging SDK (Public)
	•	Runs inside the application process
	•	Writes structured logs to local disk
	•	Never blocks request execution
	•	Minimal runtime overhead

2. Native Ingestion Engine (Embedded)
	•	Implemented in Go for reliability and performance
	•	Runs locally as a background process
	•	Reads log files from disk
	•	Batches records and retries failures
	•	Persists logs into Microsoft SQL Server

  Application (Node.js)
        |
        | structured logs (NDJSON)
        v
Local Disk (append-only files)
        |
        | background ingestion
        v
Embedded Ingestor (Go)
        |
        v
Microsoft SQL Server

This separation guarantees log durability even if:
	•	The application crashes
	•	The database is temporarily unavailable
	•	The system restarts mid-write

⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻

Non-Goals

This SDK intentionally does not provide:
	•	Centralized SaaS log ingestion
	•	Real-time streaming pipelines
	•	Log visualization dashboards
	•	Distributed tracing
	•	Metrics aggregation

Unified Logger SDK focuses only on durable logging.

⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻

Installation
npm install unified-logger-sdk

The package includes platform-specific ingestion binaries.

No system-level dependencies are required.

⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻

Supported Database

Currently supported database:
	•	Microsoft SQL Server (MSSQL)

PostgreSQL and MySQL are intentionally not enabled in this release to guarantee correctness and stability.

⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻

Quick Start

const {
  createLogger,
  startIngestor,
  buildIngestorConfig
} = require("unified-logger-sdk");

const logger = createLogger({
  service: { name: "example-service", version: "1.0.0" },
  logging: { logDir: "./logs" }
});

startIngestor(
  buildIngestorConfig({
    logDir: "./logs",
    db: {
      type: "mssql",
      connection: process.env.MSSQL_CONNECTION_STRING
    }
  })
);

logger.info("application started");


This is the minimum required setup.

⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻

Basic Usage

Create a Logger

const { createLogger } = require("unified-logger-sdk");

const logger = createLogger({
  service: {
    name: "order-service",
    version: "1.0.0"
  },
  logging: {
    logDir: "./logs"
  }
});

logger.info("service started");
logger.error("order processing failed", {
  why_code: "ORDER_FAILED",
  orderId: 123
});

Logs are written immediately to disk in NDJSON format.

⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻

Enable Database Ingestion (MSSQL)

const {
  startIngestor,
  buildIngestorConfig
} = require("unified-logger-sdk");

startIngestor(
  buildIngestorConfig({
    logDir: "./logs",
    db: {
      type: "mssql",
      connection: process.env.MSSQL_CONNECTION_STRING,
      table: "unified_logs"
    }
  })
);

Important Notes
	•	The ingestor runs as a local background process
	•	The database table is auto-created if missing
	•	Inserts are batched
	•	Transient failures are retried
	•	Duplicate log records are prevented
	•	No cron jobs or manual execution required

Start the ingestor once per application instance, typically during service startup.

⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻

Log Storage Model

Directory Structure

logs/
├── active/      # logs currently being written
├── processed/   # successfully ingested files
└── archive/     # files that failed ingestion after retries

	•	Files are never deleted automatically
	•	Log files are immutable once processed
	•	Failed files are preserved for investigation

⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻

Database Schema (5W Model)

The ingestor uses a fixed 5W schema:

CREATE TABLE unified_logs (
  log_id        UNIQUEIDENTIFIER PRIMARY KEY,
  log_time      DATETIME2        NOT NULL,
  who_service   NVARCHAR(100)    NOT NULL,
  what_level    NVARCHAR(10)     NOT NULL,
  what_message  NVARCHAR(1000)   NOT NULL,
  why_code      NVARCHAR(100)    NULL,
  payload       NVARCHAR(MAX)    NULL,
  ingested_at   DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME()
);

This schema is stable and versioned.

⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻

Operational Characteristics
	•	Safe to restart application or ingestor at any time
	•	Safe to re-run ingestion multiple times
	•	Logging continues even if MSSQL is down
	•	No in-memory buffering that risks OOM
	•	No long-running threads inside the Node.js process

⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻

Security Model
	•	No outbound network calls
	•	No telemetry
	•	No data exfiltration
	•	Database credentials remain local
	•	Suitable for restricted enterprise environments

⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻

Versioning

Semantic Versioning is enforced:
	•	Patch: bug fixes only
	•	Minor: backward-compatible features
	•	Major: schema or behavioral changes

⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻⸻

Status

Production-ready (MSSQL only)
Other databases may be added only after correctness is guaranteed.
