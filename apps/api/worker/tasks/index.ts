import * as fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { logger } from '../../lib/logger';
import type { RegisteredWorkerTask, WorkerTaskContext, WorkerTaskModule } from '../task';

export function createTaskContext(): WorkerTaskContext {
  return { logger };
}

function isTaskFile(fileName: string): boolean {
  return (
    !fileName.startsWith('index.') &&
    !fileName.endsWith('.test.ts') &&
    !fileName.endsWith('.test.js') &&
    ['.ts', '.js'].includes(path.extname(fileName))
  );
}

export function getTaskModulePaths(directory: string = __dirname): string[] {
  return fs
    .readdirSync(directory)
    .filter(isTaskFile)
    .sort()
    .map((fileName) => path.join(directory, fileName));
}

async function importTaskModule(modulePath: string): Promise<WorkerTaskModule> {
  const importedModule = await import(pathToFileURL(modulePath).href);
  return ((importedModule.default as WorkerTaskModule | undefined) ?? importedModule) as WorkerTaskModule;
}

export async function loadWorkerTasks(
  context: WorkerTaskContext = createTaskContext(),
  modulePaths: string[] = getTaskModulePaths(),
): Promise<RegisteredWorkerTask[]> {
  return Promise.all(
    modulePaths.map(async (modulePath) => {
      const taskModule = await importTaskModule(modulePath);
      const name = path.basename(modulePath, path.extname(modulePath));

      return {
        name,
        cron: taskModule.cron,
        handler: () => taskModule.handler(context),
      };
    }),
  );
}
