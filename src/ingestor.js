const os = require("os");
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

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
    binName = "ingestor-linux";
  } else if (platform === "darwin" && arch === "arm64") {
    binDir = "darwin-arm64";
    binName = "ingestor-darwin";
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
  const bin = resolveBinary();
  const cfgPath = path.join(process.cwd(), "ingestor.config.json");

  fs.writeFileSync(cfgPath, JSON.stringify(config, null, 2));

  const proc = spawn(bin, [cfgPath], {
    windowsHide: true,
    stdio: "ignore",
    detached: true
  });

  proc.unref();
}

module.exports = { startIngestor };