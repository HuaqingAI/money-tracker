import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_METRO_PORT = 8081;
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '../../..');

function parseEnvLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) {
    return null;
  }

  const separatorIndex = trimmed.indexOf('=');
  if (separatorIndex <= 0) {
    return null;
  }

  const key = trimmed.slice(0, separatorIndex).trim();
  let value = trimmed.slice(separatorIndex + 1).trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return [key, value];
}

function expandEnvValue(value) {
  return value.replace(
    /(?<!\\)\$\{?([A-Za-z_][A-Za-z0-9_]*)\}?/gu,
    (_match, key) => process.env[key] ?? '',
  ).replace(/\\\$/gu, '$');
}

function loadRootEnv() {
  for (const file of ['.env.local']) {
    const path = resolve(REPO_ROOT, file);
    if (!existsSync(path)) {
      continue;
    }

    const content = readFileSync(path, 'utf8');
    for (const line of content.split(/\r?\n/u)) {
      const parsed = parseEnvLine(line);
      if (!parsed) {
        continue;
      }

      const [key, value] = parsed;
      process.env[key] = expandEnvValue(value);
    }
  }
}

loadRootEnv();

function canUsePort(port) {
  return new Promise((resolve) => {
    const server = createServer();

    server.once('error', () => {
      resolve(false);
    });

    server.once('listening', () => {
      server.close(() => {
        resolve(true);
      });
    });

    server.listen(port);
  });
}

async function findAvailablePort(startPort) {
  let port = startPort;

  while (!(await canUsePort(port))) {
    port += 1;
  }

  return port;
}

const requestedPort = Number.parseInt(
  process.env.EXPO_DEV_PORT ?? process.env.RCT_METRO_PORT ?? `${DEFAULT_METRO_PORT}`,
  10,
);
const startPort = Number.isNaN(requestedPort) ? DEFAULT_METRO_PORT : requestedPort;
const port = await findAvailablePort(startPort);

if (port !== startPort) {
  console.log(`Metro port ${startPort} is unavailable; starting Expo on ${port}.`);
}

const child = spawn('expo', ['start', '--port', `${port}`], {
  env: {
    ...process.env,
    EXPO_OFFLINE: process.env.EXPO_OFFLINE ?? '1',
    RCT_METRO_PORT: `${port}`,
  },
  shell: true,
  stdio: 'inherit',
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
