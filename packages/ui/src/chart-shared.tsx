import { Text as TamaguiText, XStack, YStack } from 'tamagui';
import type { InputDatum } from 'victory-native';

import { a11yProps, type CategoryColorKey, categoryColorTokens, dsMetrics } from './component-utils';

export type ChartVariant = 'donut' | 'line' | 'radar' | 'bar';
export type ChartState = 'default' | 'loading' | 'empty' | 'error';

export interface ChartDatum extends InputDatum {
  key: string;
  label: string;
  value: number;
  category?: CategoryColorKey;
}

export interface ChartProps {
  variant: ChartVariant;
  data: ChartDatum[];
  title?: string;
  summary?: string;
  state?: ChartState;
  selectedKey?: string;
  height?: number;
  onDatumPress?: (datum: ChartDatum) => void;
}

export { categoryColorTokens };
export type { CategoryColorKey };

export function getDatumColorToken(datum: ChartDatum) {
  return datum.category ? categoryColorTokens[datum.category] : '$brand500';
}

export function getChartHeight(variant: ChartVariant, height?: number) {
  if (height) return height;
  if (variant === 'radar') return dsMetrics.chartRadarHeight;
  if (variant === 'donut') return dsMetrics.chartDonutHeight;
  return dsMetrics.chartBarHeight;
}

export function getChartTotal(data: ChartDatum[]) {
  return data.reduce((sum, item) => sum + Math.max(0, item.value), 0);
}

export function getDonutPercent(datum: ChartDatum, total: number) {
  if (total <= 0) return 0;
  return Math.round((Math.max(0, datum.value) / total) * 100);
}

export function getChartSummary(variant: ChartVariant, data: ChartDatum[], summary?: string) {
  if (summary) return summary;
  if (data.length === 0) return '暂无图表数据';
  const total = getChartTotal(data);
  const top = [...data].sort((a, b) => b.value - a.value)[0];
  return `${variant} 图表，共 ${data.length} 项，总值 ${total}，最高项 ${top?.label ?? '无'}`;
}

export function ChartStateFrame({
  state,
  height,
  label,
}: {
  state: Exclude<ChartState, 'default'>;
  height: number;
  label: string;
}) {
  if (state === 'loading') {
    return (
      <YStack
        height={height}
        borderRadius="$lg"
        backgroundColor="$neutral100"
        {...a11yProps({ role: 'image', label: '图表加载中', busy: true })}
      />
    );
  }

  return (
    <YStack
      minHeight={height}
      alignItems="center"
      justifyContent="center"
      borderRadius="$lg"
      backgroundColor="$neutral100"
      {...a11yProps({ role: 'image', label })}
    >
      <TamaguiText color={state === 'error' ? '$error' : '$neutral500'} fontSize="$3">
        {state === 'error' ? '图表加载失败' : '暂无数据'}
      </TamaguiText>
    </YStack>
  );
}

export function ChartDataRows({
  data,
  selectedKey,
  onDatumPress,
}: {
  data: ChartDatum[];
  selectedKey?: string;
  onDatumPress?: (datum: ChartDatum) => void;
}) {
  return (
    <YStack gap="$2">
      {data.map((datum) => (
        <XStack
          key={datum.key}
          gap="$2"
          alignItems="center"
          {...a11yProps({ role: 'button', label: `${datum.label} ${datum.value}`, state: { selected: datum.key === selectedKey } })}
          onPress={() => onDatumPress?.(datum)}
        >
          <YStack width={dsMetrics.badgeDot} height={dsMetrics.badgeDot} borderRadius="$full" backgroundColor={getDatumColorToken(datum)} />
          <TamaguiText flex={1} color="$neutral500" fontSize="$2" numberOfLines={1}>
            {datum.label}
          </TamaguiText>
          <TamaguiText color="$neutral700" fontSize="$2" textAlign="right">
            {datum.value}
          </TamaguiText>
        </XStack>
      ))}
    </YStack>
  );
}

/**
 * Web/Storybook fallback: it is intentionally built from Tamagui primitives so
 * browser preview never loads native Skia modules. Native uses chart.native.tsx.
 */
export function ChartFallback({
  variant,
  data,
  title,
  summary,
  state = 'default',
  selectedKey,
  height,
  onDatumPress,
}: ChartProps) {
  const resolvedHeight = getChartHeight(variant, height);
  const accessibleSummary = getChartSummary(variant, data, summary);

  if (state !== 'default') {
    return <ChartStateFrame state={state} height={resolvedHeight} label={accessibleSummary} />;
  }

  if (data.length === 0) {
    return <ChartStateFrame state="empty" height={resolvedHeight} label={accessibleSummary} />;
  }

  const maxValue = Math.max(...data.map((datum) => datum.value), 1);
  const total = getChartTotal(data);

  return (
    <YStack
      minHeight={resolvedHeight}
      gap="$3"
      padding="$4"
      borderRadius="$lg"
      backgroundColor="$surfacePrimary"
      {...a11yProps({ role: 'image', label: accessibleSummary })}
    >
      {title ? (
        <TamaguiText color="$neutral800" fontSize="$4" fontWeight="600">
          {title}
        </TamaguiText>
      ) : null}
      {variant === 'donut' ? (
        <XStack gap="$2" flexWrap="wrap" alignItems="center">
          {data.map((datum) => (
            <YStack
              key={datum.key}
              width={datum.key === selectedKey ? dsMetrics.chartDonutSegmentSelected : dsMetrics.chartDonutSegment}
              height={datum.key === selectedKey ? dsMetrics.chartDonutSegmentSelected : dsMetrics.chartDonutSegment}
              borderRadius="$full"
              backgroundColor={getDatumColorToken(datum)}
              alignItems="center"
              justifyContent="center"
              {...a11yProps({ role: 'button', label: `${datum.label} ${datum.value}` })}
              onPress={() => onDatumPress?.(datum)}
            >
              <TamaguiText color="$surfacePrimary" fontSize="$1" fontWeight="700">
                {getDonutPercent(datum, total)}%
              </TamaguiText>
            </YStack>
          ))}
        </XStack>
      ) : (
        <YStack gap="$2">
          {data.map((datum) => {
            const width = `${Math.max(8, (datum.value / maxValue) * 100)}%`;
            return (
              <XStack key={datum.key} gap="$2" alignItems="center">
                <TamaguiText width={dsMetrics.chartLabelWidth} color="$neutral500" fontSize="$2" numberOfLines={1}>
                  {datum.label}
                </TamaguiText>
                <YStack flex={1} height={variant === 'line' ? 6 : 12} borderRadius="$full" backgroundColor="$neutral100">
                  <YStack
                    width={width}
                    height="100%"
                    borderRadius="$full"
                    backgroundColor={datum.key === selectedKey ? '$brand700' : getDatumColorToken(datum)}
                    {...a11yProps({ role: 'button', label: `${datum.label} ${datum.value}` })}
                    onPress={() => onDatumPress?.(datum)}
                  />
                </YStack>
                <TamaguiText width={dsMetrics.chartValueWidth} color="$neutral700" fontSize="$2" textAlign="right">
                  {datum.value}
                </TamaguiText>
              </XStack>
            );
          })}
        </YStack>
      )}
      <TamaguiText color="$neutral500" fontSize="$2">
        {accessibleSummary}
      </TamaguiText>
    </YStack>
  );
}
