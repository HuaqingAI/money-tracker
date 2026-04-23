import * as fs from 'node:fs';
import * as os from 'node:os';
import path from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import { getTaskModulePaths, loadWorkerTasks } from './index';

describe('worker task registry', () => {
  it('discovers task modules from the tasks directory automatically', () => {
    const taskModulePaths = getTaskModulePaths();

    expect(taskModulePaths.map((modulePath) => modulePath.split(/[\\/]/).pop())).toEqual([
      'insight-analysis.ts',
      'seasonal-alert.ts',
    ]);
  });

  it('loads placeholder tasks with cron expressions and executable handlers', async () => {
    const logger = {
      info: vi.fn(),
    };

    const tasks = await loadWorkerTasks({ logger: logger as never });

    expect(tasks.map((task) => task.name).sort()).toEqual([
      'insight-analysis',
      'seasonal-alert',
    ]);
    expect(tasks.every((task) => typeof task.cron === 'string')).toBe(true);

    await Promise.all(tasks.map((task) => task.handler()));

    expect(logger.info).toHaveBeenCalledTimes(2);
  });

  it('ignores index files and test files during task discovery', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'worker-tasks-'));

    try {
      for (const fileName of ['seasonal-alert.ts', 'index.ts', 'insight-analysis.test.ts', 'insight-analysis.ts']) {
        fs.writeFileSync(path.join(directory, fileName), '');
      }

      expect(getTaskModulePaths(directory).map((modulePath) => path.basename(modulePath))).toEqual([
        'insight-analysis.ts',
        'seasonal-alert.ts',
      ]);
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });
});
