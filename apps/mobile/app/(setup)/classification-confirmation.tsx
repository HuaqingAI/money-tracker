import type {
  BillingCategoryOption,
  PendingConfirmationTransaction,
} from '@money-tracker/shared';
import { Button, Text } from '@money-tracker/ui';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { XStack, YStack } from 'tamagui';

import {
  confirmBulkTransactions,
  confirmTransaction,
  fetchPendingConfirmations,
  rejectTransaction,
} from '../../lib/billing-api';
import {
  buildConfirmationActions,
  getConfirmationListState,
} from '../../lib/classification-confirmation-state';
import { useAuthStore } from '../../stores/auth-store';

function formatAmount(cents: number): string {
  return new Intl.NumberFormat('zh-CN', {
    currency: 'CNY',
    maximumFractionDigits: 2,
    style: 'currency',
  }).format(Math.abs(cents) / 100);
}

function completeOnboarding() {
  const { session, setSession } = useAuthStore.getState();
  if (!session) {
    return;
  }

  setSession({
    ...session,
    user: {
      ...session.user,
      needsOnboarding: false,
    },
  });
}

function CategoryPicker({
  categories,
  onSelect,
  selectedId,
}: {
  categories: BillingCategoryOption[];
  onSelect: (categoryId: string) => void;
  selectedId: string | null;
}) {
  return (
    <XStack flexWrap="wrap" gap="$2">
      {categories.map((category) => (
        <Pressable
          key={category.id}
          onPress={() => onSelect(category.id)}
          style={[
            styles.categoryChip,
            selectedId === category.id ? styles.categoryChipActive : null,
          ]}
        >
          <Text
            style={[
              styles.categoryChipText,
              selectedId === category.id ? styles.categoryChipTextActive : null,
            ]}
          >
            {category.name}
          </Text>
        </Pressable>
      ))}
    </XStack>
  );
}

function TransactionCard({
  categories,
  onConfirm,
  onConfirmCorrection,
  onReject,
  transaction,
}: {
  categories: BillingCategoryOption[];
  onConfirm: (transactionId: string) => void;
  onConfirmCorrection: (input: {
    categoryId: string;
    transactionId: string;
  }) => void;
  onReject: (input: { categoryId?: string; transactionId: string }) => void;
  transaction: PendingConfirmationTransaction;
}) {
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    transaction.categoryId,
  );
  const actions = buildConfirmationActions({
    selectedCategoryId,
    transactionCategoryId: transaction.categoryId,
    transactionId: transaction.id,
  });
  const canConfirmCorrection = actions.some(
    (action) => action.kind === 'confirm-correction',
  );

  return (
    <YStack gap="$3" style={styles.card}>
      <XStack alignItems="center" justifyContent="space-between">
        <YStack flex={1} gap="$1">
          <Text style={styles.merchant}>
            {transaction.merchant ?? transaction.description ?? '未命名交易'}
          </Text>
          <Text style={styles.meta}>
            AI 建议：{transaction.categoryName} · 置信度{' '}
            {Math.round((transaction.aiConfidence ?? 0) * 100)}%
          </Text>
        </YStack>
        <Text style={styles.amount}>{formatAmount(transaction.amountCents)}</Text>
      </XStack>

      <CategoryPicker
        categories={categories}
        onSelect={setSelectedCategoryId}
        selectedId={selectedCategoryId}
      />

      <XStack gap="$3">
        <Button
          onPress={() => onConfirm(transaction.id)}
          style={styles.actionButton}
        >
          确认
        </Button>
        <Button
          disabled={!canConfirmCorrection || selectedCategoryId === null}
          onPress={() => {
            if (selectedCategoryId) {
              onConfirmCorrection({
                categoryId: selectedCategoryId,
                transactionId: transaction.id,
              });
            }
          }}
          style={styles.actionButton}
        >
          改分类
        </Button>
        <Button
          onPress={() => onReject({ transactionId: transaction.id })}
          style={styles.actionButton}
        >
          拒绝
        </Button>
      </XStack>
    </YStack>
  );
}

