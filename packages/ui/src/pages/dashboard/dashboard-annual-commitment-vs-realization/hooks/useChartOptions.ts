import { numberFormatter } from "#utils/formatter";
import { ChartOptions } from "chart.js";
import { useMemo } from "react";

type Props = {
  options?: ChartOptions<'bar'>
  language: string
}

export function useChartOptions({ options, language }: Props) {
  return useMemo(() => ({
    ...options,
    plugins: {
      legend: { display: true },
      ...options?.plugins
    },
    scales: {
      x: {
        ticks: {
          callback: (value: number | string) =>
            numberFormatter(value as number, language),
        },
        ...options?.scales?.x
      },
      y: {
        ...options?.scales?.y
      }
    },

  }), [language]);
}
