/**
 * Kill process(es) listening on PORT (default 8787).
 * - Windows: uses netstat (much faster than PowerShell Get-NetTCPConnection cold start).
 * - POSIX: uses lsof.
 * No-op if nothing is listening.
 */
import { execFileSync } from "node:child_process";

const port = process.env.PORT || "8787";
const startedAt = Date.now();

function log(msg) {
  process.stdout.write(`[free-port] ${msg}\n`);
}

function getPidsForWindows(targetPort) {
  // netstat -ano: list all connections with owning PID; no PowerShell cold start.
  const out = execFileSync("cmd.exe", ["/d", "/c", `netstat -ano -p tcp`], {
    encoding: "utf8",
    windowsHide: true,
  });

  const pids = new Set();
  for (const line of out.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed.toUpperCase().startsWith("TCP")) {
      continue;
    }
    if (!/\bLISTENING\b/i.test(trimmed)) {
      continue;
    }
    // Columns: Proto  Local Address  Foreign Address  State  PID
    const cols = trimmed.split(/\s+/);
    const local = cols[1] ?? "";
    const pid = cols[cols.length - 1];
    const portMatch = local.match(/:(\d+)$/);
    if (portMatch && portMatch[1] === String(targetPort) && /^\d+$/.test(pid)) {
      pids.add(pid);
    }
  }
  return [...pids];
}

function getPidsForPosix(targetPort) {
  const out = execFileSync("lsof", [`-tiTCP:${targetPort}`, "-sTCP:LISTEN"], {
    encoding: "utf8",
  });

  return out.trim().split(/\s+/).filter(Boolean);
}

try {
  log(`scanning port ${port}...`);
  const pids =
    process.platform === "win32"
      ? getPidsForWindows(port)
      : getPidsForPosix(port);

  if (pids.length === 0) {
    log(`port ${port} is free (${Date.now() - startedAt} ms)`);
  } else {
    log(`killing pids on port ${port}: ${pids.join(", ")}`);
    for (const pid of pids) {
      try {
        process.kill(Number(pid), "SIGKILL");
      } catch {
        // process may have exited or PID may be inaccessible
      }
    }
    log(`done (${Date.now() - startedAt} ms)`);
  }
} catch (err) {
  log(`scan failed (${Date.now() - startedAt} ms): ${err?.message || err}`);
  // Do not block dev startup if port detection fails.
}