export default function ClassificationConfirmationScreen() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);
  const query = useQuery({
    enabled: !!accessToken,
    queryFn: () => fetchPendingConfirmations(accessToken as string),
    queryKey: ['billing', 'pending-confirmations'],
    staleTime: 5_000,
  });

  const invalidate = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['billing', 'pending-confirmations'],
    });
  };
  const confirmMutation = useMutation({
    mutationFn: (input: { categoryId?: string; transactionId: string }) =>
      confirmTransaction(accessToken as string, input.transactionId, {
        ...(input.categoryId ? { categoryId: input.categoryId } : {}),
      }),
    onSuccess: invalidate,
  });
  const rejectMutation = useMutation({
    mutationFn: (input: { categoryId?: string; transactionId: string }) =>
      rejectTransaction(accessToken as string, input),
    onSuccess: invalidate,
  });
  const confirmBulkMutation = useMutation({
    mutationFn: (transactionIds: string[]) =>
      confirmBulkTransactions(accessToken as string, transactionIds),
    onSuccess: invalidate,
  });

  const transactions = query.data?.transactions ?? [];
  const categories = query.data?.categories ?? [];
  const unclassifiedCount = query.data?.classification.unclassifiedCount ?? 0;
  const listState = getConfirmationListState({
    hasAccessToken: !!accessToken,
    isError: query.isError,
    isLoading: query.isLoading,
    transactionCount: transactions.length,
    unclassifiedCount,
  });

  const goDashboard = () => {
    completeOnboarding();
    router.replace('/(main)/dashboard');
  };
  const runAction = async (action: () => Promise<unknown>) => {
    setActionError(null);
    try {
      await action();
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : '操作失败，请稍后重试。',
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <YStack gap="$4">
          <YStack gap="$2">
            <Text style={styles.title}>确认 AI 分类</Text>
            <Text style={styles.subtitle}>
              看一眼分类建议，确认后这些消费会进入 Dashboard 和月报。
            </Text>
          </YStack>

          {listState === 'auth-required' ? (
            <YStack gap="$3" style={styles.card}>
              <Text style={styles.merchant}>需要重新登录</Text>
              <Text style={styles.meta}>登录状态失效后无法加载待确认交易。</Text>
              <Button onPress={() => router.replace('/(auth)/welcome')}>
                去登录
              </Button>
            </YStack>
          ) : null}

          {listState === 'loading' ? (
            <Text style={styles.subtitle}>正在加载...</Text>
          ) : null}

          {listState === 'error' ? (
            <YStack gap="$3" style={styles.card}>
              <Text style={styles.merchant}>加载失败</Text>
              <Text style={styles.meta}>请检查网络后重试。</Text>
              <Button
                onPress={() => {
                  void query.refetch();
                }}
              >
                重试
              </Button>
            </YStack>
          ) : null}

          {actionError ? (
            <YStack gap="$2" style={styles.notice}>
              <Text style={styles.noticeTitle}>操作失败</Text>
              <Text style={styles.meta}>{actionError}</Text>
            </YStack>
          ) : null}

          {listState === 'still-classifying' ? (
            <YStack gap="$3" style={styles.emptyCard}>
              <Text style={styles.merchant}>还有交易正在识别</Text>
              <Text style={styles.meta}>
                剩余 {unclassifiedCount} 笔会继续处理，稍后刷新即可确认。
              </Text>
              <Button
                onPress={() => {
                  void query.refetch();
                }}
              >
                刷新
              </Button>
            </YStack>
          ) : null}

          {listState === 'empty' ? (
            <YStack gap="$3" style={styles.emptyCard}>
              <Text style={styles.merchant}>当前没有待确认交易</Text>
              <Text style={styles.meta}>已识别的数据可以在首页查看。</Text>
              <Button onPress={goDashboard}>进入 Dashboard</Button>
            </YStack>
          ) : null}

          {transactions.length > 0 ? (
            <Button
              onPress={() => {
                void runAction(async () => {
                  await confirmBulkMutation.mutateAsync(
                    transactions.map((transaction) => transaction.id),
                  );
                  goDashboard();
                });
              }}
            >
              全部确认
            </Button>
          ) : null}

          {transactions.map((transaction) => (
            <TransactionCard
              categories={categories}
              key={transaction.id}
              onConfirm={(transactionId) => {
                void runAction(async () => {
                  await confirmMutation.mutateAsync({ transactionId });
                  if (transactions.length <= 1) {
                    goDashboard();
                  }
                });
              }}
              onConfirmCorrection={(input) => {
                void runAction(async () => {
                  await confirmMutation.mutateAsync(input);
                  if (transactions.length <= 1) {
                    goDashboard();
                  }
                });
              }}
              onReject={(input) => {
                void runAction(async () => {
                  await rejectMutation.mutateAsync(input);
                  if (transactions.length <= 1) {
                    goDashboard();
                  }
                });
              }}
              transaction={transaction}
            />
          ))}
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    flex: 1,
  },
  amount: {
    color: '#111827',
    fontSize: 17,
    fontWeight: '800',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  categoryChip: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  categoryChipActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  categoryChipText: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '700',
  },
  categoryChipTextActive: {
    color: '#4F46E5',
  },
  content: {
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 12,
    borderWidth: 1,
    padding: 22,
  },
  merchant: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '800',
  },
  meta: {
    color: '#6B7280',
    fontSize: 12,
    lineHeight: 18,
  },
  notice: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },
  noticeTitle: {
    color: '#991B1B',
    fontSize: 15,
    fontWeight: '700',
  },
  safeArea: {
    backgroundColor: '#F9FAFB',
    flex: 1,
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 21,
  },
  title: {
    color: '#111827',
    fontSize: 24,
    fontWeight: '800',
  },
});
