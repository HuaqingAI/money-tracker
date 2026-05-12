import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(scriptDir, '..');
const envFiles = ['.env.local'];

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
  for (const file of envFiles) {
    const path = resolve(rootDir, file);
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

const [command, ...args] = process.argv.slice(2);
if (!command) {
  console.error('Usage: node scripts/run-with-root-env.mjs <command> [...args]');
  process.exit(1);
}

function quoteWindowsArg(value) {
  if (/^[\w./:@=-]+$/u.test(value)) {
    return value;
  }

  return `"${value.replace(/"/g, '\\"')}"`;
}

const child = process.platform === 'win32'
  ? spawn([command, ...args].map(quoteWindowsArg).join(' '), {
      env: process.env,
      shell: true,
      stdio: 'inherit',
    })
  : spawn(command, args, {
  env: process.env,
  stdio: 'inherit',
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
