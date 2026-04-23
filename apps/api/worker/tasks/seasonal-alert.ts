import type { WorkerTaskModule } from '../task';

export const cron = '30 2 * * *';

export const handler: WorkerTaskModule['handler'] = async ({ logger }) => {
  logger.info('seasonal alert placeholder task executed');
};
