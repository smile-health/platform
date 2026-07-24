import { useMemo, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { useTranslation } from "react-i18next"
import { useMutation } from "@tanstack/react-query"

import { formSchemaFilterCalculationResult } from "../annual-planning-process.schemas"
import {
  DataCalculationResult,
  FormCalculationResultFilterForm,
  FormDefineDistrictIPForm,
  FormPopulationCorrectionForm,
  GetDataDetailMonthlyCalculationResultResponse
} from "../annual-planning-process.types"
import {
  exportAnnualPlanningResult,
  getDataDetailMonthlyCalculationResult,
  listCalculationResult,
  updateAnnualPlanningProcess
} from "../annual-planning-process.services"
import { useSetLoadingPopupStore } from "#hooks/useSetLoading"
import { FormCalculationResultModalDetailHandle } from "../components/FormCalculationResultModalDetail"
import useSmileRouter from "#hooks/useSmileRouter"
import { AxiosError } from "axios"
import { toast } from "#components/toast"
import { AnnualPlanningProcessStatus, ProcessStatus } from "../annual-planning-process.constants"
import { getReactSelectValue } from "#utils/react-select"

type Props = {
  id?: string | number | null
  population_correction?: FormPopulationCorrectionForm[] | null
  usage_index?: FormDefineDistrictIPForm[] | null
  isReview?: boolean
  isRevision?: boolean
}
export const useFormCalculationResult = (props: Props) => {
  const { t, i18n: { language } } = useTranslation(['annualPlanningProcess', 'common'])
  const { push } = useSmileRouter()
  const refModalDetail = useRef<FormCalculationResultModalDetailHandle>(null)
  const [pagination, setPagination] = useState<{
    page: number
    paginate: number
  }>({ page: 1, paginate: 10 })
  const methods = useForm<FormCalculationResultFilterForm>({
    defaultValues: {
      activity: null,
      material: null,
      entity: null
    },
    resolver: yupResolver(formSchemaFilterCalculationResult)
  })
  const [dataDetail, setDataDetail] = useState<GetDataDetailMonthlyCalculationResultResponse | null>(null)
  const [openConfirmation, setOpenConfirmation] = useState(false)
  const [filterLabel, setFilterLabel] = useState<{
    material_name: string
    activity_name: string
    material_subtype: string | number
  }>({
    material_name: '',
    activity_name: '',
    material_subtype: 0,
  })
  const { activity, entity, material } = methods.watch()

  const isStillNeedRevision: boolean = useMemo(() => {
    let result: boolean = false

    result = props?.population_correction?.some(population => {
      return population.data?.some(targetPopulation => targetPopulation.status === ProcessStatus.REJECT)
    }) || false

    if (!result) {
      result = props?.usage_index?.some(index => {
        return index.status === ProcessStatus.REJECT
      }) || false
    }

    return result
  }, [props?.population_correction, props?.usage_index])

  const {
    mutate,
    isPending,
    data: datasource,
    reset: mutateReset,
  } = useMutation({
    mutationKey: ['calculation-result-list'],
    mutationFn: () => {
      const { page, paginate } = pagination
      const params = {
        page,
        paginate,
        ...activity && { activity_id: activity.value },
        ...entity && { entity_id: entity.value },
        ...material && { material_id: material.value },
      }
      setFilterLabel({
        material_name: material?.label ?? '',
        activity_name: activity?.label ?? '',
        material_subtype: material?.material_subtype ?? 0,
      })

      return listCalculationResult(props?.id ?? 0, params)
    },
  })

  const {
    mutate: mutateExport,
    isPending: isPendingExport,
  } = useMutation({
    mutationKey: ['export-annual-planning-result'],
    mutationFn: () => {
      const params = {
        ...activity && { activity_id: activity.value },
        ...entity && { entity_id: entity.value },
        ...material && { material_id: material.value },
      }

      return exportAnnualPlanningResult(props?.id ?? 0, params)
    },
    onSuccess: () => {
      toast.success({ description: t('annualPlanningProcess:detail.export.toast.success') })
    },
    onError: (err: AxiosError) => {
      const { message } = err.response?.data as { message: string }
      toast.danger({ description: message })
    },
  })

  const handleSearch = () => {
    if (!getReactSelectValue(activity) || !getReactSelectValue(material)) return

    setPagination(prev => ({ ...prev, page: 1 }))
    mutate()
  }

  const handleReset = () => {
    methods.reset({
      activity: null,
      material: null,
      entity: null
    })
    setFilterLabel({
      material_name: '',
      activity_name: '',
      material_subtype: 0,
    })
    setPagination({ page: 1, paginate: 10 })
    mutateReset()
  }

  const handleOnChangeReset = () => {
    setPagination({ page: 1, paginate: 10 })
    mutateReset()
  }

  const {
    mutate: updateStatus,
    isPending: isPendingUpdateStatus,
  } = useMutation({
    mutationKey: ["annualPlanningProcessUpdateStatus"],
    mutationFn: (status: number) => updateAnnualPlanningProcess(Number(props?.id ?? 0), { status }),
    onSuccess: () => {
      toast.success({ description: t('annualPlanningProcess:create.toast.success.update_status') })
      push('/v5/annual-planning')
    },
    onError: (err: AxiosError) => {
      const { message } = err.response?.data as {
        message: string
      }
      toast.danger({ description: message })
    },
  })

  const handleChangePage = (page: number) => {
    setPagination(prev => ({ ...prev, page }))
    mutate()
  }

  const handleChangePaginate = (paginate: number) => {
    setPagination({ paginate, page: 1 })
    mutate()
  }

  const {
    mutate: fetchDetailMonthlyCalculationResult,
    isPending: isPendingFetchDetailMonthlyCalculationResult,
  } = useMutation({
    mutationKey: ["annualPlanningProcessFetchDetailMonthlyCalculationResult"],
    mutationFn: (data: DataCalculationResult) => {
      const { entity, material } = data
      const params = {
        entity_id: entity.id,
        material_id: material.id,
        activity_id: activity?.value,
      }

      return getDataDetailMonthlyCalculationResult(props?.id ?? 0, params)
    },
    onSuccess: (data) => {
      setDataDetail(data)
      refModalDetail.current?.open()
    },
    onError: (err: AxiosError) => {
      const { message } = err.response?.data as {
        message: string
      }
      toast.danger({ description: message })
    },
  })

  const handleSubmitConfirmation = () => {
    if (props?.isReview) {
      const status = isStillNeedRevision ? AnnualPlanningProcessStatus.REVISION : AnnualPlanningProcessStatus.APPROVED
      updateStatus(status)
    } else {
      updateStatus(AnnualPlanningProcessStatus.DESK)
    }
  }

  useSetLoadingPopupStore(
    isPending ||
    isPendingUpdateStatus ||
    isPendingFetchDetailMonthlyCalculationResult ||
    isPendingExport
  )

  const descriptionConfirmation = useMemo(() => {
    if (props?.isReview) {
      if (isStillNeedRevision) return t('annualPlanningProcess:create.form.calculation_result.confirmation.description.review.revised')
      return t('annualPlanningProcess:create.form.calculation_result.confirmation.description.review.approved')
    }
    if (props?.isRevision) return t('annualPlanningProcess:create.form.calculation_result.confirmation.description.revision')

    return t('annualPlanningProcess:create.form.calculation_result.confirmation.description.submit')
  }, [t, props?.isReview, props?.isRevision])

  return {
    t,
    language,
    methods,
    datasource,
    pagination,
    refModalDetail,
    dataDetail,
    openConfirmation,
    descriptionConfirmation,
    setOpenConfirmation,
    handleSearch,
    handleReset,
    handleChangePage,
    handleChangePaginate,
    onClickRow: fetchDetailMonthlyCalculationResult,
    handleSubmitConfirmation,
    materialName: filterLabel.material_name,
    activityName: filterLabel.activity_name,
    materialSubtype: filterLabel.material_subtype,
    handleOnChangeReset,
    mutateExport,
  }
}