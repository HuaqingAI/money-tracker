import { type ComponentType, useEffect, useState } from 'react';

import {
  type CategoryColorKey,
  categoryColorTokens,
  type ChartDatum,
  ChartFallback,
  type ChartProps,
  type ChartState,
  type ChartVariant,
} from './chart-shared';

export { categoryColorTokens };
export type { CategoryColorKey, ChartDatum, ChartProps, ChartState, ChartVariant };

type NativeChartModule = {
  NativeChart: ComponentType<ChartProps>;
};

const canUseNativeChartRuntime = () => typeof globalThis.SharedArrayBuffer === 'function';

export function Chart(props: ChartProps) {
  const [NativeChart, setNativeChart] = useState<ComponentType<ChartProps> | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!canUseNativeChartRuntime()) {
      return undefined;
    }

    void import('./chart-native-impl')
      .then((module: NativeChartModule) => {
        if (isMounted) {
          setNativeChart(() => module.NativeChart);
        }
      })
      .catch(() => {
        if (isMounted) {
          setNativeChart(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!NativeChart) {
    return <ChartFallback {...props} />;
  }

  return <NativeChart {...props} />;
}
