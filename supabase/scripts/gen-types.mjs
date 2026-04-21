import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const defaultEnvPath = join(repoRoot, 'supabase', '.env');
const outputPath = join(repoRoot, 'packages', 'shared', 'types', 'database.ts');

function stripQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;

  const content = readFileSync(filePath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = stripQuotes(trimmed.slice(separatorIndex + 1).trim());

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function shellEscapeSingleQuoted(value) {
  return value.replace(/'/g, `'"'"'`);
}

loadEnvFile(defaultEnvPath);

const dbUrl =
  process.env.SUPABASE_DB_URL ||
  `postgresql://${process.env.SUPABASE_DB_USER || 'supabase_admin'}:${encodeURIComponent(requireEnv('POSTGRES_PASSWORD'))}` +
    `@${process.env.SUPABASE_DB_HOST || 'db'}:${process.env.POSTGRES_PORT || '5432'}/${process.env.POSTGRES_DB || 'postgres'}`;

const dockerSocketMount =
  process.env.SUPABASE_DOCKER_SOCKET_MOUNT ||
  (process.platform === 'win32'
    ? '//var/run/docker.sock:/var/run/docker.sock'
    : '/var/run/docker.sock:/var/run/docker.sock');

const dockerNetwork = process.env.SUPABASE_DOCKER_NETWORK || 'supabase-slim_default';

const result = spawnSync(
  'docker',
  [
    'run',
    '--rm',
    '--network',
    dockerNetwork,
    '-v',
    dockerSocketMount,
    '-v',
    `${repoRoot.replace(/\\/g, '/') }:/workspace`,
    '-w',
    '/workspace',
    'node:22-alpine',
    'sh',
    '-lc',
    `npx supabase gen types typescript --db-url '${shellEscapeSingleQuoted(dbUrl)}' --schema auth,billing,analytics --network-id '${shellEscapeSingleQuoted(dockerNetwork)}'`,
  ],
  {
    cwd: repoRoot,
    encoding: 'utf8',
    env: process.env,
  },
);

if (result.status !== 0) {
  if (result.stdout) process.stderr.write(result.stdout);
  process.stderr.write(result.stderr || 'Type generation failed.\n');
  process.exit(result.status ?? 1);
}

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, result.stdout, 'utf8');
process.stdout.write(`Generated ${outputPath}\n`);
