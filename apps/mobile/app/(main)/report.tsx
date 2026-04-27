import { Button, Text } from '@money-tracker/ui';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { XStack, YStack } from 'tamagui';

import { fetchMonthlySummary, fetchMonthlyTrend } from '../../lib/api-client';
import {
  canGoNextMonth,
  formatMonthTitle,
  getAdjacentMonth,
  getCurrentMonth,
} from '../../lib/monthly-report';
import { useAuthStore } from '../../stores/auth-store';

const CATEGORY_COLORS = [
  '#F97316',
  '#3B82F6',
  '#8B5CF6',
  '#06B6D4',
  '#EC4899',
  '#22C55E',
  '#6B7280',
] as const;

function amountText(cents: number): string {
  return `¥${(cents / 100).toLocaleString('zh-CN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })}`;
}

function trendText(percentageChange: number | null): string {
  if (percentageChange === null) {
    return '新增对比基线';
  }

  if (percentageChange === 0) {
    return '持平';
  }

  return `${percentageChange > 0 ? '增加' : '减少'} ${Math.abs(percentageChange)}%`;
}

function Card({ children }: { children: ReactNode }) {
  return (
    <YStack
      backgroundColor="$surfacePrimary"
      borderColor="$neutral200"
      borderRadius="$lg"
      borderWidth={1}
      gap="$3"
      padding="$4"
    >
      {children}
    </YStack>
  );
}

function IconButton({
  disabled,
  label,
  onPress,
}: {
  disabled?: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={{
        alignItems: 'center',
        borderColor: '#E5E7EB',
        borderRadius: 22,
        borderWidth: 1,
        height: 44,
        justifyContent: 'center',
        opacity: disabled ? 0.35 : 1,
        width: 44,
      }}
    >
      <Text variant="h2">{label}</Text>
    </Pressable>
  );
}

function SkeletonState() {
  return (
    <YStack gap="$4" padding="$4">
      <Card>
        <ActivityIndicator />
        <Text variant="bodyMedium">正在生成月度报表...</Text>
        <Text variant="caption">数据加载完成后会自动展示消费总额、分类分布和趋势。</Text>
      </Card>
      <Card>
        <View style={{ backgroundColor: '#E5E7EB', borderRadius: 12, height: 120 }} />
      </Card>
    </YStack>
  );
}

function EmptyState({ onImport }: { onImport: () => void }) {
  return (
    <Card>
      <YStack alignItems="center" gap="$3">
        <View
          style={{
            alignItems: 'center',
            backgroundColor: '#EEF2FF',
            borderRadius: 44,
            height: 88,
            justifyContent: 'center',
            width: 88,
          }}
        >
          <Text variant="metric">0</Text>
        </View>
        <Text variant="h2">本月暂无消费记录</Text>
        <Text textAlign="center" variant="caption">
          导入账单或开启自动识别后，月度报表会自动生成。
        </Text>
        <Button onPress={onImport}>去导入账单</Button>
      </YStack>
    </Card>
  );
}

