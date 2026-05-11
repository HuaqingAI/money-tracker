import {
  type CategorySummary,
  type MonthlySummary,
  type RecentTransaction,
} from '@money-tracker/shared';
import { Button, Text } from '@money-tracker/ui';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  type DimensionValue,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { XStack, YStack } from 'tamagui';

import {
  fetchMonthlySummary,
  fetchRecentTransactions,
} from '../../lib/dashboard-api';
import {
  type DashboardQueryStatus,
  getDashboardRenderState,
} from '../../lib/dashboard-render-state';
import { useAuthStore } from '../../stores/auth-store';

const page = '#F9FAFB';
const surface = '#FFFFFF';
const border = '#E5E7EB';
const text = '#111827';
const body = '#374151';
const muted = '#6B7280';
const brand = '#6366F1';
const brandDark = '#4338CA';
const brandLight = '#EEF2FF';

function getCurrentMonth(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${now.getFullYear()}-${month}`;
}

function getQueryStatus(query: {
  isError: boolean;
  isLoading: boolean;
}): DashboardQueryStatus {
  if (query.isError) {
    return 'error';
  }

  if (query.isLoading) {
    return 'loading';
  }

  return 'success';
}

function formatMonthLabel(month: string): string {
  const [, monthText] = month.split('-');
  return `${Number.parseInt(monthText ?? '1', 10)}月消费`;
}

function formatAmount(cents: number): string {
  return new Intl.NumberFormat('zh-CN', {
    currency: 'CNY',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(Math.abs(cents) / 100);
}

function formatTransactionDate(iso: string): string {
  return new Intl.DateTimeFormat('zh-CN', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
  }).format(new Date(iso));
}

function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

function SkeletonBlock({
  height,
  width = '100%',
}: {
  height: number;
  width?: DimensionValue;
}) {
  return <View style={[styles.skeletonBlock, { height, width }]} />;
}

function DashboardSkeleton() {
  return (
    <YStack gap="$4">
      <SkeletonBlock height={154} />
      <SkeletonBlock height={76} />
      <SkeletonBlock height={18} width="72%" />
      <Card>
        <YStack gap="$3">
          <SkeletonBlock height={20} width="40%" />
          {[0, 1, 2, 3].map((item) => (
            <SkeletonBlock height={54} key={item} />
          ))}
        </YStack>
      </Card>
    </YStack>
  );
}

function SummaryCard({ summary }: { summary: MonthlySummary }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>本月总支出</Text>
      <Text style={styles.summaryAmount}>{formatAmount(summary.totalExpenseCents)}</Text>
      <XStack gap="$4" marginTop="$5">
        <View style={styles.summaryMini}>
          <Text style={styles.summaryMiniLabel}>交易</Text>
          <Text style={styles.summaryMiniValue}>{summary.transactionCount} 笔</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryMini}>
          <Text style={styles.summaryMiniLabel}>待确认</Text>
          <Text style={styles.summaryMiniValue}>
            {summary.pendingConfirmationCount} 笔
          </Text>
        </View>
      </XStack>
    </View>
  );
}

function SpotlightCard({ summary }: { summary: MonthlySummary }) {
  if (!summary.spotlight) {
    return null;
  }

  return (
    <Pressable
      accessibilityLabel="AI 管家说"
      accessibilityRole="button"
      onPress={() => Alert.alert('AI 管家', 'AI 对话将在后续 Story 开放。')}
      style={({ pressed }) => [styles.spotlight, pressed ? styles.pressed : null]}
    >
      <View style={styles.spotlightIcon}>
        <Text style={styles.spotlightIconText}>AI</Text>
      </View>
      <View style={styles.spotlightCopy}>
        <Text style={styles.eyebrow}>管家说</Text>
        <Text style={styles.spotlightText}>{summary.spotlight.text}</Text>
      </View>
      <Text style={styles.chevron}>{'>'}</Text>
    </Pressable>
  );
}

function CoverageBar({ summary }: { summary: MonthlySummary }) {
  return (
    <View style={styles.coverage}>
      <XStack alignItems="center" justifyContent="space-between">
        <Text style={styles.coverageText}>
          AI 已自动识别 {summary.aiCoverageRate}% 的消费
        </Text>
        <Text style={styles.coverageCount}>
          {summary.aiCoveredCount}/{summary.transactionCount} 笔
        </Text>
      </XStack>
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${Math.min(100, summary.aiCoverageRate)}%` },
          ]}
        />
      </View>
    </View>
  );
}

