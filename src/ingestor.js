const os = require("os");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

/**
 * Resolve platform-specific ingestor binary
 */
function resolveBinary() {
  const platform = os.platform();
  const arch = os.arch();

  let binDir;
  let binName;

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

/**
 * Start Go ingestor as background process (Windows-safe)
 */
function startIngestor(config) {
  const binary = resolveBinary();

  // Prepare directories
  const logDir = config.logDir || "./logs";
  const internalLogDir = path.join(logDir, "_internal");
  fs.mkdirSync(internalLogDir, { recursive: true });

  // Write config for ingestor
  const cfgPath = path.join(process.cwd(), "ingestor.config.json");
  fs.writeFileSync(cfgPath, JSON.stringify(config, null, 2));

  // Spawn ingestor (Windows-safe detached mode)
  const proc = spawn(binary, [cfgPath], {
    windowsHide: true,
    detached: true,
    stdio: "ignore"
  });

  // Allow parent to exit
  proc.unref();
}

module.exports = {
  startIngestor
};