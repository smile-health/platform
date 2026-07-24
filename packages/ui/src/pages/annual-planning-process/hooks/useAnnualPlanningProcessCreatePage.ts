import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { getUserStorage } from "#utils/storage/user"
import { AnnualPlanningProcessForm, AnnualPlanningProcessFormKey, UpdateAnnualPlanningProcessPopulationBody, UserTag } from "../annual-planning-process.types"
import { ENTITY_TYPE } from "#constants/entity"
import { useForm } from "react-hook-form"
import {
  fetchDetailDistrictIP,
  fetchGroupTarget,
  fetchHealthCare,
  mergeTotalsPopulationCorrection,
  resultCalculationPopulation,
  setFormDataPopulationTarget,
  setFormUsageIndex,
  setInitialValuesForm,
  toKeyValueMap,
  toSnakeCase
} from "../annual-planning-process.utils"
import { useMutation } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import {
  createAnnualPlanningProcess,
  createAnnualPlanningProcessPopulation,
  createAnnualPlanningProcessResult,
  getDetailAnnualPlanningProcess,
  updateAnnualPlanningProcessPopulation,
} from "../annual-planning-process.services"
import { toast } from "#components/toast"
import { AxiosError } from "axios"
import { useSetLoadingPopupStore } from "#hooks/useSetLoading"
import { useLoadingPopupStore } from "#store/loading.store"
import { useInformationPopulationTarget } from "./useInformationPopulationTarget"
import { getProgramStorage } from "#utils/storage/program"
import { AnnualPlanningProcessStatus } from "../annual-planning-process.constants"
import { useDataGroupTarget } from "../store/group-target.store"

type Props = {
  isDraft?: boolean
}