function CategoryRow({ category }: { category: CategorySummary }) {
  return (
    <Pressable
      accessibilityLabel={`${category.name}分类支出`}
      accessibilityRole="button"
      onPress={() => Alert.alert('分类明细', '交易列表筛选将在后续 Story 开放。')}
      style={({ pressed }) => [
        styles.categoryRow,
        pressed ? styles.categoryRowPressed : null,
      ]}
    >
      <View style={[styles.categoryIcon, { backgroundColor: `${category.color}18` }]}>
        <Text style={styles.categoryEmoji}>{category.icon}</Text>
      </View>
      <View style={styles.categoryMain}>
        <XStack alignItems="center" justifyContent="space-between">
          <Text style={styles.categoryName}>{category.name}</Text>
          <Text style={styles.categoryAmount}>{formatAmount(category.amountCents)}</Text>
        </XStack>
        <XStack alignItems="center" gap="$2">
          <View style={styles.categoryTrack}>
            <View
              style={[
                styles.categoryFill,
                {
                  backgroundColor: category.color,
                  width: `${Math.min(100, category.percentage)}%`,
                },
              ]}
            />
          </View>
          <Text style={styles.categoryPercent}>{category.percentage}%</Text>
        </XStack>
      </View>
    </Pressable>
  );
}

function CategorySection({ categories }: { categories: CategorySummary[] }) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <YStack gap="$3">
      <XStack alignItems="center" justifyContent="space-between">
        <Text style={styles.sectionTitle}>分类消费</Text>
        <Text style={styles.sectionAction}>Top {categories.length}</Text>
      </XStack>
      <Card style={styles.listCard}>
        {categories.map((category) => (
          <CategoryRow
            category={category}
            key={category.categoryId ?? category.name}
          />
        ))}
      </Card>
    </YStack>
  );
}

function TransactionRow({ transaction }: { transaction: RecentTransaction }) {
  const amountColor =
    transaction.status === 'pending_confirmation' ? '#F59E0B' : text;

  return (
    <View style={styles.transactionRow}>
      <View style={styles.transactionIcon}>
        <Text style={styles.transactionIconText}>
          {(transaction.categoryName.trim().charAt(0) || '其').slice(0, 1)}
        </Text>
      </View>
      <View style={styles.transactionCopy}>
        <Text style={styles.transactionMerchant}>
          {transaction.merchant ?? transaction.description ?? '未命名交易'}
        </Text>
        <Text style={styles.transactionMeta}>
          {transaction.categoryName} · {formatTransactionDate(transaction.transactionAt)}
        </Text>
      </View>
      <Text style={[styles.transactionAmount, { color: amountColor }]}>
        {formatAmount(transaction.amountCents)}
      </Text>
    </View>
  );
}

function RecentTransactionsSection({
  transactions,
}: {
  transactions: RecentTransaction[];
}) {
  if (transactions.length === 0) {
    return null;
  }

  return (
    <YStack gap="$3">
      <XStack alignItems="center" justifyContent="space-between">
        <Text style={styles.sectionTitle}>最近交易</Text>
        <Text style={styles.sectionAction}>{transactions.length} 笔</Text>
      </XStack>
      <Card style={styles.listCard}>
        {transactions.map((transaction) => (
          <TransactionRow key={transaction.id} transaction={transaction} />
        ))}
      </Card>
    </YStack>
  );
}

function InlineStatusCard({
  actionLabel,
  message,
  onPress,
  title,
}: {
  actionLabel?: string;
  message: string;
  onPress?: () => void;
  title: string;
}) {
  return (
    <Card>
      <YStack gap="$3">
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.errorText}>{message}</Text>
        {actionLabel && onPress ? (
          <Button onPress={onPress}>{actionLabel}</Button>
        ) : null}
      </YStack>
    </Card>
  );
}

function EmptyGuideCard({
  bodyText,
  cta,
  icon,
  onPress,
  title,
}: {
  bodyText: string;
  cta: string;
  icon: string;
  onPress: () => void;
  title: string;
}) {
  return (
    <Pressable
      accessibilityLabel={title}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.guideCard, pressed ? styles.pressed : null]}
    >
      <Text style={styles.guideIcon}>{icon}</Text>
      <View style={styles.guideCopy}>
        <Text style={styles.guideTitle}>{title}</Text>
        <Text style={styles.guideBody}>{bodyText}</Text>
      </View>
      <Text style={styles.guideCta}>{cta}</Text>
    </Pressable>
  );
}

