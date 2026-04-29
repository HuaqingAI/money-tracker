export type ConfirmationAction =
  | { kind: 'confirm'; transactionId: string }
  | { categoryId: string; kind: 'confirm-correction'; transactionId: string }
  | { categoryId?: string; kind: 'reject'; transactionId: string };

export interface BuildConfirmationActionsInput {
  selectedCategoryId: string | null;
  transactionCategoryId: string | null;
  transactionId: string;
}

export interface ConfirmationListStateInput {
  hasAccessToken: boolean;
  isError: boolean;
  isLoading: boolean;
  transactionCount: number;
  unclassifiedCount: number;
}

export type ConfirmationListState =
  | 'auth-required'
  | 'loading'
  | 'error'
  | 'ready'
  | 'still-classifying'
  | 'empty';

export function buildConfirmationActions(
  input: BuildConfirmationActionsInput,
): ConfirmationAction[] {
  const actions: ConfirmationAction[] = [
    {
      kind: 'confirm',
      transactionId: input.transactionId,
    },
    {
      kind: 'reject',
      transactionId: input.transactionId,
    },
  ];

  if (
    input.selectedCategoryId !== null &&
    input.selectedCategoryId !== input.transactionCategoryId
  ) {
    actions.splice(1, 0, {
      categoryId: input.selectedCategoryId,
      kind: 'confirm-correction',
      transactionId: input.transactionId,
    });
  }

  return actions;
}

export function getConfirmationListState(
  input: ConfirmationListStateInput,
): ConfirmationListState {
  if (!input.hasAccessToken) {
    return 'auth-required';
  }

  if (input.isLoading) {
    return 'loading';
  }

  if (input.isError) {
    return 'error';
  }

  if (input.transactionCount > 0) {
    return 'ready';
  }

  if (input.unclassifiedCount > 0) {
    return 'still-classifying';
  }

  return 'empty';
}
