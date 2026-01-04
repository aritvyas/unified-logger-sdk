const os = require("os");
const fs = require("fs");
const path = require("path");
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
    binName = "ingestor-linux";
  } else if (platform === "darwin" && arch === "arm64") {
    binDir = "darwin-arm64";
    binName = "ingestor-darwin";
  } else {
    throw new Error(`Unsupported platform: ${platform} ${arch}`);
  }

  const pkgRoot = path.resolve(__dirname, "..");
  const binPath = path.join(pkgRoot, "bin", binDir, binName);

  if (!fs.existsSync(binPath)) {
    throw new Error(`Ingestor binary not found at ${binPath}`);
  }

  return binPath;
}

function startIngestor(config) {
  const bin = resolveBinary();
  const cfgPath = path.join(process.cwd(), "ingestor.config.json");

  fs.writeFileSync(cfgPath, JSON.stringify(config, null, 2));

  const internalDir = path.join(process.cwd(), "logs", "_internal");
  fs.mkdirSync(internalDir, { recursive: true });

  const errLog = path.join(internalDir, "ingestor.err.log");

  const proc = spawn(bin, [cfgPath], {
    windowsHide: true,
    stdio: ["ignore", "ignore", fs.openSync(errLog, "a")],
    detached: true
  });

  proc.unref();
}

module.exports = { startIngestor };