function EmptyState() {
  return (
    <YStack gap="$4">
      <Card style={styles.emptyCard}>
        <View style={styles.emptyIllustration}>
          <Text style={styles.emptyIllustrationText}>¥</Text>
        </View>
        <Text style={styles.emptyTitle}>还没有消费数据</Text>
        <Text style={styles.emptyBody}>
          开启下面任一方式，不动手就能知道钱去哪了
        </Text>
      </Card>

      <EmptyGuideCard
        bodyText="消费到账自动识别，不用动手"
        cta="去开启"
        icon="通知"
        onPress={() => router.push('/(setup)/permissions')}
        title="开启通知读取"
      />
      <EmptyGuideCard
        bodyText="3 个月消费 5 分钟到手，AI 自动分类每一笔"
        cta="去导入"
        icon="账单"
        onPress={() => router.push('/(setup)/bill-import')}
        title="导入支付宝账单"
      />
      <EmptyGuideCard
        bodyText="30 秒搞定，感受一下"
        cta="试试"
        icon="加"
        onPress={() => Alert.alert('记一笔试试', '手动补录将在 Story 2.3 开放。')}
        title="记一笔试试"
      />
    </YStack>
  );
}

function ActionSection() {
  return (
    <YStack gap="$3">
      <Button onPress={() => router.push('/(main)/report')}>
        查看完整报表
      </Button>
      <Pressable
        accessibilityLabel="补充更多账单数据"
        accessibilityRole="button"
        onPress={() => router.push('/(setup)/bill-import')}
        style={({ pressed }) => [styles.importMore, pressed ? styles.pressed : null]}
      >
        <View style={styles.importIcon}>
          <Text style={styles.importIconText}>↑</Text>
        </View>
        <View style={styles.importCopy}>
          <Text style={styles.importTitle}>补充更多账单数据</Text>
          <Text style={styles.importBody}>导入更多月份，看得更清楚</Text>
        </View>
        <Text style={styles.importAction}>去导入</Text>
      </Pressable>
      <Pressable
        accessibilityLabel="开启通知读取"
        accessibilityRole="button"
        onPress={() => router.push('/(setup)/permissions')}
        style={({ pressed }) => [styles.importMore, pressed ? styles.pressed : null]}
      >
        <View style={styles.importIcon}>
          <Text style={styles.importIconText}>通知</Text>
        </View>
        <View style={styles.importCopy}>
          <Text style={styles.importTitle}>开启通知读取</Text>
          <Text style={styles.importBody}>消费到账自动识别，不用动手</Text>
        </View>
        <Text style={styles.importAction}>去开启</Text>
      </Pressable>
    </YStack>
  );
}

function FabMenu({
  onClose,
  visible,
}: {
  onClose: () => void;
  visible: boolean;
}) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.fabMenu}>
      <Pressable
        onPress={() => {
          onClose();
          router.push('/(setup)/bill-import');
        }}
        style={styles.fabMenuItem}
      >
        <Text style={styles.fabMenuText}>账单导入</Text>
      </Pressable>
      <Pressable
        onPress={() => {
          onClose();
          Alert.alert('记一笔试试', '手动补录将在 Story 2.3 开放。');
        }}
        style={styles.fabMenuItem}
      >
        <Text style={styles.fabMenuText}>记一笔试试</Text>
      </Pressable>
    </View>
  );
}

