import { logger } from '../../lib/logger';
import type { RegisteredWorkerTask, WorkerTaskContext, WorkerTaskModule } from '../task';
import * as insightAnalysis from './insight-analysis';
import * as seasonalAlert from './seasonal-alert';

const taskModules: Record<string, WorkerTaskModule> = {
  'insight-analysis': insightAnalysis,
  'seasonal-alert': seasonalAlert,
};

export function createTaskContext(): WorkerTaskContext {
  return { logger };
}

export function loadWorkerTasks(context: WorkerTaskContext = createTaskContext()): RegisteredWorkerTask[] {
  return Object.entries(taskModules).map(([name, taskModule]) => ({
    name,
    cron: taskModule.cron,
    handler: () => taskModule.handler(context),
  }));
}
