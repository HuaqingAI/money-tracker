import type { BillingImportErrorCode } from '@money-tracker/shared';

export class BillingImportError extends Error {
  constructor(
    public readonly code: BillingImportErrorCode,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'BillingImportError';
  }
}

