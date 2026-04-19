import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

let loaded = false;

export function loadRootEnv(): void {
  if (loaded) {
    return;
  }

  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = path.resolve(currentDir, "..", "..");
  config({ path: path.join(repoRoot, ".env"), override: false });
  loaded = true;
}

loadRootEnv();
