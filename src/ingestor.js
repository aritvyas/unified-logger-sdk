const os = require("os");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

function resolveBinary() {
  const platform = os.platform();
  const arch = os.arch();

  let binDir, binName;

  if (platform === "win32") {
    binDir = "win";
    binName = "ingestor-win.exe";
  } else if (platform === "linux" && arch === "x64") {
    binDir = "linux-amd64";
    binName = "ingestor-linux-amd64";
  } else if (platform === "darwin" && arch === "arm64") {
    binDir = "darwin-arm64";
    binName = "ingestor-darwin-arm64";
  } else {
    throw new Error(`Unsupported platform: ${platform} ${arch}`);
  }

  const binPath = path.join(__dirname, "..", "bin", binDir, binName);

  if (!fs.existsSync(binPath)) {
    throw new Error(`Ingestor binary not found at ${binPath}`);
  }

  return binPath;
}

function startIngestor(config) {
  const binary = resolveBinary();

  const logDir = config.logDir || "./logs";
  const internalLogDir = path.join(logDir, "_internal");
  fs.mkdirSync(internalLogDir, { recursive: true });

  const cfgPath = path.join(process.cwd(), "ingestor.config.json");
  const logPath = path.join(internalLogDir, "ingestor.log");

  fs.writeFileSync(cfgPath, JSON.stringify(config, null, 2));

  const out = fs.openSync(logPath, "a");

  const proc = spawn(binary, [cfgPath], {
    detached: true,
    stdio: ["ignore", out, out]
  });

  proc.unref();
}

module.exports = { startIngestor };