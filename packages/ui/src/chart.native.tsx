import { Canvas, Circle, Group, Line as SkiaLine, Path, Skia } from '@shopify/react-native-skia';
import { Text as TamaguiText, YStack } from 'tamagui';
import { Bar as VictoryBar, CartesianChart, Line as VictoryLine, Pie, PolarChart } from 'victory-native';

import { dsColorValues } from '../tamagui.config';
import {
  categoryColorTokens,
  ChartDataRows,
  type ChartDatum,
  type ChartProps,
  type ChartState,
  ChartStateFrame,
  type ChartVariant,
  getChartHeight,
  getChartSummary,
} from './chart-shared';
import { a11yProps, type CategoryColorKey, dsMetrics } from './component-utils';

export { categoryColorTokens };
export type { CategoryColorKey, ChartDatum, ChartProps, ChartState, ChartVariant };

const categoryNativeColors: Record<CategoryColorKey, string> = {
  dining: dsColorValues.catDining,
  transport: dsColorValues.catTransport,
  shopping: dsColorValues.catShopping,
  housing: dsColorValues.catHousing,
  fun: dsColorValues.catFun,
  health: dsColorValues.catHealth,
  other: dsColorValues.catOther,
};

function getNativeColor(datum: ChartDatum) {
  return datum.category ? categoryNativeColors[datum.category] : dsColorValues.brand500;
}

function NativeDonutChart({ data, height }: { data: ChartDatum[]; height: number }) {
  const size = Math.min(height, dsMetrics.chartDonutHeight);
  const pieData = data.map((datum) => ({
    label: datum.label,
    value: Math.max(0, datum.value),
    color: getNativeColor(datum),
  }));

  return (
    <YStack height={height} alignItems="center" justifyContent="center">
      <YStack width={size} height={size}>
        <PolarChart data={pieData} labelKey="label" valueKey="value" colorKey="color">
          <Pie.Chart innerRadius="58%" size={size}>
            {() => <Pie.Slice animate={{ type: 'timing', duration: 600 }} />}
          </Pie.Chart>
        </PolarChart>
      </YStack>
    </YStack>
  );
}

function NativeCartesianChart({ variant, data, height }: { variant: 'line' | 'bar'; data: ChartDatum[]; height: number }) {
  const chartData = data.map((datum, index) => ({
    label: datum.label || String(index + 1),
    value: datum.value,
  }));

  return (
    <YStack height={height}>
      <CartesianChart
        data={chartData}
        xKey="label"
        yKeys={['value']}
        domainPadding={{ left: 24, right: 24, top: 16 }}
        frame={{ lineColor: dsColorValues.neutral100 }}
      >
        {({ points, chartBounds }) =>
          variant === 'line' ? (
            <VictoryLine points={points.value} color={dsColorValues.brand500} strokeWidth={3} animate={{ type: 'timing', duration: 400 }} />
          ) : (
            <VictoryBar
              points={points.value}
              chartBounds={chartBounds}
              color={dsColorValues.brand500}
              roundedCorners={{ topLeft: 4, topRight: 4 }}
              animate={{ type: 'timing', duration: 300 }}
            />
          )
        }
      </CartesianChart>
    </YStack>
  );
}

function NativeRadarChart({ data, height }: { data: ChartDatum[]; height: number }) {
  const size = Math.min(height, dsMetrics.chartRadarHeight);
  const center = size / 2;
  const radius = center - 20;
  const values = data.slice(0, 6);
  const maxValue = Math.max(...values.map((datum) => datum.value), 1);
  const points = values.map((datum, index) => {
    const angle = -Math.PI / 2 + (index / values.length) * Math.PI * 2;
    const distance = (Math.max(0, datum.value) / maxValue) * radius;
    return {
      x: center + Math.cos(angle) * distance,
      y: center + Math.sin(angle) * distance,
      axisX: center + Math.cos(angle) * radius,
      axisY: center + Math.sin(angle) * radius,
      color: getNativeColor(datum),
    };
  });
  const path = Skia.Path.Make();
  points.forEach((point, index) => {
    if (index === 0) path.moveTo(point.x, point.y);
    else path.lineTo(point.x, point.y);
  });
  path.close();

  return (
    <YStack height={height} alignItems="center" justifyContent="center">
      <Canvas style={{ width: size, height: size }}>
        <Group>
          {points.map((point, index) => (
            <SkiaLine
              key={`axis-${index}`}
              p1={{ x: center, y: center }}
              p2={{ x: point.axisX, y: point.axisY }}
              color={dsColorValues.neutral100}
              strokeWidth={1}
            />
          ))}
          <Path path={path} color={dsColorValues.brand500} opacity={0.15} />
          <Path path={path} color={dsColorValues.brand500} style="stroke" strokeWidth={2} />
          {points.map((point, index) => (
            <Circle key={`point-${index}`} cx={point.x} cy={point.y} r={4} color={point.color} />
          ))}
        </Group>
      </Canvas>
    </YStack>
  );
}

export function Chart({ variant, data, title, summary, state = 'default', selectedKey, height, onDatumPress }: ChartProps) {
  const resolvedHeight = getChartHeight(variant, height);
  const accessibleSummary = getChartSummary(variant, data, summary);

  if (state !== 'default') {
    return <ChartStateFrame state={state} height={resolvedHeight} label={accessibleSummary} />;
  }

  if (data.length === 0) {
    return <ChartStateFrame state="empty" height={resolvedHeight} label={accessibleSummary} />;
  }

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
        <NativeDonutChart data={data} height={resolvedHeight} />
      ) : variant === 'radar' ? (
        <NativeRadarChart data={data} height={resolvedHeight} />
      ) : (
        <NativeCartesianChart variant={variant} data={data} height={resolvedHeight} />
      )}
      <ChartDataRows data={data} selectedKey={selectedKey} onDatumPress={onDatumPress} />
      <TamaguiText color="$neutral500" fontSize="$2">
        {accessibleSummary}
      </TamaguiText>
    </YStack>
  );
}
