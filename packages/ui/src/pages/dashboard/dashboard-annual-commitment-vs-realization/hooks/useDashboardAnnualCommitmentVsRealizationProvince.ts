import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { OptionType } from "#components/react-select"

import { useChartOptions } from "./useChartOptions"
import { CHART_OPTIONS, createColumns, createDownloadConfig } from "../dashboard-annual-commitment-vs-realization.constant"
import { AnnualCommitmentVsRealizationProvinceData, DataStackedBar } from "../dashboard-annual-commitment-vs-realization.type"

type Props = {
  data: AnnualCommitmentVsRealizationProvinceData[]
}

export const useDashboardAnnualCommitmentVsRealizationProvince = ({ data }: Props) => {
  const { t, i18n: { language } } = useTranslation('dashboardAnnualCommitmentVsRealization')
  const [province, setProvince] = useState<OptionType | null>(null)
  const chartOption = useChartOptions({
    language,
    options: CHART_OPTIONS.province
  })
  const downloadConfig = useMemo(() => createDownloadConfig(t), [t])
  const columns = useMemo(() => createColumns({ t, language }), [t, language])

  const reformatDatatoChart = (data: AnnualCommitmentVsRealizationProvinceData[], province: OptionType | null) => {
    const filteredData = province ?
      data.filter((item) => item.province.id === province.value && item.is_commitment) :
      data.filter((item) => item.is_commitment)

    return filteredData.reduce((acc: { labels: string[], datasets: DataStackedBar['data']['datasets'] }, item) => {
      acc.labels.push(item.province.name)

      if (acc.datasets.length === 0) {
        const dataCentralBufferReceipt = {
          label: t('columns.central_buffer_receipt'),
          data: [item.total_used_buffer_dose],
          backgroundColor: '#FFC002',
          stack: 'total',
          barThickness: 32
        }

        const dataAllocationShipped = {
          label: t('columns.allocation_shipped'),
          data: [item.total_used_reguler_dose],
          backgroundColor: '#4FC44D',
          stack: 'total',
          barThickness: 32
        }

        const dataAllocationNotShippedYet = {
          label: t('columns.allocation_not_shipped_yet'),
          data: [item.total_unused_reguler_dose],
          backgroundColor: '#D2D2D2',
          stack: 'total',
          barThickness: 32
        }

        acc.datasets.push(dataCentralBufferReceipt, dataAllocationShipped, dataAllocationNotShippedYet)
      } else {
        acc.datasets[0].data.push(item.total_used_buffer_dose)
        acc.datasets[1].data.push(item.total_used_reguler_dose)
        acc.datasets[2].data.push(item.total_unused_reguler_dose)
      }

      return acc
    }, {
      labels: [],
      datasets: []
    })
  }

  const chartData = useMemo(() => reformatDatatoChart(data, province), [data, t, language, province])

  const dataTable = useMemo(() => {
    const filteredData = province ?
      data.filter((item) => item.province.id === province.value && item.is_commitment) :
      data.filter((item) => item.is_commitment)
    return filteredData
  }, [data, province])

  return {
    t,
    language,
    province,
    setProvince,
    chartOption,
    downloadConfig,
    columns,
    chartData,
    dataTable
  }
}