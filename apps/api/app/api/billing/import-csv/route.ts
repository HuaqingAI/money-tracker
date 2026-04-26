import {
  BILLING_IMPORT_ERROR_CODES,
  BILLING_IMPORT_MAX_FILE_SIZE_BYTES,
  type ImportCsvResult,
} from '@money-tracker/shared';
import type { NextRequest } from 'next/server';

import { errorResponse, successResponse } from '../../../../lib/api-response';
import { BillingImportError } from '../../../../lib/billing/errors';
import { getBillingImportService } from '../../../../lib/billing/import-service';
import { logger } from '../../../../lib/logger';
import { withRequestLogging } from '../../../../lib/middleware/request-logger';
import {
  AuthenticatedUserError,
  requireAuthenticatedUser,
} from '../../../../lib/middleware/require-authenticated-user';

function toErrorResponse(error: unknown): Response {
  if (error instanceof AuthenticatedUserError) {
    return errorResponse(error.code, error.message, error.status);
  }

  if (error instanceof BillingImportError) {
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

export function POST(request: NextRequest): Promise<Response> {
  return withRequestLogging(request, async () => {
    try {
      const { user } = await requireAuthenticatedUser(request);
      const formData = await request.formData();
      const file = formData.get('file');

      if (!(file instanceof File)) {
        return errorResponse(
          BILLING_IMPORT_ERROR_CODES.invalidImportRequest,
          '请上传 CSV 账单文件',
          400,
        );
      }

      if (!isCsvFile(file)) {
        return errorResponse(
          BILLING_IMPORT_ERROR_CODES.invalidCsvFile,
          '请选择 .csv 格式的账单文件',
          400,
        );
      }

      if (file.size > BILLING_IMPORT_MAX_FILE_SIZE_BYTES) {
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

      return successResponse<ImportCsvResult>(result);
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}
