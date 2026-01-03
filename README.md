# Unified Logger SDK

Unified Logger SDK is a durable, disk-first logging system for backend services that require reliable log persistence, structured logging, and database-backed querying without introducing centralized logging infrastructure or vendor lock-in.

The SDK is designed for production systems where log loss, partial writes, or tight coupling to external services is unacceptable.

---

## Core Principles

- Disk-first logging (logs are never written directly to a database)
- Structured, schema-stable log format (NDJSON)
- Deterministic behavior under high load
- No always-on servers or collectors
- No external SaaS dependency
- Compatible with monoliths and microservices
- Works on Windows, Linux, and macOS
- Log schema is backward-compatible within a major version

---

## Architecture Overview

Unified Logger SDK is intentionally split into two components:

### 1. Node.js Logging SDK (Public)
- Runs inside the application process
- Writes structured logs to local disk
- Never blocks request execution
- Minimal runtime overhead

### 2. Native Ingestion Engine (Embedded)
- Implemented in Go for reliability and performance
- Runs locally as a background process
- Reads log files, batches records, retries failures
- Persists logs into the project database

Application (Node.js)
    |
    | structured logs (NDJSON)
    v
Local Disk (append-only files)
    |
    | background ingestion
    v
Embedded Ingestor
    |
    v
Project Database (MSSQL / PostgreSQL / MySQL)

This separation ensures logs are preserved even if the application crashes or the database is temporarily unavailable.

---

## Non-Goals

This SDK intentionally does not provide:
- Centralized SaaS log ingestion
- Real-time streaming pipelines
- Log visualization dashboards

---

## Installation

```bash
npm install unified-logger-sdk
```

The package includes platform-specific ingestion binaries.
No additional system dependencies are required.

---

## Quick Start

```js
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
      type: "postgres",
      connection: process.env.DB_URL
    }
  })
);

logger.info("application started");
```

This is the minimum required setup.

---

## Basic Usage

### Create a Logger

```js
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
logger.error("order processing failed", { orderId: 123 });
```

Logs are written immediately to disk in NDJSON format.

---

## Enable Database Ingestion

```js
const {
  startIngestor,
  buildIngestorConfig
} = require("unified-logger-sdk");

startIngestor(
  buildIngestorConfig({
    logDir: "./logs",
    db: {
      type: "postgres",        // mssql | postgres | mysql
      connection: process.env.DB_URL,
      table: "logs"
    }
  })
);
```
The SDK only manages its own table and does not modify any existing application tables.
The ingestor should be started once per application instance, typically during service startup.

The ingestion engine:
- Starts in the background
- Auto-creates the database table if missing
- Batches inserts
- Retries on transient failures
- Prevents duplicate records

No cron jobs or manual execution required.

---

## Log Storage Model

### Directory Structure

```
logs/
├── active/      # logs currently being written
├── processed/   # successfully ingested files
└── archive/     # files that failed ingestion after retries
```

Files are never deleted automatically.

---

## Operational Characteristics

- Safe to restart application or ingestor at any time
- Safe to re-run ingestion multiple times
- Logging continues even if the database is unavailable
- No in-memory buffering that risks OOM
- No long-running background threads inside the application process

---

## Security Model

- No outbound network calls
- No telemetry
- No data exfiltration
- Database credentials remain local
- Suitable for restricted enterprise environments

---

## Versioning

Semantic Versioning is used:
- Patch: bug fixes
- Minor: backward-compatible features
- Major: schema or behavioral changes
