/**
 * pino 结构化日志器
 *
 * 日志格式：JSON，包含 timestamp、level、message；调用方使用 `logger.child({ requestId })`
 * 或 logger.info({ requestId, ... }, 'msg') 附加 requestId。
 *
 * 环境行为：
 * - production：JSON 输出到文件 `LOG_FILE_PATH`（默认 `./logs/app.log`），
 *   使用 pino-roll 按大小（10MB）+ 时间（每日）轮转，保留 7 份。
 * - development / test：使用 pino-pretty 彩色输出到 stdout，便于调试。
 *
 * 环境变量：
 * - LOG_LEVEL: 日志级别（默认 info；生产 info，开发 debug）
 * - LOG_FILE_PATH: 日志文件路径（默认 ./logs/app.log，仅生产）
 * - LOG_FILE_MAX_SIZE: 单文件最大大小（默认 10m）
 * - LOG_FILE_MAX_FILES: 保留文件数（默认 7）
 */
import { type Logger, type LoggerOptions, pino, type TransportTargetOptions } from 'pino';

const isProduction = process.env.NODE_ENV === 'production';
const logLevel = process.env.LOG_LEVEL ?? (isProduction ? 'info' : 'debug');

function buildTransport(): LoggerOptions['transport'] {
  if (isProduction) {
    const target: TransportTargetOptions = {
      target: 'pino-roll',
      level: logLevel,
      options: {
        file: process.env.LOG_FILE_PATH ?? './logs/app.log',
        frequency: 'daily',
        size: process.env.LOG_FILE_MAX_SIZE ?? '10m',
        limit: {
          count: Number(process.env.LOG_FILE_MAX_FILES ?? '7'),
        },
        mkdir: true,
      },
    };
    return { targets: [target] };
  }

  // 开发/测试：pino-pretty 到 stdout
  return {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l',
      ignore: 'pid,hostname',
    },
  };
}

export const logger: Logger = pino({
  level: logLevel,
  base: {
    env: process.env.NODE_ENV ?? 'development',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: buildTransport(),
});

/**
 * 为请求创建子 logger，自动附加 requestId 到所有日志条目。
 */
export function createRequestLogger(requestId: string): Logger {
  return logger.child({ requestId });
}
