import type { Logger } from 'pino';

export interface WorkerTask {
  cron: string;
  handler: () => Promise<void>;
}

export interface RegisteredWorkerTask extends WorkerTask {
  name: string;
}

export interface WorkerTaskContext {
  logger: Logger;
}

export interface WorkerTaskModule {
  cron: string;
  handler: (context: WorkerTaskContext) => Promise<void>;
}
