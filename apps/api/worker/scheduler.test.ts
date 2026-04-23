import { beforeEach, describe, expect, it, vi } from 'vitest';

const { captureExceptionMock, createTaskMock, validateMock } = vi.hoisted(() => ({
  captureExceptionMock: vi.fn(),
  createTaskMock: vi.fn(),
  validateMock: vi.fn(),
}));

vi.mock('@sentry/nextjs', () => ({
  captureException: captureExceptionMock,
}));

vi.mock('node-cron', () => ({
  default: {
    createTask: createTaskMock,
    validate: validateMock,
  },
}));

import { createScheduledTasks, startScheduledTasks } from './scheduler';
import type { RegisteredWorkerTask } from './task';

function createLogger() {
  return {
    child: vi.fn(() => ({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    })),
    info: vi.fn(),
  } as never;
}

describe('worker scheduler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    validateMock.mockReturnValue(true);
    createTaskMock.mockImplementation((_expression, handler, options) => ({
      handler,
      options,
      start: vi.fn(),
      destroy: vi.fn(),
    }));
  });

  it('creates stopped cron tasks with no-overlap scheduling options', () => {
    const tasks: RegisteredWorkerTask[] = [
      {
        name: 'demo',
        cron: '0 2 * * *',
        handler: vi.fn(async () => undefined),
      },
    ];

    const scheduledTasks = createScheduledTasks(tasks, { logger: createLogger() });

    expect(validateMock).toHaveBeenCalledWith('0 2 * * *');
    expect(createTaskMock).toHaveBeenCalledWith('0 2 * * *', expect.any(Function), {
      name: 'demo',
      noOverlap: true,
    });
    expect(scheduledTasks).toHaveLength(1);
    expect(scheduledTasks[0]?.name).toBe('demo');
  });

  it('retries once and reports final failures to sentry', async () => {
    const error = new Error('boom');
    const handler = vi.fn(async () => {
      throw error;
    });
    const onError = vi.fn();

    createScheduledTasks(
      [
        {
          name: 'failing-task',
          cron: '0 2 * * *',
          handler,
        },
      ],
      { logger: createLogger(), onError },
    );

    const scheduledHandler = createTaskMock.mock.calls[0]?.[1] as () => Promise<void>;
    await scheduledHandler();

    expect(handler).toHaveBeenCalledTimes(2);
    expect(captureExceptionMock).toHaveBeenCalledWith(error, {
      tags: { workerTask: 'failing-task' },
    });
    expect(onError).toHaveBeenCalledWith(error);
  });

  it('starts registered cron tasks explicitly from the worker entrypoint', () => {
    const start = vi.fn();
    const logger = { info: vi.fn() } as never;

    startScheduledTasks(
      [
        {
          name: 'demo',
          cron: '0 2 * * *',
          scheduledTask: { start } as never,
        },
      ],
      logger,
    );

    expect(start).toHaveBeenCalledOnce();
  });

  it('rejects invalid cron expressions before registration', () => {
    validateMock.mockReturnValue(false);

    expect(() =>
      createScheduledTasks(
        [
          {
            name: 'bad-task',
            cron: 'not cron',
            handler: vi.fn(async () => undefined),
          },
        ],
        { logger: createLogger() },
      ),
    ).toThrow('Invalid cron expression for worker task "bad-task": not cron');
  });
});
