import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useFilter, UseFilter } from '#components/filter'
import { createFilterSchema } from '../dashboard-annual-commitment-vs-realization.schema'
import { getProgramStorage } from '#utils/storage/program'
import { Information } from '../dashboard-annual-commitment-vs-realization.type'
import { useChartOptions } from './useChartOptions'
import { CHART_OPTIONS, createDownloadConfig } from '../dashboard-annual-commitment-vs-realization.constant'
import { createMilestonePlugin } from '../dashboard-annual-commitment-vs-realization.plugins'
import { useChartData } from './useChartData'
import { useMutation, useQueries } from '@tanstack/react-query'
import {
  exportAnnualCommitmentVsRealization,
  getAnnualCommitmentVsRealizationNational,
  getAnnualCommitmentVsRealizationRequirementAndRemaining,
  getAnnualCommitmentVsRealizationSummary,
  getAnnualCommitmentVsRealizationTarget,
  listAnnualCommitmentVsRealizationProvince
} from '../dashboard-annual-commitment-vs-realization.service'
import { getReactSelectValue } from '#utils/react-select'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { AxiosError } from 'axios'
import { toast } from '#components/toast'

export const useDashboardAnnualCommitmentVsRealizationPage = () => {
  const { t, i18n: { language } } = useTranslation('dashboardAnnualCommitmentVsRealization')
  const program = getProgramStorage()
  const [isEnabled, setIsEnabled] = useState(false)
  const [information, setInformation] = useState<Information>({
    title: '',
    description: '',
    details: [],
  })
  const filterSchema = useMemo<UseFilter>(
    () => createFilterSchema({ t, program_id: program?.id }),
    [t]
  )
  const filter = useFilter(filterSchema)
  const { query } = filter

  const handleOpenInformation = ({ title, description, details }: Information) => {
    setInformation({
      title,
      description,
      details,
    })
  }

  const handleCloseInformation = () => {
    setInformation({
      title: '',
      description: '',
      details: [],
    })
  }

  const createParams = () => {
    const {
      year,
      material_type_id,
      material_ids,
      contract_numbers,
    } = query

    const params = {
      year: getReactSelectValue(year),
      material_type_id: getReactSelectValue(material_type_id),
      material_ids: getReactSelectValue(material_ids),
      contract_numbers: getReactSelectValue(contract_numbers),
    }
    return params
  }

  const { mutate: mutateExport, isPending: isPendingExport } = useMutation({
    mutationFn: () => exportAnnualCommitmentVsRealization(createParams()),
    onError: (err: AxiosError) => {
      const { message } = err.response?.data as {
        message: string
      }
      toast.danger({ description: message })
    }
  })

  const responsesData = useQueries({
    queries: [
      {
        queryKey: ['get-annual-commitment-vs-realization-summary', filter.query, language],
        queryFn: () => getAnnualCommitmentVsRealizationSummary(createParams()),
        staleTime: 0,
        enabled: isEnabled && !!filter.query?.year?.value,
      },
      {
        queryKey: ['get-annual-commitment-vs-realization-requirement-and-remaining', filter.query, language],
        queryFn: () => getAnnualCommitmentVsRealizationRequirementAndRemaining(createParams()),
        staleTime: 0,
        enabled: isEnabled && !!filter.query?.year?.value,
      },
      {
        queryKey: ['get-annual-commitment-vs-realization-national', filter.query, language],
        queryFn: () => getAnnualCommitmentVsRealizationNational(createParams()),
        staleTime: 0,
        enabled: isEnabled && !!filter.query?.year?.value,
      },
      {
        queryKey: ['get-annual-commitment-vs-realization-target', filter.query, language],
        queryFn: () => getAnnualCommitmentVsRealizationTarget(createParams()),
        staleTime: 0,
        enabled: isEnabled && !!filter.query?.year?.value,
      },
      {
        queryKey: ['list-annual-commitment-vs-realization-province', filter.query, language],
        queryFn: () => listAnnualCommitmentVsRealizationProvince(createParams()),
        staleTime: 0,
        enabled: isEnabled && !!filter.query?.year?.value,
      },
    ],
  });
  const [
    metricSummary,
    chartRequirementAndRemaining,
    chartNational,
    chartTarget,
    dataProvince
  ] = responsesData

  const chartOptionRequirementAndRemaining = useChartOptions({
    language,
    options: CHART_OPTIONS.requirement_and_remaining
  })
  const chartOptionNational = useChartOptions({
    language,
    options: CHART_OPTIONS.national
  })
  const chartOptionTarget = useChartOptions({
    language,
    options: CHART_OPTIONS.target
  })

  const downloadConfig = useMemo(() => createDownloadConfig(t), [t])

  const milestonePlugin = useMemo(() => {
    return createMilestonePlugin({
      language,
      milestones: chartTarget.data?.flags,
      t,
    })
  }, [t, language, chartTarget.data?.flags])

  const dataRequirementAndRemaining = useChartData({
    labels: chartRequirementAndRemaining.data?.labels,
    datasets: chartRequirementAndRemaining.data?.datasets,
  })

  const dataNational = useChartData({
    labels: chartNational?.data?.labels,
    datasets: chartNational?.data?.datasets,
  })

  const dataRealizationAndTarget = useChartData({
    labels: chartTarget?.data?.labels,
    datasets: chartTarget?.data?.datasets,
  })

  useSetLoadingPopupStore(isPendingExport)

  return {
    t,
    information,
    filter,
    chartOptionRequirementAndRemaining,
    chartOptionNational,
    chartOptionTarget,
    downloadConfig,
    milestonePlugin,
    dataRequirementAndRemaining,
    dataNational,
    dataRealizationAndTarget,
    isEnabled,
    handleOpenInformation,
    handleCloseInformation,
    setIsEnabled,
    mutateExport,
    metricSummary,
    chartRequirementAndRemaining,
    chartNational,
    chartTarget,
    dataProvince
  }
}