export default function DashboardScreen() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const queryClient = useQueryClient();
  const [fabOpen, setFabOpen] = useState(false);
  const [month] = useState(getCurrentMonth);

  const summaryQuery = useQuery({
    enabled: !!accessToken,
    queryFn: () => fetchMonthlySummary(accessToken as string, month),
    queryKey: ['dashboard', 'monthly-summary', month],
    staleTime: 5 * 60 * 1000,
  });
  const recentQuery = useQuery({
    enabled: !!accessToken,
    queryFn: () => fetchRecentTransactions(accessToken as string, 10),
    queryKey: ['dashboard', 'recent-transactions'],
    staleTime: 30 * 1000,
  });

  const refreshing = summaryQuery.isRefetching || recentQuery.isRefetching;

  async function refreshDashboard(): Promise<void> {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ['dashboard', 'monthly-summary', month],
      }),
      queryClient.invalidateQueries({
        queryKey: ['dashboard', 'recent-transactions'],
      }),
    ]);
  }

  const summary = summaryQuery.data;
  const transactions = recentQuery.data?.transactions ?? [];
  const renderState = getDashboardRenderState({
    recentTransactionsStatus: getQueryStatus(recentQuery),
    summary,
    summaryStatus: getQueryStatus(summaryQuery),
    transactions,
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.page}>
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              onRefresh={() => {
                void refreshDashboard();
              }}
              refreshing={refreshing}
            />
          }
        >
          <YStack gap="$4">
            <XStack alignItems="center" justifyContent="space-between">
              <YStack gap="$1">
                <Text style={styles.monthTitle}>{formatMonthLabel(month)}</Text>
                <Text style={styles.monthSubtitle}>打开就是答案</Text>
              </YStack>
              <Pressable
                accessibilityLabel="我的"
                accessibilityRole="button"
                onPress={() => router.push('/(main)/me')}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>我</Text>
              </Pressable>
            </XStack>

            {renderState.showPageSkeleton ? <DashboardSkeleton /> : null}

            {renderState.showPageError ? (
              <Card>
                <YStack gap="$3">
                  <Text style={styles.sectionTitle}>首页加载失败</Text>
                  <Text style={styles.errorText}>请检查网络后重试。</Text>
                  <Button
                    onPress={() => {
                      void refreshDashboard();
                    }}
                  >
                    重试
                  </Button>
                </YStack>
              </Card>
            ) : null}

            {renderState.showSummaryLoading ? <SkeletonBlock height={154} /> : null}

            {renderState.showSummaryError ? (
              <InlineStatusCard
                actionLabel="重试"
                message="月度概览暂时无法加载，最近交易仍可继续查看。"
                onPress={() => {
                  void summaryQuery.refetch();
                }}
                title="月度概览加载失败"
              />
            ) : null}

            {renderState.showEmptyState ? (
              <EmptyState />
            ) : null}

            {renderState.showSummaryContent && summary ? (
              <YStack gap="$4">
                <SummaryCard summary={summary} />
                <SpotlightCard summary={summary} />
                <CoverageBar summary={summary} />
                <CategorySection categories={summary.categoryBreakdown} />
              </YStack>
            ) : null}

            {renderState.showRecentLoading ? (
              <Card>
                <YStack gap="$3">
                  <SkeletonBlock height={20} width="40%" />
                  {[0, 1, 2].map((item) => (
                    <SkeletonBlock height={54} key={item} />
                  ))}
                </YStack>
              </Card>
            ) : null}

            {renderState.showRecentError ? (
              <InlineStatusCard
                actionLabel="重试"
                message="最近交易暂时无法加载，月度概览不受影响。"
                onPress={() => {
                  void recentQuery.refetch();
                }}
                title="最近交易加载失败"
              />
            ) : null}

            {renderState.showRecentTransactions ? (
              <YStack gap="$4">
                <RecentTransactionsSection transactions={transactions} />
              </YStack>
            ) : null}

            {renderState.showSummaryContent || renderState.showRecentTransactions ? (
              <YStack gap="$4">
                <ActionSection />
              </YStack>
            ) : null}
          </YStack>
        </ScrollView>

        <FabMenu
          onClose={() => setFabOpen(false)}
          visible={fabOpen}
        />
        <Pressable
          accessibilityLabel="快捷操作"
          accessibilityRole="button"
          onPress={() => setFabOpen((current) => !current)}
          style={({ pressed }) => [styles.fab, pressed ? styles.fabPressed : null]}
        >
          <Text style={styles.fabText}>{fabOpen ? '×' : '+'}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    backgroundColor: brandLight,
    borderColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  avatarText: {
    color: brandDark,
    fontSize: 15,
    fontWeight: '700',
  },
  card: {
    backgroundColor: surface,
    borderColor: border,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { height: 1, width: 0 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
  },
  categoryAmount: {
    color: text,
    fontSize: 14,
    fontWeight: '700',
  },
  categoryEmoji: {
    fontSize: 19,
  },
  categoryFill: {
    borderRadius: 999,
    height: 6,
  },
  categoryIcon: {
    alignItems: 'center',
    borderRadius: 12,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  categoryMain: {
    flex: 1,
    gap: 7,
  },
  categoryName: {
    color: text,
    fontSize: 14,
    fontWeight: '700',
  },
  categoryPercent: {
    color: muted,
    fontSize: 12,
    minWidth: 42,
    textAlign: 'right',
  },
  categoryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    minHeight: 66,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  categoryRowPressed: {
    backgroundColor: '#F9FAFB',
  },
  categoryTrack: {
    backgroundColor: '#F3F4F6',
    borderRadius: 999,
    flex: 1,
    height: 6,
    overflow: 'hidden',
  },
  chevron: {
    color: brand,
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    paddingBottom: 120,
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  coverage: {
    gap: 8,
    paddingHorizontal: 2,
  },
  coverageCount: {
    color: brand,
    fontSize: 11,
    fontWeight: '700',
  },
  coverageText: {
    color: muted,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyBody: {
    color: muted,
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 260,
    textAlign: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 30,
  },
  emptyIllustration: {
    alignItems: 'center',
    backgroundColor: brandLight,
    borderRadius: 38,
    height: 76,
    justifyContent: 'center',
    width: 76,
  },
  emptyIllustrationText: {
    color: brand,
    fontSize: 36,
    fontWeight: '700',
  },
  emptyTitle: {
    color: text,
    fontSize: 17,
    fontWeight: '700',
  },
  errorText: {
    color: muted,
    fontSize: 14,
  },
  eyebrow: {
    color: brand,
    fontSize: 11,
    fontWeight: '700',
  },
  fab: {
    alignItems: 'center',
    backgroundColor: brand,
    borderRadius: 28,
    bottom: 28,
    elevation: 6,
    height: 56,
    justifyContent: 'center',
    position: 'absolute',
    right: 22,
    shadowColor: brand,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    width: 56,
  },
  fabMenu: {
    backgroundColor: surface,
    borderColor: border,
    borderRadius: 12,
    borderWidth: 1,
    bottom: 92,
    position: 'absolute',
    right: 22,
    shadowColor: '#000',
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    width: 148,
  },
  fabMenuItem: {
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  fabMenuText: {
    color: body,
    fontSize: 14,
    fontWeight: '700',
  },
  fabPressed: {
    opacity: 0.86,
    transform: [{ scale: 0.97 }],
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '500',
    lineHeight: 34,
  },
  guideBody: {
    color: muted,
    fontSize: 12,
    lineHeight: 18,
  },
  guideCard: {
    alignItems: 'center',
    backgroundColor: surface,
    borderColor: border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  guideCopy: {
    flex: 1,
    gap: 3,
  },
  guideCta: {
    color: brand,
    fontSize: 13,
    fontWeight: '700',
  },
  guideIcon: {
    color: brand,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    width: 42,
  },
  guideTitle: {
    color: text,
    fontSize: 14,
    fontWeight: '700',
  },
  importAction: {
    color: brand,
    fontSize: 13,
    fontWeight: '700',
  },
  importBody: {
    color: muted,
    fontSize: 12,
    marginTop: 2,
  },
  importCopy: {
    flex: 1,
  },
  importIcon: {
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  importIconText: {
    color: muted,
    fontSize: 20,
    fontWeight: '700',
  },
  importMore: {
    alignItems: 'center',
    backgroundColor: surface,
    borderColor: border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  importTitle: {
    color: text,
    fontSize: 14,
    fontWeight: '700',
  },
  listCard: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  monthSubtitle: {
    color: muted,
    fontSize: 12,
  },
  monthTitle: {
    color: text,
    fontSize: 22,
    fontWeight: '700',
  },
  page: {
    backgroundColor: page,
    flex: 1,
  },
  pressed: {
    opacity: 0.78,
  },
  progressFill: {
    backgroundColor: brand,
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
  sectionAction: {
    color: brand,
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTitle: {
    color: text,
    fontSize: 17,
    fontWeight: '700',
  },
  skeletonBlock: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    opacity: 0.78,
  },
  spotlight: {
    alignItems: 'center',
    backgroundColor: brandLight,
    borderColor: '#E0E7FF',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  spotlightCopy: {
    flex: 1,
    gap: 3,
  },
  spotlightIcon: {
    alignItems: 'center',
    backgroundColor: surface,
    borderRadius: 19,
    height: 38,
    justifyContent: 'center',
    width: 38,
  },
  spotlightIconText: {
    color: brand,
    fontSize: 12,
    fontWeight: '800',
  },
  spotlightText: {
    color: text,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  summaryAmount: {
    color: '#FFFFFF',
    fontSize: 35,
    fontWeight: '700',
    letterSpacing: 0,
    marginTop: 3,
  },
  summaryCard: {
    backgroundColor: brand,
    borderRadius: 16,
    overflow: 'hidden',
    padding: 24,
    shadowColor: brand,
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
  },
  summaryDivider: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    height: 42,
    width: 1,
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 13,
    fontWeight: '600',
  },
  summaryMini: {
    gap: 3,
  },
  summaryMiniLabel: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 11,
    fontWeight: '700',
  },
  summaryMiniValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  transactionCopy: {
    flex: 1,
    gap: 3,
  },
  transactionIcon: {
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  transactionIconText: {
    color: muted,
    fontSize: 13,
    fontWeight: '700',
  },
  transactionMerchant: {
    color: text,
    fontSize: 14,
    fontWeight: '700',
  },
  transactionMeta: {
    color: muted,
    fontSize: 12,
  },
  transactionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    minHeight: 58,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
});
