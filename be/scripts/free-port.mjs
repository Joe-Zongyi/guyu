/**
 * Kill process(es) listening on PORT (default 8787). Uses lsof (macOS / Linux).
 * No-op if nothing is listening.
 */
import { execSync } from 'node:child_process';

const port = process.env.PORT || '8787';

try {
  const out = execSync(`lsof -tiTCP:${port} -sTCP:LISTEN`, {
    encoding: 'utf8',
  });
  const pids = out
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  for (const pid of pids) {
    try {
      process.kill(Number(pid), 'SIGKILL');
    } catch {
      // process may have exited
    }
  }
} catch {
  // no listener
}
