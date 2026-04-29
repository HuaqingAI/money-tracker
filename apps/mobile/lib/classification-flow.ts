export type ProcessingStatus =
  | 'processing'
  | 'slow'
  | 'partial'
  | 'complete'
  | 'error';

export interface ProcessingDecisionInput {
  elapsedMs: number;
  hasError: boolean;
  pendingCount: number;
  totalCount: number;
}

export function getProcessingStatus(
  input: ProcessingDecisionInput,
): ProcessingStatus {
  if (input.hasError) {
    return input.pendingCount > 0 ? 'partial' : 'error';
  }

  if (input.elapsedMs >= 30_000 && input.pendingCount > 0) {
    return 'partial';
  }

  if (input.pendingCount > 0 && input.elapsedMs >= 10_000) {
    return 'slow';
  }

  if (input.pendingCount > 0 || input.elapsedMs < 5_000) {
    return 'processing';
  }

  return 'complete';
}

export function calculateDisplayedProgress(input: {
  elapsedMs: number;
  pendingCount: number;
  totalCount: number;
}): number {
  if (input.totalCount <= 0) {
    return input.elapsedMs >= 5_000 ? 100 : Math.min(95, input.elapsedMs / 50);
  }

  const classified = Math.max(0, input.totalCount - input.pendingCount);
  const realProgress = Math.round((classified / input.totalCount) * 100);
  const theaterProgress = Math.min(95, Math.round(input.elapsedMs / 50));
  return Math.min(100, Math.max(realProgress, theaterProgress));
}
