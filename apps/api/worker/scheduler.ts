import * as Sentry from '@sentry/nextjs';
import cron, { type ScheduledTask } from 'node-cron';
import type { Logger } from 'pino';

import { logger as defaultLogger } from '../lib/logger';
import type { RegisteredWorkerTask } from './task';

interface SchedulerOptions {
  logger?: Logger;
  onError?: (error: unknown) => void;
}

export interface RegisteredCronTask {
  name: string;
  cron: string;
  scheduledTask: ScheduledTask;
}

async function runWithRetry(task: RegisteredWorkerTask, logger: Logger): Promise<void> {
  const taskLogger = logger.child({ task: task.name });

  try {
    taskLogger.info('worker task started');
    await task.handler();
    taskLogger.info('worker task completed');
    return;
  } catch (firstError) {
    taskLogger.warn({ err: firstError }, 'worker task failed; retrying once');
  }

  try {
    await task.handler();
    taskLogger.info('worker task completed after retry');
  } catch (finalError) {
    taskLogger.error({ err: finalError }, 'worker task failed after retry');
    Sentry.captureException(finalError, { tags: { workerTask: task.name } });
    throw finalError;
  }
}

export function createScheduledTasks(
  tasks: RegisteredWorkerTask[],
  options: SchedulerOptions = {},
): RegisteredCronTask[] {
  const logger = options.logger ?? defaultLogger;

  return tasks.map((task) => {
    if (!cron.validate(task.cron)) {
      throw new Error(`Invalid cron expression for worker task "${task.name}": ${task.cron}`);
    }

    const scheduledTask = cron.createTask(
      task.cron,
      async () => {
        try {
          await runWithRetry(task, logger);
        } catch (error) {
          options.onError?.(error);
        }
      },
      {
        name: task.name,
        noOverlap: true,
      },
    );

    return {
      name: task.name,
      cron: task.cron,
      scheduledTask,
    };
  });
}

export function startScheduledTasks(tasks: RegisteredCronTask[], logger: Logger = defaultLogger): void {
  for (const task of tasks) {
    task.scheduledTask.start();
    logger.info({ task: task.name, cron: task.cron }, 'worker task scheduled');
  }
}