export default function MonthlyReportScreen() {
  const [month, setMonth] = useState(getCurrentMonth);
  const accessToken = useAuthStore((state) => state.accessToken);
  const summaryQuery = useQuery({
    enabled: !!accessToken,
    queryFn: () => fetchMonthlySummary(accessToken as string, month),
    queryKey: ['monthly-summary', month],
    staleTime: 5 * 60 * 1000,
  });
  const trendQuery = useQuery({
    enabled: !!accessToken,
    queryFn: () => fetchMonthlyTrend(accessToken as string, 12, month),
    queryKey: ['monthly-trend', month],
    staleTime: 5 * 60 * 1000,
  });
  const summary = summaryQuery.data;
  const topCategory = summary?.categories[0] ?? null;
  const visibleTrendPoints = useMemo(
    () => trendQuery.data?.points.slice(-3) ?? [],
    [trendQuery.data?.points],
  );

  function goPreviousMonth(): void {
    setMonth((current) => getAdjacentMonth(current, 'previous'));
  }

  function goNextMonth(): void {
    setMonth((current) => getAdjacentMonth(current, 'next'));
  }

  function retry(): void {
    void summaryQuery.refetch();
    void trendQuery.refetch();
  }

  const isLoading = summaryQuery.isLoading || trendQuery.isLoading;
  const hasError = summaryQuery.isError || trendQuery.isError;
  const hasData = (summary?.transactionCount ?? 0) > 0;

  return (
    <SafeAreaView style={{ backgroundColor: '#F9FAFB', flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <YStack gap="$4">
          <XStack alignItems="center" justifyContent="space-between">
            <IconButton label="‹" onPress={() => router.back()} />
            <Text variant="h2">{formatMonthTitle(month)}消费报表</Text>
            <IconButton
              disabled
              label="↗"
              onPress={() => {
                return;
              }}
            />
          </XStack>

          <Card>
            <XStack alignItems="center" gap="$3" justifyContent="space-between">
              <Text flex={1} variant="caption">
                这份报表由 AI 自动生成，你没有手动输入任何一笔。
              </Text>
            </XStack>
          </Card>

          <XStack alignItems="center" justifyContent="center" gap="$5">
            <IconButton label="‹" onPress={goPreviousMonth} />
            <Text variant="h2">{formatMonthTitle(month)}</Text>
            <IconButton
              disabled={!canGoNextMonth(month)}
              label="›"
              onPress={goNextMonth}
            />
          </XStack>

          {isLoading ? <SkeletonState /> : null}

          {!isLoading && hasError ? (
            <Card>
              <YStack gap="$3">
                <Text variant="h2">报表加载失败</Text>
                <Text variant="caption">请检查网络或登录状态后重试。</Text>
                <Button onPress={retry}>重试</Button>
              </YStack>
            </Card>
          ) : null}

          {!isLoading && !hasError && summary && !hasData ? (
            <EmptyState onImport={() => router.push('/import')} />
          ) : null}

          {!isLoading && !hasError && summary && hasData ? (
            <>
              <YStack alignItems="center" gap="$2" paddingVertical="$4">
                <Text variant="caption">本月总支出</Text>
                <Text variant="metric">{amountText(summary.totalExpenseCents)}</Text>
                <Text variant="caption">
                  {summary.transactionCount}笔交易 · {summary.source === 'live' ? '实时聚合' : '已预聚合'}
                </Text>
              </YStack>

              <Card>
                <XStack justifyContent="space-between">
                  <YStack alignItems="center" flex={1} gap="$1">
                    <Text variant="caption">收入</Text>
                    <Text variant="bodyMedium">暂无记录</Text>
                  </YStack>
                  <YStack alignItems="center" flex={1} gap="$1">
                    <Text variant="caption">支出</Text>
                    <Text variant="bodyMedium">
                      {amountText(summary.totalExpenseCents)}
                    </Text>
                  </YStack>
                  <YStack alignItems="center" flex={1} gap="$1">
                    <Text variant="caption">结余</Text>
                    <Text variant="bodyMedium">待识别</Text>
                  </YStack>
                </XStack>
              </Card>

              <Card>
                <YStack alignItems="center" gap="$2">
                  <View
                    style={{
                      alignItems: 'center',
                      backgroundColor: '#EEF2FF',
                      borderColor: CATEGORY_COLORS[0],
                      borderRadius: 72,
                      borderWidth: 16,
                      height: 144,
                      justifyContent: 'center',
                      width: 144,
                    }}
                  >
                    <Text variant="caption">{topCategory?.categoryName ?? '分类'}</Text>
                    <Text variant="h2">{topCategory?.percentage ?? 0}%</Text>
                  </View>
                  <Text variant="caption">按金额降序展示分类占比</Text>
                </YStack>
              </Card>

              <YStack gap="$3">
                <Text variant="h2">分类明细</Text>
                {summary.categories.map((category, index) => {
                  const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length] ?? '#6B7280';
                  return (
                    <Card key={category.categoryId ?? 'uncategorized'}>
                      <YStack gap="$3">
                        <XStack alignItems="center" justifyContent="space-between">
                          <YStack gap="$1">
                            <Text variant="bodyMedium">{category.categoryName}</Text>
                            <Text variant="caption">
                              {category.transactionCount}笔 · 占比 {category.percentage}%
                            </Text>
                          </YStack>
                          <Text variant="bodyMedium">
                            {amountText(category.amountCents)}
                          </Text>
                        </XStack>
                        <View
                          style={{
                            backgroundColor: '#F3F4F6',
                            borderRadius: 999,
                            height: 8,
                            overflow: 'hidden',
                          }}
                        >
                          <View
                            style={{
                              backgroundColor: color,
                              height: 8,
                              width: `${Math.max(category.percentage, 2)}%`,
                            }}
                          />
                        </View>
                      </YStack>
                    </Card>
                  );
                })}
              </YStack>

              <Card>
                <YStack gap="$3">
                  <Text variant="h2">趋势对比</Text>
                  <XStack justifyContent="space-between">
                    <YStack flex={1} gap="$1">
                      <Text variant="caption">较上月</Text>
                      <Text variant="bodyMedium">
                        {summary.comparisons.previousMonth
                          ? trendText(summary.comparisons.previousMonth.percentageChange)
                          : '暂无上月数据'}
                      </Text>
                    </YStack>
                    <YStack flex={1} gap="$1">
                      <Text variant="caption">较去年同月</Text>
                      <Text variant="bodyMedium">
                        {summary.comparisons.yearOverYear
                          ? trendText(summary.comparisons.yearOverYear.percentageChange)
                          : '暂无去年数据'}
                      </Text>
                    </YStack>
                  </XStack>
                  {visibleTrendPoints.length > 0 ? (
                    <YStack gap="$2">
                      {visibleTrendPoints.map((point) => (
                        <XStack key={point.month} justifyContent="space-between">
                          <Text variant="caption">{formatMonthTitle(point.month)}</Text>
                          <Text variant="caption">
                            {amountText(point.totalExpenseCents)}
                          </Text>
                        </XStack>
                      ))}
                    </YStack>
                  ) : null}
                </YStack>
              </Card>

              <Card>
                <YStack gap="$2">
                  <Text variant="h2">AI 发现</Text>
                  {topCategory ? (
                    <Text variant="caption">
                      本月最高支出分类是{topCategory.categoryName}，共
                      {topCategory.transactionCount}笔，占总支出
                      {topCategory.percentage}%。
                    </Text>
                  ) : (
                    <Text variant="caption">
                      积累两个月数据后，AI 会自动对比消费趋势。
                    </Text>
                  )}
                </YStack>
              </Card>
            </>
          ) : null}
        </YStack>
      </ScrollView>
    </SafeAreaView>
  );
}
