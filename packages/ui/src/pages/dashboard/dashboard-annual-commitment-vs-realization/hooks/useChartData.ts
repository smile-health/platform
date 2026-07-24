import { useMemo } from "react";

type Props = {
  labels?: string[] | null
  datasets?: Array<{
    label: string
    value: number
    color: string
  }>
  bar_thickness?: number
}

export function useChartData({ datasets, labels, bar_thickness = 32 }: Props) {
  return useMemo(() => ({
    data: {
      labels: labels ?? [''],
      datasets: datasets?.map(dataset => ({
        ...dataset,
        data: [dataset.value || 0],
        backgroundColor: dataset.color,
        barThickness: bar_thickness,
      })) ?? []
    },
  }), [datasets, labels, bar_thickness]);
}
