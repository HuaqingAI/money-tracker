export type AiClassificationProvider =
  | 'development-stub'
  | 'gpt-5.3-codex'
  | 'qwen-3.6-plus'
  | 'rule';

export interface ClassifyCategoryCandidate {
  id: string;
  name: string;
}

export interface ClassifyTransactionInput {
  amountCents: number;
  categories: ClassifyCategoryCandidate[];
  description: string | null;
  merchant: string | null;
  source: string | null;
  transactionAt: string;
  transactionId: string;
  userId: string;
}

export interface ClassifyTransactionResult {
  categoryId: string | null;
  categoryName: string;
  confidence: number;
  provider: AiClassificationProvider;
  transactionId: string;
}

export interface AiClient {
  classify(input: ClassifyTransactionInput): Promise<ClassifyTransactionResult>;
}

export class AiClientError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'AiClientError';
  }
}
