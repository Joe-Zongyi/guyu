import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const targets = [".next", ".tailwind-check.css", ".dev.log", "tsconfig.tsbuildinfo"];

for (const target of targets) {
  const targetPath = path.join(root, target);
  if (!fs.existsSync(targetPath)) {
    continue;
  }

  fs.rmSync(targetPath, {
    recursive: true,
    force: true,
  });

  console.log(`removed ${target}`);
}

console.log("web dev cache reset complete");
