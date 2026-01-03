const os = require("os");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

function resolveBinary() {
  const platform = os.platform();
  const arch = os.arch();

  if (platform === "win32") {
    return path.join(__dirname, "../bin/win/ingestor.exe");
  }
  if (platform === "darwin" && arch === "arm64") {
    return path.join(__dirname, "../bin/darwin-arm64/ingestor");
  }
  if (platform === "linux") {
    return path.join(__dirname, "../bin/linux-amd64/ingestor");
  }
  throw new Error("Unsupported platform");
}

function startIngestor(config) {
  const bin = resolveBinary();
  const cfgPath = path.join(process.cwd(), "ingestor.config.json");

  fs.writeFileSync(cfgPath, JSON.stringify(config, null, 2));

  const proc = spawn(bin, [cfgPath], {
    stdio: "inherit",
    detached: true
  });

  proc.unref();
}

module.exports = { startIngestor };