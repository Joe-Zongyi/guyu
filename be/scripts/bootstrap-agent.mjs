/**
 * Bootstrap the local @guyu/plant-agent dependency.
 *
 * Behavior:
 * - If ../agent-layer/dist/index.js already exists AND ./node_modules/@guyu/plant-agent
 *   is present, skip the heavy install/build (fast path for restart).
 * - Otherwise install agent-layer deps, build it, then `npm install ../agent-layer`
 *   so the local package is linked into be/node_modules.
 *
 * Set FORCE_BOOTSTRAP_AGENT=1 to always rebuild.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const beRoot = path.resolve(__dirname, "..");
const agentRoot = path.resolve(beRoot, "..", "agent-layer");
const agentDistEntry = path.join(agentRoot, "dist", "index.js");
const linkedPackage = path.join(
  beRoot,
  "node_modules",
  "@guyu",
  "plant-agent",
  "package.json",
);

const force = process.env.FORCE_BOOTSTRAP_AGENT === "1";
const hasDist = existsSync(agentDistEntry);
const hasLink = existsSync(linkedPackage);
const startedAt = Date.now();

function log(msg) {
  process.stdout.write(`[bootstrap-agent] ${msg}\n`);
}

function run(label, cmd, args, cwd) {
  log(`${label}: ${cmd} ${args.join(" ")}  (cwd=${cwd})`);
  const result = spawnSync(cmd, args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

if (!force && hasDist && hasLink) {
  log(
    `fast path: agent-layer/dist + be/node_modules/@guyu/plant-agent already present (skip ${Date.now() - startedAt} ms). Set FORCE_BOOTSTRAP_AGENT=1 to rebuild.`,
  );
  process.exit(0);
}

log(
  `bootstrap needed (force=${force}, hasDist=${hasDist}, hasLink=${hasLink})`,
);

run("install agent-layer deps", "npm", ["install"], agentRoot);
run("build agent-layer", "npm", ["run", "build"], agentRoot);
run(
  "link agent-layer into be",
  "npm",
  ["install", path.relative(beRoot, agentRoot).replaceAll("\\", "/")],
  beRoot,
);

log(`bootstrap finished in ${Date.now() - startedAt} ms`);
