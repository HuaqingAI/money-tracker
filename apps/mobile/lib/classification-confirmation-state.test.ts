import { describe, expect, it } from 'vitest';

import {
  buildConfirmationActions,
  getConfirmationListState,
} from './classification-confirmation-state';

describe('classification-confirmation-state', () => {
  it('exposes confirm and pure reject by default', () => {
    expect(
      buildConfirmationActions({
        selectedCategoryId: 'cat-food',
        transactionCategoryId: 'cat-food',
        transactionId: 'tx-1',
      }),
    ).toEqual([
      { kind: 'confirm', transactionId: 'tx-1' },
      { kind: 'reject', transactionId: 'tx-1' },
    ]);
  });

  it('adds correction confirmation when the category changes', () => {
    expect(
      buildConfirmationActions({
        selectedCategoryId: 'cat-shopping',
        transactionCategoryId: 'cat-food',
        transactionId: 'tx-1',
      }),
    ).toEqual([
      { kind: 'confirm', transactionId: 'tx-1' },
      {
        categoryId: 'cat-shopping',
        kind: 'confirm-correction',
        transactionId: 'tx-1',
      },
      { kind: 'reject', transactionId: 'tx-1' },
    ]);
  });

  it('distinguishes empty state from still-classifying work', () => {
    expect(
      getConfirmationListState({
        hasAccessToken: true,
        isError: false,
        isLoading: false,
        transactionCount: 0,
        unclassifiedCount: 2,
      }),
    ).toBe('still-classifying');

    expect(
      getConfirmationListState({
        hasAccessToken: true,
        isError: false,
        isLoading: false,
        transactionCount: 0,
        unclassifiedCount: 0,
      }),
    ).toBe('empty');
  });

  it('blocks confirmation when the token is missing', () => {
    expect(
      getConfirmationListState({
        hasAccessToken: false,
        isError: false,
        isLoading: false,
        transactionCount: 1,
        unclassifiedCount: 0,
      }),
    ).toBe('auth-required');
  });
});
