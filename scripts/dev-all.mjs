/**
 * Run NestJS backend (be) and Next.js frontend (web) in parallel.
 *
 * Usage:
 *   node scripts/dev-all.mjs
 *   npm run dev   (from repository root)
 *
 * Requires Node 20+ (same as be/web). Stops both processes on Ctrl+C or if either exits.
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

const beDir = path.join(root, 'be');
const webDir = path.join(root, 'web');

/** @type {import('node:child_process').ChildProcess[]} */
const children = [];

/**
 * @param {string} cwd
 * @param {string} command
 */
function run(cwd, command) {
  const child = spawn(command, {
    cwd,
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, FORCE_COLOR: '1' },
  });
  children.push(child);
  return child;
}

const be = run(beDir, 'npm run start:dev');
const web = run(webDir, 'npm run dev');

let shuttingDown = false;

/**
 * @param {number} code
 */
function shutdown(code) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const c of children) {
    if (c.exitCode === null && c.signalCode === null) {
      try {
        c.kill('SIGTERM');
      } catch {
        // ignore
      }
    }
  }
  setTimeout(() => process.exit(code), 500);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

/**
 * @param {string} label
 * @param {number | null} code
 * @param {NodeJS.Signals | null} signal
 */
function onChildExit(label, code, signal) {
  if (shuttingDown) return;
  const fail = code !== 0 || signal;
  if (fail) {
    console.error(`[dev-all] ${label} stopped (code=${code}, signal=${signal ?? 'none'})`);
    shutdown(code ?? 1);
  } else {
    console.error(`[dev-all] ${label} exited; stopping the other process.`);
    shutdown(0);
  }
}

be.on('exit', (code, signal) => onChildExit('backend', code, signal));
web.on('exit', (code, signal) => onChildExit('frontend', code, signal));

be.on('error', (err) => {
  console.error('[dev-all] backend spawn error:', err);
  shutdown(1);
});
web.on('error', (err) => {
  console.error('[dev-all] frontend spawn error:', err);
  shutdown(1);
});
