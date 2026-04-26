import {
  BILLING_IMPORT_MAX_FILE_SIZE_BYTES,
  BILLING_ROUTE_PATHS,
  type ApiResponse,
  type ImportCsvResult,
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

async function parseResponse(response: Response): Promise<ApiResponse<ImportCsvResult>> {
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

  return json as ApiResponse<ImportCsvResult>;
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
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
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

