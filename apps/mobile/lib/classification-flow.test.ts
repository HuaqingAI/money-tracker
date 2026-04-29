import { describe, expect, it } from 'vitest';

import { calculateDisplayedProgress, getProcessingStatus } from './classification-flow';

describe('classification-flow', () => {
  it('keeps processing active for at least five seconds', () => {
    expect(
      getProcessingStatus({
        elapsedMs: 4_999,
        hasError: false,
        pendingCount: 0,
        totalCount: 10,
      }),
    ).toBe('processing');
    expect(
      getProcessingStatus({
        elapsedMs: 5_000,
        hasError: false,
        pendingCount: 0,
        totalCount: 10,
      }),
    ).toBe('complete');
  });

  it('marks long pending batches as partial after thirty seconds', () => {
    expect(
      getProcessingStatus({
        elapsedMs: 12_000,
        hasError: false,
        pendingCount: 3,
        totalCount: 10,
      }),
    ).toBe('slow');
    expect(
      getProcessingStatus({
        elapsedMs: 30_000,
        hasError: false,
        pendingCount: 3,
        totalCount: 10,
      }),
    ).toBe('partial');
  });

  it('uses partial state for errors with usable pending data', () => {
    expect(
      getProcessingStatus({
        elapsedMs: 2_000,
        hasError: true,
        pendingCount: 2,
        totalCount: 2,
      }),
    ).toBe('partial');
    expect(
      getProcessingStatus({
        elapsedMs: 2_000,
        hasError: true,
        pendingCount: 0,
        totalCount: 0,
      }),
    ).toBe('error');
  });

  it('combines theater progress with real progress', () => {
    expect(
      calculateDisplayedProgress({
        elapsedMs: 1_000,
        pendingCount: 8,
        totalCount: 10,
      }),
    ).toBe(20);
    expect(
      calculateDisplayedProgress({
        elapsedMs: 3_000,
        pendingCount: 9,
        totalCount: 10,
      }),
    ).toBe(60);
  });

  it('treats classified pending confirmations as completed work', () => {
    expect(
      getProcessingStatus({
        elapsedMs: 5_000,
        hasError: false,
        pendingCount: 0,
        totalCount: 4,
      }),
    ).toBe('complete');
    expect(
      calculateDisplayedProgress({
        elapsedMs: 5_000,
        pendingCount: 0,
        totalCount: 4,
      }),
    ).toBe(100);
  });
});
