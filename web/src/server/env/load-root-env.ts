import fs from "node:fs";
import path from "node:path";

let loaded = false;

function applyEnvFile(filePath: string): void {
  if (!fs.existsSync(filePath)) {
    return;
  }

  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed
      .slice(separatorIndex + 1)
      .trim()
      .replace(/^['"]|['"]$/g, "");

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

export function loadRootEnv(): void {
  if (loaded) {
    return;
  }

  const repoEnvPath = path.resolve(process.cwd(), "..", ".env");
  applyEnvFile(repoEnvPath);
  loaded = true;
}

loadRootEnv();
