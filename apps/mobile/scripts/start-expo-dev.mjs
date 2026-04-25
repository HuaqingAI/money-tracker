import { spawn } from 'node:child_process';
import { createServer } from 'node:net';

const DEFAULT_METRO_PORT = 8081;

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
