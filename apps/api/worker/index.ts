import '../sentry.server.config';

import { logger } from '../lib/logger';
import { createScheduledTasks, startScheduledTasks } from './scheduler';
import { loadWorkerTasks } from './tasks';

async function main(): Promise<void> {
  const workerTasks = await loadWorkerTasks();
  const scheduledTasks = createScheduledTasks(workerTasks, {
    logger,
    onError: (error) => {
      logger.error({ err: error }, 'worker task execution failed');
    },
  });

  startScheduledTasks(scheduledTasks, logger);
  logger.info({ tasks: scheduledTasks.map((task) => task.name) }, 'worker started');

  function shutdown(signal: NodeJS.Signals): void {
    logger.info({ signal }, 'worker shutting down');
    for (const task of scheduledTasks) {
      task.scheduledTask.destroy();
    }
    process.exit(0);
  }

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((error) => {
  logger.fatal({ err: error }, 'worker failed to start');
  process.exit(1);
});
