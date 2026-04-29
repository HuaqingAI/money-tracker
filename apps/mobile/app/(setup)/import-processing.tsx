import type { PendingConfirmationTransaction } from '@money-tracker/shared';
import { Button, Text } from '@money-tracker/ui';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { XStack, YStack } from 'tamagui';

import { fetchPendingConfirmations } from '../../lib/billing-api';
import {
  calculateDisplayedProgress,
  getProcessingStatus,
} from '../../lib/classification-flow';
import { useAuthStore } from '../../stores/auth-store';

function readParam(value: string | string[] | undefined, fallback = '0'): string {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}

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

function FeedItem({
  transaction,
}: {
  transaction: PendingConfirmationTransaction;
}) {
  return (
    <View style={styles.feedItem}>
      <Text style={styles.feedMerchant}>
        {transaction.merchant ?? transaction.description ?? '未命名交易'}{' '}
        {formatAmount(transaction.amountCents)}
      </Text>
      <Text style={styles.feedCategory}>{transaction.categoryName}</Text>
    </View>
  );
}

export default function ImportProcessingScreen() {
  const params = useLocalSearchParams();
  const accessToken = useAuthStore((state) => state.accessToken);
  const totalCount = Number.parseInt(readParam(params.totalCount), 10) || 0;
  const importedCount = Number.parseInt(readParam(params.importedCount), 10) || 0;
  const duplicateCount = Number.parseInt(readParam(params.duplicateCount), 10) || 0;
  const failedCount = Number.parseInt(readParam(params.failedCount), 10) || 0;
  const [elapsedMs, setElapsedMs] = useState(0);
  const [pulse] = useState(() => new Animated.Value(0));

  const pendingQuery = useQuery({
    enabled: !!accessToken,
    queryFn: () => fetchPendingConfirmations(accessToken as string),
    queryKey: ['billing', 'pending-confirmations', 'processing'],
    refetchInterval: 2_000,
    staleTime: 1_000,
  });

  useEffect(() => {
    const startedAt = Date.now();
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - startedAt);
    }, 250);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          duration: 900,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          duration: 900,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  const pendingTransactions = useMemo(
    () => pendingQuery.data?.transactions ?? [],
    [pendingQuery.data?.transactions],
  );
  const classification = pendingQuery.data?.classification;
  const totalToClassify = classification?.totalCount ?? importedCount;
  const classifiedCount = classification?.classifiedCount ?? 0;
  const unclassifiedCount =
    classification?.unclassifiedCount ??
    Math.max(0, Math.max(totalCount, importedCount) - pendingTransactions.length);
  const status = getProcessingStatus({
    elapsedMs,
    hasError: pendingQuery.isError,
    pendingCount: unclassifiedCount,
    totalCount: Math.max(totalToClassify, unclassifiedCount),
  });
  const progress = calculateDisplayedProgress({
    elapsedMs,
    pendingCount: unclassifiedCount,
    totalCount: Math.max(totalToClassify, unclassifiedCount),
  });
  const recognized = Math.max(0, classifiedCount);
  const coverage =
    Math.max(totalToClassify, unclassifiedCount) > 0
      ? Math.round(
          (recognized / Math.max(totalToClassify, unclassifiedCount)) * 100,
        )
      : progress;
  const latest = useMemo(
    () => pendingTransactions.slice(0, 4),
    [pendingTransactions],
  );
  const scale = useMemo(
    () =>
      pulse.interpolate({
        inputRange: [0, 1],
        outputRange: [0.96, 1.08],
      }),
    [pulse],
  );

  useEffect(() => {
    if (status === 'complete') {
      const timer = setTimeout(() => {
        completeOnboarding();
        router.replace('/(setup)/classification-confirmation');
      }, 2_500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [status]);

  const goToConfirmations = () => {
    completeOnboarding();
    router.replace('/(setup)/classification-confirmation');
  };

  const goToDashboard = () => {
    completeOnboarding();
    router.replace('/(main)/dashboard');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        {status === 'complete' ? (
          <YStack alignItems="center" flex={1} gap="$5" justifyContent="center">
            <View style={styles.successIcon}>
              <Text style={styles.successIconText}>✓</Text>
            </View>
            <YStack alignItems="center" gap="$2">
              <Text style={styles.completeTitle}>已识别 {recognized} 笔交易</Text>
              <Text style={styles.completeCoverage}>AI 已识别 {coverage}%</Text>
              <Text style={styles.completeHint}>即将为你展示消费全貌...</Text>
            </YStack>
          </YStack>
        ) : null}

        {status !== 'complete' ? (
          <YStack flex={1} gap="$5" justifyContent="center" paddingHorizontal="$4">
            <YStack alignItems="center" gap="$4">
              <Animated.View style={[styles.brain, { transform: [{ scale }] }]}>
                <Text style={styles.brainText}>AI</Text>
              </Animated.View>
              <XStack flexWrap="wrap" gap="$2" justifyContent="center">
                {['餐饮', '交通', '购物', '生活', '其他'].map((name) => (
                  <View key={name} style={styles.bubble}>
                    <Text style={styles.bubbleText}>{name}</Text>
                  </View>
                ))}
              </XStack>
            </YStack>

            <YStack gap="$2">
              <Text style={styles.counter}>
                正在识别 {Math.min(recognized, Math.max(totalToClassify, 0))}/
                {Math.max(totalToClassify, importedCount)} 笔交易...
              </Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
              <Text style={styles.hint}>
                {status === 'slow'
                  ? '处理量较大，请稍候...'
                  : '通常需要 10-20 秒'}
              </Text>
            </YStack>

            <YStack gap="$3">
              <Text style={styles.sectionTitle}>最新识别</Text>
              {latest.length > 0 ? (
                latest.map((transaction) => (
                  <FeedItem key={transaction.id} transaction={transaction} />
                ))
              ) : (
                <View style={styles.feedItem}>
                  <Text style={styles.feedMerchant}>正在读取分类结果</Text>
                  <Text style={styles.feedCategory}>整理中</Text>
                </View>
              )}
            </YStack>

            {status === 'partial' ? (
              <YStack gap="$3" style={styles.notice}>
                <Text style={styles.noticeTitle}>部分交易还在学习中，后续会越来越准</Text>
                <Text style={styles.noticeBody}>
                  已导入 {importedCount} 条，跳过重复 {duplicateCount} 条，未导入 {failedCount} 条。
                </Text>
                <Button onPress={goToConfirmations}>先看已识别的</Button>
              </YStack>
            ) : null}

            {status === 'error' ? (
              <YStack gap="$3" style={styles.notice}>
                <Text style={styles.noticeTitle}>处理遇到问题</Text>
                <Text style={styles.noticeBody}>请检查网络后重试。</Text>
                <Button
                  onPress={() => {
                    void pendingQuery.refetch();
                  }}
                >
                  重试
                </Button>
              </YStack>
            ) : null}

            <Pressable
              accessibilityLabel="去首页"
              accessibilityRole="button"
              onPress={goToDashboard}
            >
              <Text style={styles.skipText}>去首页</Text>
            </Pressable>
          </YStack>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  brain: {
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
    borderRadius: 64,
    borderWidth: 1,
    height: 128,
    justifyContent: 'center',
    width: 128,
  },
  brainText: {
    color: '#4F46E5',
    fontSize: 34,
    fontWeight: '800',
  },
  bubble: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  bubbleText: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '700',
  },
  completeCoverage: {
    color: '#16A34A',
    fontSize: 20,
    fontWeight: '700',
  },
  completeHint: {
    color: '#6B7280',
    fontSize: 15,
  },
  completeTitle: {
    color: '#111827',
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
  },
  counter: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  feedCategory: {
    backgroundColor: '#EEF2FF',
    borderRadius: 999,
    color: '#4F46E5',
    fontSize: 13,
    fontWeight: '700',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  feedItem: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: 14,
  },
  feedMerchant: {
    color: '#111827',
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    marginRight: 10,
  },
  hint: {
    color: '#6B7280',
    fontSize: 13,
    textAlign: 'center',
  },
  notice: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  noticeBody: {
    color: '#6B7280',
    fontSize: 13,
    lineHeight: 19,
  },
  noticeTitle: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '700',
  },
  page: {
    backgroundColor: '#F9FAFB',
    flex: 1,
  },
  progressFill: {
    backgroundColor: '#6366F1',
    borderRadius: 999,
    height: 7,
  },
  progressTrack: {
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    height: 7,
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
  },
  sectionTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '800',
  },
  skipText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  successIcon: {
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderRadius: 48,
    height: 96,
    justifyContent: 'center',
    width: 96,
  },
  successIconText: {
    color: '#16A34A',
    fontSize: 52,
    fontWeight: '800',
  },
});
