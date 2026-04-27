import {
  BILLING_IMPORT_ERROR_CODES,
  csvRuleUpdateInputSchema,
} from '@money-tracker/shared';
import type { NextRequest } from 'next/server';

import { errorResponse, successResponse } from '../../../../lib/api-response';
import { getCsvRuleRepository } from '../../../../lib/billing/csv-rule-repository';
import { BillingImportError } from '../../../../lib/billing/errors';
import { withRequestLogging } from '../../../../lib/middleware/request-logger';

interface CsvRuleUpdateResult {
  isActive: boolean;
  platform: string;
  version: string;
}

function getRequestAdminToken(request: NextRequest): string | null {
  const headerToken = request.headers.get('x-admin-token');
  if (headerToken) {
    return headerToken;
  }

  const authorization = request.headers.get('authorization');
  const [scheme, token] = authorization?.split(' ') ?? [];
  return scheme?.toLowerCase() === 'bearer' && token ? token : null;
}

function validateAdminToken(request: NextRequest): Response | null {
  const configuredToken = process.env.CSV_RULES_ADMIN_TOKEN;
  if (!configuredToken) {
    return errorResponse(
      BILLING_IMPORT_ERROR_CODES.csvRulesUnauthorized,
      'CSV 规则管理密钥未配置',
      503,
    );
  }

  if (getRequestAdminToken(request) !== configuredToken) {
    return errorResponse(
      BILLING_IMPORT_ERROR_CODES.csvRulesUnauthorized,
      '无权更新 CSV 解析规则',
      401,
    );
  }

  return null;
}

function toErrorResponse(error: unknown): Response {
  if (error instanceof BillingImportError) {
    return errorResponse(error.code, error.message, error.status);
  }

  return errorResponse(
    BILLING_IMPORT_ERROR_CODES.csvRulesUpdateFailed,
    '更新 CSV 解析规则失败',
    500,
  );
}

export function PUT(request: NextRequest): Promise<Response> {
  return withRequestLogging(request, async () => {
    const unauthorized = validateAdminToken(request);
    if (unauthorized) {
      return unauthorized;
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse(
        BILLING_IMPORT_ERROR_CODES.invalidImportRequest,
        '请求体必须是合法 JSON',
        400,
      );
    }

    const parsed = csvRuleUpdateInputSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(
        BILLING_IMPORT_ERROR_CODES.invalidCsvRule,
        parsed.error.issues[0]?.message ?? 'CSV 解析规则无效',
        400,
      );
    }

    if (parsed.data.platform !== parsed.data.ruleConfig.platform) {
      return errorResponse(
        BILLING_IMPORT_ERROR_CODES.invalidCsvRule,
        '规则平台必须与 ruleConfig.platform 一致',
        400,
      );
    }

    try {
      const row = await getCsvRuleRepository().upsertRule(parsed.data);
      return successResponse<CsvRuleUpdateResult>({
        isActive: row.is_active,
        platform: row.platform,
        version: row.version,
      });
    } catch (error) {
      return toErrorResponse(error);
    }
  });
}