export const useAnnualPlanningProcessCreatePage = (props?: Props) => {
  const { isDraft } = props ?? {}
  const { t } = useTranslation('annualPlanningProcess')
  const { setLoadingPopup } = useLoadingPopupStore()
  const { mutateCentralPopulation, central_population, resetCentralPopulation } = useInformationPopulationTarget()
  const { setGroupTarget } = useDataGroupTarget()
  const user = getUserStorage()
  const program = getProgramStorage()
  const params = useParams()
  const id = params?.id
  const [step, setStep] = useState(0)
  const [isUpdatePopulationCorrection, setIsUpdatePopulationCorrection] = useState(false)
  const { watch, setValue } = useForm<AnnualPlanningProcessForm>({
    defaultValues: setInitialValuesForm({ user }),
  })

  const {
    mutate: mutateAnnualPlanningDetail,
    isPending: isPendingDetail
  } = useMutation({
    mutationKey: ["getDetailAnnualPlanningProcess"],
    mutationFn: () => getDetailAnnualPlanningProcess(Number(id)),
    onSuccess: (res) => {
      const { id, program_plan, province, regency, status } = res
      setValue('area_program_plan', {
        id,
        program_plan: {
          value: program_plan.id,
          label: program_plan.year,
        },
        province: {
          value: province.id,
          label: province.name,
        },
        regency: {
          value: regency.id,
          label: regency.name,
        },
        status,
      })
    },
    onError: (err: AxiosError) => {
      const { message } = err.response?.data as {
        message: string
      }
      toast.danger({ description: message })
    }
  })

  const onMutateAnnualPlanningProcess = async (data: AnnualPlanningProcessForm['area_program_plan']) => {
    if (data) {
      const { program_plan, province, regency } = data

      const payload = {
        province_id: province?.value ?? 0,
        regency_id: regency?.value ?? 0,
        entity_id: program.entity_id ?? 0,
        program_plan_id: program_plan?.value ?? 0,
      }

      return createAnnualPlanningProcess(payload)
    }
  }

  const handleSetDataDistrictIPWhenAvailable = async (id: number): Promise<boolean> => {
    const newDataPopulationTarget = await setFormDataPopulationTarget(id)

    if (newDataPopulationTarget.length > 0) {
      setValue('population_correction', newDataPopulationTarget)
      setValue('area_program_plan.id', id)
      setStep(prev => prev + 1)
      setIsUpdatePopulationCorrection(true)
      setLoadingPopup(false)
      return true
    }

    return false
  }

  const handleSetDataDistrictIP = async (id: number) => {
    setLoadingPopup(true)
    const { area_program_plan } = watch()

    mutateCentralPopulation({
      programPlanId: area_program_plan?.program_plan?.value || 0,
      regencyId: area_program_plan?.regency?.value || 0
    })

    const dataGroupTarget = await fetchGroupTarget(area_program_plan?.program_plan?.value || 0)
    setGroupTarget(dataGroupTarget)

    // handle set data district ip when available (status draft cases)
    const isAvailableDistrictIP = await handleSetDataDistrictIPWhenAvailable(id)
    if (isAvailableDistrictIP) return

    const dataHealthCare = await fetchHealthCare({
      province_id: area_program_plan?.province?.value,
      regency_id: area_program_plan?.regency?.value,
    })

    const populationTarget = dataGroupTarget.map(x => ({
      id: null,
      target_group_id: x.id,
      entity_id: null,
      key: toSnakeCase(x.name),
      name: x.name,
      percentage: null,
      qty: null,
      change_qty: null,
    }))

    setValue('population_correction', dataHealthCare.map(x => ({
      id: null,
      name: x.name,
      entity_id: x.id,
      sub_district: x.sub_district,
      data: populationTarget,
      updated_at: null,
      user: null,
    })), { shouldValidate: true })

    setValue('area_program_plan.id', id)
    setStep(prev => prev + 1)
    setLoadingPopup(false)
  }

  const {
    mutate: mutateAnnualPlanningProcessForm,
  } = useMutation({
    mutationKey: ["annualPlanningProcess"],
    onMutate: () => setLoadingPopup(true),
    mutationFn: (data: AnnualPlanningProcessForm['area_program_plan']) => onMutateAnnualPlanningProcess(data),
    onSuccess: (response, data) => {
      toast.success({
        description: data?.id ? t('create.toast.success.update') : t('create.toast.success.create'),
      })
      handleSetDataDistrictIP(response?.data?.insertId as number)
    },
    onError: (err: AxiosError) => {
      const { message } = err.response?.data as {
        message: string
      }
      setLoadingPopup(false)
      toast.danger({ description: message })
    },
  })

  const setPayloadCreatePopulation = ({
    data,
    annualNeedId,
    populationDataCentral,
    populationDataDistrict,
  }: {
    data: AnnualPlanningProcessForm['population_correction']
    annualNeedId: number
    populationDataCentral: Record<string, number>
    populationDataDistrict: Record<string, number>
  }) => {
    const payload = {
      annual_need_id: annualNeedId,
      entities: data?.map(x => ({
        entity_id: Number(x.entity_id),
        target_groups: x.data?.map(target => {
          const { resultPercentage, resultQty } = resultCalculationPopulation({
            target,
            populationDataCentral,
            populationDataDistrict,
          })

          return {
            target_group_id: target.target_group_id ?? 0,
            percentage: resultPercentage,
            population: resultQty,
            population_correction: target.change_qty ?? 0
          }
        }) ?? []
      })) ?? []
    }

    return payload
  }

  const setPayloadUpdatePopulation = ({
    data,
    populationDataCentral,
    populationDataDistrict,
  }: {
    data: AnnualPlanningProcessForm['population_correction']
    populationDataCentral: Record<string, number>
    populationDataDistrict: Record<string, number>
  }) => {
    const result: UpdateAnnualPlanningProcessPopulationBody = []

    data?.forEach(population => {
      population?.data?.forEach(target => {
        const { resultPercentage, resultQty } = resultCalculationPopulation({
          target,
          populationDataCentral,
          populationDataDistrict,
        })

        result.push({
          id: Number(target.id ?? 0),
          population_correction: Number(target.change_qty ?? 0),
          percentage: resultPercentage,
          population: resultQty,
          status: target.status ?? AnnualPlanningProcessStatus.APPROVED
        })
      })
    })

    return result
  }

  const onMutateAnnualPlanningProcessPopulation = async (data: AnnualPlanningProcessForm['population_correction']) => {
    const areaProgramPlan = watch('area_program_plan')

    if (data && areaProgramPlan?.id) {
      const populationDataCentral = toKeyValueMap(central_population.population_data)
      const populationDataDistrict = mergeTotalsPopulationCorrection(data)

      if (isUpdatePopulationCorrection) {
        const payload = setPayloadUpdatePopulation({
          data,
          populationDataCentral,
          populationDataDistrict,
        })

        return updateAnnualPlanningProcessPopulation(Number(areaProgramPlan.id), payload)
      } else {
        const payload = setPayloadCreatePopulation({
          data,
          annualNeedId: Number(areaProgramPlan.id),
          populationDataCentral,
          populationDataDistrict,
        })

        return createAnnualPlanningProcessPopulation(payload)
      }
    }
  }

  const handleSetUsageIndex = async () => {
    setLoadingPopup(true)
    const { area_program_plan } = watch()

    // handle update for population currection when user back to step 2
    const newDataPopulationTarget = await setFormDataPopulationTarget(Number(area_program_plan?.id))
    setValue('population_correction', newDataPopulationTarget, { shouldValidate: true })

    const res = await fetchDetailDistrictIP(Number(area_program_plan?.id || 0))
    const dataMaterialIP = res?.data && res.data.length > 0 ? res.data : null

    const newUsageIndex = dataMaterialIP?.map(x => ({
      ...x,
      national_ip: x.ip ?? x.national_ip,
      district_ip: x.regency_ip ?? null,
      status: x.status ?? null,
    }))

    setValue('usage_index', newUsageIndex, { shouldValidate: true })
    setStep(prev => prev + 1)
    setIsUpdatePopulationCorrection(false)
    setLoadingPopup(false)
  }

  const refetchUsageIndex = async () => {
    setLoadingPopup(true)
    const { area_program_plan } = watch()

    const newData = await setFormUsageIndex(Number(area_program_plan?.id))

    setValue('usage_index', newData, { shouldValidate: true })

    setLoadingPopup(false)
  }

  const {
    mutate: mutateAnnualPlanningProcessPopulation,
    isPending: isPendingAnnualPlanningProcessPopulation,
  } = useMutation({
    mutationKey: ["annualPlanningProcessPopulation"],
    mutationFn: (data: AnnualPlanningProcessForm['population_correction']) => onMutateAnnualPlanningProcessPopulation(data),
    onSuccess: () => {
      toast.success({ description: t('create.toast.success.create_population') })
      handleSetUsageIndex()
    },
    onError: (err: AxiosError) => {
      const { message } = err.response?.data as {
        message: string
      }
      toast.danger({ description: message })
    },
  })

  const {
    mutate: mutateAnnualPlanningProcessResult,
    isPending: isPendingAnnualPlanningProcessResult,
  } = useMutation({
    mutationKey: ["annualPlanningProcessResult"],
    mutationFn: () => {
      const { area_program_plan } = watch()
      const payload = {
        annual_need_id: Number(area_program_plan?.id),
      }
      return createAnnualPlanningProcessResult(payload)
    },
    onSuccess: () => {
      toast.success({ description: t('create.toast.success.create_population') })
      setStep(prev => prev + 1)
    },
    onError: (err: AxiosError) => {
      const { message } = err.response?.data as {
        message: string
      }
      toast.danger({ description: message })
    },
  })

  const userTag: UserTag = useMemo(() => {
    if (user?.entity.type === ENTITY_TYPE.PROVINSI) return ENTITY_TYPE.PROVINSI
    if (user?.entity.type === ENTITY_TYPE.KOTA) return ENTITY_TYPE.KOTA
    return null
  }, [user])

  const updateForm = (
    type: AnnualPlanningProcessFormKey,
    data: AnnualPlanningProcessForm[AnnualPlanningProcessFormKey]
  ) => {
    setValue(type, data)
    if (type === 'area_program_plan') {
      if (!isDraft) {
        mutateAnnualPlanningProcessForm(data as AnnualPlanningProcessForm['area_program_plan'])
      } else {
        handleSetDataDistrictIP(Number(id))
      }
    }
    else if (type === 'population_correction') mutateAnnualPlanningProcessPopulation(data as AnnualPlanningProcessForm['population_correction'])
    else if (type === 'usage_index') mutateAnnualPlanningProcessResult()
  }

  useEffect(() => {
    resetCentralPopulation()
  }, [])

  useEffect(() => {
    if (id) mutateAnnualPlanningDetail()
  }, [id])

  useSetLoadingPopupStore(
    isPendingAnnualPlanningProcessPopulation ||
    isPendingAnnualPlanningProcessResult ||
    isPendingDetail
  )

  return {
    t,
    userTag,
    step,
    parentForm: watch(),
    updateForm,
    refetchUsageIndex,
    setStep,
  }
}