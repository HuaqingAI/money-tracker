import '../sentry.server.config';

import { logger } from '../lib/logger';
import { createScheduledTasks, startScheduledTasks } from './scheduler';
import { loadWorkerTasks } from './tasks';

const workerTasks = loadWorkerTasks();
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
