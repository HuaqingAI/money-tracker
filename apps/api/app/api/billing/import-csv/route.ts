import {
  BILLING_IMPORT_ERROR_CODES,
  BILLING_IMPORT_MAX_FILE_SIZE_BYTES,
  type ImportCsvResult,
} from '@money-tracker/shared';
import type { NextRequest } from 'next/server';
import { after } from 'next/server';

import { errorResponse, successResponse } from '../../../../lib/api-response';
import { ensurePersistentUser } from '../../../../lib/auth/ensure-persistent-user';
import { BillingImportError } from '../../../../lib/billing/errors';
import { getBillingImportService } from '../../../../lib/billing/import-service';
import { logger } from '../../../../lib/logger';
import { withRequestLogging } from '../../../../lib/middleware/request-logger';
import {
  AuthenticatedUserError,
  requireAuthenticatedUser,
} from '../../../../lib/middleware/require-authenticated-user';
import { getClassifyService } from '../../../../lib/services/classify-service';

function getFileLogContext(file: File) {
  return {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type || null,
  };
}

function toErrorResponse(error: unknown): Response {
  if (error instanceof AuthenticatedUserError) {
    return errorResponse(error.code, error.message, error.status);
  }

  if (error instanceof BillingImportError) {
    logger.warn(
      {
        errorCode: error.code,
        status: error.status,
      },
      'billing import rejected',
    );
    return errorResponse(error.code, error.message, error.status);
  }

  logger.error({ err: error }, 'billing import failed');

  return errorResponse(
    BILLING_IMPORT_ERROR_CODES.importServiceUnavailable,
    '账单导入失败，请稍后重试',
    500,
  );
}

function isCsvFile(file: File): boolean {
  return file.name.toLowerCase().endsWith('.csv');
}

function toPublicImportResult(result: ImportCsvResult): ImportCsvResult {
  return {
    duplicateCount: result.duplicateCount,
    failedCount: result.failedCount,
    importId: result.importId,
    importedCount: result.importedCount,
    platform: result.platform,
    totalCount: result.totalCount,
  };
}

async function classifyImportedTransactions(input: {
  importedTransactionIds: string[];
  userId: string;
}): Promise<void> {
  logger.info(
    {
      importedTransactionCount: input.importedTransactionIds.length,
      mode: 'imported-batch',
    },
    'post-import classification started',
  );

  const classification = await getClassifyService().classifyPendingTransactions({
    transactionIds: input.importedTransactionIds,
    userId: input.userId,
  });

  if (classification.failedCount > 0) {
    logger.error(
      { classification },
      'post-import classification partially failed',
    );
    return;
  }

  logger.info({ classification }, 'post-import classification completed');
}

export function POST(request: NextRequest): Promise<Response> {
  return withRequestLogging(request, async () => {
    try {
      const { user } = await requireAuthenticatedUser(request);
      await ensurePersistentUser(user);

      const formData = await request.formData();
      const file = formData.get('file');

      if (!(file instanceof File)) {
        logger.warn(
          { errorCode: BILLING_IMPORT_ERROR_CODES.invalidImportRequest },
          'billing import rejected',
        );
        return errorResponse(
          BILLING_IMPORT_ERROR_CODES.invalidImportRequest,
          '请上传 CSV 账单文件',
          400,
        );
      }

      if (!isCsvFile(file)) {
        logger.warn(
          {
            ...getFileLogContext(file),
            errorCode: BILLING_IMPORT_ERROR_CODES.invalidCsvFile,
          },
          'billing import rejected',
        );
        return errorResponse(
          BILLING_IMPORT_ERROR_CODES.invalidCsvFile,
          '请选择 .csv 格式的账单文件',
          400,
        );
      }

      if (file.size > BILLING_IMPORT_MAX_FILE_SIZE_BYTES) {
        logger.warn(
          {
            ...getFileLogContext(file),
            errorCode: BILLING_IMPORT_ERROR_CODES.importFileTooLarge,
          },
          'billing import rejected',
        );
        return errorResponse(
          BILLING_IMPORT_ERROR_CODES.importFileTooLarge,
          'CSV 文件不能超过 10MB',
          413,
        );
      }

      const result = await getBillingImportService().importCsv({
        bytes: new Uint8Array(await file.arrayBuffer()),
        fileName: file.name,
        userId: user.id,
      });
      logger.info(
        {
          duplicateCount: result.duplicateCount,
          failedCount: result.failedCount,
          importedCount: result.importedCount,
          platform: result.platform,
          totalCount: result.totalCount,
        },
        'billing import completed',
      );

      if (result.importedTransactionIds.length > 0) {
        logger.info(
          {
            duplicateCount: result.duplicateCount,
            importedTransactionCount: result.importedTransactionIds.length,
          },
          'post-import classification scheduled',
        );
        after(async () => {
          try {
            await classifyImportedTransactions({
              importedTransactionIds: result.importedTransactionIds,
              userId: user.id,
            });
          } catch (error) {
            logger.error(
              { err: error },
              'post-import classification failed after import success',
            );
          }
        });
      }

      return successResponse<ImportCsvResult>(toPublicImportResult(result));
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}
