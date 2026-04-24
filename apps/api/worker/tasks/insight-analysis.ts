import type { WorkerTaskModule } from '../task';

export const cron = '0 2 * * *';

export const handler: WorkerTaskModule['handler'] = async ({ logger }) => {
  logger.info('insight analysis placeholder task executed');
};
