import type { BillingConfirmationErrorCode } from '@money-tracker/shared';

export class BillingConfirmationError extends Error {
  constructor(
    public readonly code: BillingConfirmationErrorCode,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'BillingConfirmationError';
  }
}
