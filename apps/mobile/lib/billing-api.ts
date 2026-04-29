import {
  type ApiResponse,
  BILLING_IMPORT_MAX_FILE_SIZE_BYTES,
  BILLING_ROUTE_PATHS,
  type ConfirmBulkTransactionsResult,
  confirmBulkTransactionsResultSchema,
  type ConfirmTransactionResult,
  confirmTransactionResultSchema,
  type ImportCsvResult,
  type PendingConfirmationsResult,
  pendingConfirmationsResultSchema,
  type RejectTransactionResult,
  rejectTransactionResultSchema,
} from '@money-tracker/shared';

import { ApiClientError } from './api-client';
import { getApiUrl } from './runtime-config';

export interface BillingCsvUploadFile {
  mimeType?: string | null;
  name: string;
  size?: number | null;
  uri: string;
}

function createCsvFormData(file: BillingCsvUploadFile): FormData {
  const formData = new FormData();
  formData.append('file', {
    name: file.name,
    type: file.mimeType ?? 'text/csv',
    uri: file.uri,
  } as unknown as Blob);
  return formData;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isImportCsvResult(value: unknown): value is ImportCsvResult {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.totalCount === 'number' &&
    typeof value.importedCount === 'number' &&
    typeof value.duplicateCount === 'number' &&
    typeof value.failedCount === 'number' &&
    typeof value.importId === 'string' &&
    (value.platform === 'alipay' || value.platform === 'wechat')
  );
}

function isApiResponse(value: unknown): value is ApiResponse<ImportCsvResult> {
  if (!isRecord(value) || typeof value.success !== 'boolean') {
    return false;
  }

  if (value.success) {
    return isImportCsvResult(value.data);
  }

  return (
    isRecord(value.error) &&
    typeof value.error.code === 'string' &&
    typeof value.error.message === 'string'
  );
}

function isApiError(value: unknown): value is { code: string; message: string } {
  return (
    isRecord(value) &&
    typeof value.code === 'string' &&
    typeof value.message === 'string'
  );
}

async function parseResponse(
  response: Response,
): Promise<ApiResponse<ImportCsvResult>> {
  let json: unknown;

  try {
    json = await response.json();
  } catch {
    throw new ApiClientError(
      'INVALID_RESPONSE',
      response.status,
      response.ok ? '服务端返回了不可解析的响应' : '服务暂时不可用，请稍后重试',
    );
  }

  if (!isApiResponse(json)) {
    throw new ApiClientError(
      'INVALID_RESPONSE',
      response.status,
      response.ok ? '服务端返回了不可识别的响应' : '服务暂时不可用，请稍后重试',
    );
  }

  return json;
}

async function parseJsonResponse<T>(
  response: Response,
  parseData: (value: unknown) => T,
): Promise<ApiResponse<T>> {
  let json: unknown;

  try {
    json = await response.json();
  } catch {
    throw new ApiClientError(
      'INVALID_RESPONSE',
      response.status,
      response.ok ? '服务端返回了不可解析的响应' : '服务暂时不可用，请稍后重试',
    );
  }

  if (!isRecord(json) || typeof json.success !== 'boolean') {
    throw new ApiClientError(
      'INVALID_RESPONSE',
      response.status,
      response.ok ? '服务端返回了不可识别的响应' : '服务暂时不可用，请稍后重试',
    );
  }

  if (!json.success) {
    if (!isApiError(json.error)) {
      throw new ApiClientError(
        'INVALID_RESPONSE',
        response.status,
        '服务端返回了不可识别的错误响应',
      );
    }

    return {
      success: false,
      error: json.error,
    };
  }

  return {
    success: true,
    data: parseData(json.data),
  };
}

function authHeaders(accessToken: string): Record<string, string> {
  return {
    Accept: 'application/json',
    Authorization: `Bearer ${accessToken}`,
  };
}

async function requestJson<T>(
  accessToken: string,
  path: string,
  options: RequestInit,
  parseData: (value: unknown) => T,
): Promise<T> {
  const response = await fetch(`${getApiUrl()}${path}`, {
    ...options,
    headers: {
      ...authHeaders(accessToken),
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });
  const payload = await parseJsonResponse(response, parseData);

  if (!payload.success) {
    throw new ApiClientError(
      payload.error.code,
      response.status,
      payload.error.message,
    );
  }

  return payload.data;
}

export async function uploadBillingCsv(
  accessToken: string,
  file: BillingCsvUploadFile,
): Promise<ImportCsvResult> {
  if (!file.name.toLowerCase().endsWith('.csv')) {
    throw new ApiClientError('INVALID_CSV_FILE', 400, '请选择 .csv 格式的账单文件');
  }

  if (typeof file.size === 'number' && file.size > BILLING_IMPORT_MAX_FILE_SIZE_BYTES) {
    throw new ApiClientError('IMPORT_FILE_TOO_LARGE', 413, 'CSV 文件不能超过 10MB');
  }

  const response = await fetch(`${getApiUrl()}${BILLING_ROUTE_PATHS.importCsv}`, {
    method: 'POST',
    headers: {
      ...authHeaders(accessToken),
    },
    body: createCsvFormData(file),
  });
  const payload = await parseResponse(response);

  if (!payload.success) {
    throw new ApiClientError(
      payload.error.code,
      response.status,
      payload.error.message,
    );
  }

  return payload.data;
}

export function fetchPendingConfirmations(
  accessToken: string,
): Promise<PendingConfirmationsResult> {
  return requestJson(
    accessToken,
    BILLING_ROUTE_PATHS.pendingConfirmations,
    { method: 'GET' },
    (value) => pendingConfirmationsResultSchema.parse(value),
  );
}

export function confirmTransaction(
  accessToken: string,
  transactionId: string,
  input: { categoryId?: string } = {},
): Promise<ConfirmTransactionResult> {
  return requestJson(
    accessToken,
    `${BILLING_ROUTE_PATHS.transactionConfirmBase}/${transactionId}/confirm`,
    {
      ...(input.categoryId
        ? { body: JSON.stringify({ categoryId: input.categoryId }) }
        : {}),
      method: 'POST',
    },
    (value) => confirmTransactionResultSchema.parse(value),
  );
}

export function rejectTransaction(
  accessToken: string,
  input: {
    categoryId?: string;
    transactionId: string;
  },
): Promise<RejectTransactionResult> {
  return requestJson(
    accessToken,
    `${BILLING_ROUTE_PATHS.transactionConfirmBase}/${input.transactionId}/reject`,
    {
      ...(input.categoryId
        ? { body: JSON.stringify({ categoryId: input.categoryId }) }
        : {}),
      method: 'POST',
    },
    (value) => rejectTransactionResultSchema.parse(value),
  );
}

export function confirmBulkTransactions(
  accessToken: string,
  transactionIds: string[],
): Promise<ConfirmBulkTransactionsResult> {
  return requestJson(
    accessToken,
    BILLING_ROUTE_PATHS.confirmBulk,
    {
      body: JSON.stringify({ transactionIds }),
      method: 'POST',
    },
    (value) => confirmBulkTransactionsResultSchema.parse(value),
  );
}
