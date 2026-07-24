import { useCallback, useEffect, useRef } from 'react';
import { numberFormatter } from '@repo/ui/utils/formatter';
import { LineChart as ELineChart } from 'echarts/charts';
import {
  DatasetComponent,
  DataZoomComponent,
  GridComponent,
  MarkPointComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { useTranslation } from 'react-i18next';

import { dataReducer, LineOptions } from '@repo/ui/components/chart';
import { getYAxisConfig } from '../utils/helper';

type Props = {
  data: { label: string; value: number }[];
  color?: string;
  maxVisible?: number;
  formatValue?: (value: number, context?: any) => string;
  tooltipFormatter?: (value: number, label: string, context?: any) => string;
};

const MAX_VISIBLE = 12;

// Register only used components
echarts.use([
  ELineChart,
  GridComponent,
  TooltipComponent,
  DataZoomComponent,
  DatasetComponent,
  TitleComponent,
  MarkPointComponent,
  CanvasRenderer,
]);

export default function LineChart({
  data,
  color = '#22C55E',
  maxVisible = MAX_VISIBLE,
  formatValue,
  tooltipFormatter,
}: Readonly<Props>) {
  const chartRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<echarts.ECharts | null>(null);

  const {
    i18n: { language },
  } = useTranslation();

  const formatNumber = useCallback(
    (value?: number) => {
      if (!value) return '0';
      return numberFormatter(value, language);
    },
    [language]
  );

  const dataset = dataReducer(data);
  const totalData = data?.length;
  const isUseSlider = totalData > maxVisible;
  const end = isUseSlider ? (maxVisible / totalData) * 100 : 100;

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current, undefined, {
      renderer: 'canvas',
    });
    instanceRef.current = chart;
    const yAxisConfig = getYAxisConfig(dataset.data);

    const option: LineOptions = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#FFF',
        borderColor: color,
        borderWidth: 1,
        textStyle: {
          color: '#0C3045',
        },
        formatter: (params: any) => {
          const item = params?.[0];
          const value = item?.value;
          const label = item?.name;
          return (
            tooltipFormatter?.(value, label, item) ??
            `${label}: ${formatNumber(value)}`
          );
        },
      },
      grid: {
        left: 0,
        right: 0,
        top: '7%',
        bottom: 30,
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: dataset.labels,
        axisLabel: {
          interval: 0,
        },
      },
      yAxis: {
        type: 'value',
        min: yAxisConfig.min,
        max: yAxisConfig.max,
        interval: yAxisConfig.interval,
        splitNumber: yAxisConfig.splitNumber,
        axisLabel: {
          formatter: (v: number) => formatNumber(v),
        },
        splitLine: {
          lineStyle: { color: '#E5E7EB' },
        },
      },
      series: [
        {
          type: 'line',
          data: dataset.data,
          itemStyle: { color },
          label: {
            show: true,
            position: 'top',
            formatter: (v: any) => {
              const value = v?.value;
              return formatValue?.(value, v) ?? formatNumber(value);
            },
          },
        },
      ],
      dataZoom: isUseSlider
        ? [
            {
              type: 'slider',
              start: 0,
              end,
              bottom: 10,
              height: 10,
              zoomLock: true,
              backgroundColor: '#ebebeb',
              fillerColor: '#8d8d8d',
              borderColor: '#b0b0b0',
              handleStyle: {
                color: '#ffffff',
                borderColor: '#b0b0b0',
              },
            },
          ]
        : undefined,
    };

    chart.setOption(option);

    const resize = () => chart.resize();
    window.addEventListener('resize', resize);

    return () => {
      chart.dispose();
      window.removeEventListener('resize', resize);
    };
  }, [
    data,
    language,
    color,
    maxVisible,
    formatValue,
    formatNumber,
    dataset.data,
    dataset.labels,
    end,
    isUseSlider,
    tooltipFormatter,
  ]);

  return <div ref={chartRef} style={{ width: '100%', height: 300 }} />;
}
