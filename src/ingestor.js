const os = require("os");
const path = require("path");
const fs = require("fs");
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
    binName = "ingestor-linux-amd64";
  } else if (platform === "darwin" && arch === "arm64") {
    binDir = "darwin-arm64";
    binName = "ingestor-darwin-arm64";
  } else {
    throw new Error(`Unsupported platform: ${platform} ${arch}`);
  }

  const binPath = path.join(__dirname, "..", "bin", binDir, binName);

  if (!fs.existsSync(binPath)) {
    throw new Error(`Ingestor binary not found: ${binPath}`);
  }

  return binPath;
}

function startIngestor(config) {
  const binary = resolveBinary();
  const cfgPath = path.join(process.cwd(), "ingestor.config.json");

  fs.writeFileSync(cfgPath, JSON.stringify(config, null, 2));

  const proc = spawn(binary, [cfgPath], {
    detached: true,
    stdio: "ignore"
  });

  proc.unref();
}

module.exports = { startIngestor };