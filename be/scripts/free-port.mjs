/**
 * Kill process(es) listening on PORT (default 8787).
 * Supports Windows via PowerShell and POSIX systems via lsof.
 * No-op if nothing is listening.
 */
import { execFileSync } from 'node:child_process';

const port = process.env.PORT || '8787';

function getPidsForWindows(targetPort) {
  const out = execFileSync(
    'powershell',
    [
      '-NoProfile',
      '-Command',
      `Get-NetTCPConnection -LocalPort ${targetPort} -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess`,
    ],
    {
      encoding: 'utf8',
    },
  );

  return out
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function getPidsForPosix(targetPort) {
  const out = execFileSync('lsof', [`-tiTCP:${targetPort}`, '-sTCP:LISTEN'], {
    encoding: 'utf8',
  });

  return out
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

try {
  const pids =
    process.platform === 'win32'
      ? getPidsForWindows(port)
      : getPidsForPosix(port);

  for (const pid of pids) {
    try {
      process.kill(Number(pid), 'SIGKILL');
    } catch {
      // process may have exited or PID may be inaccessible
    }
  }
} catch {
  // no listener or command unavailable
}
