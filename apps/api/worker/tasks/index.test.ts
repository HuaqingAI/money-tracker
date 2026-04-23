import { describe, expect, it, vi } from 'vitest';

import { loadWorkerTasks } from './index';

describe('worker task registry', () => {
  it('loads placeholder tasks with cron expressions and executable handlers', async () => {
    const logger = {
      info: vi.fn(),
    };

    const tasks = loadWorkerTasks({ logger: logger as never });

    expect(tasks.map((task) => task.name).sort()).toEqual([
      'insight-analysis',
      'seasonal-alert',
    ]);
    expect(tasks.every((task) => typeof task.cron === 'string')).toBe(true);

    await Promise.all(tasks.map((task) => task.handler()));

    expect(logger.info).toHaveBeenCalledTimes(2);
  });
});
