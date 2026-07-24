import { useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { useParams } from "next/navigation"

import { getUserStorage } from "#utils/storage/user"
import { AnnualPlanningProcessForm, AnnualPlanningProcessFormKey, UpdateAnnualPlanningProcessPopulationBody, UserTag } from "../annual-planning-process.types"
import { ENTITY_TYPE } from "#constants/entity"
import { fetchGroupTarget, mergeTotalsPopulationCorrection, resultCalculationPopulation, setFormDataPopulationTarget, setFormUsageIndex, setInitialValuesForm, toKeyValueMap } from "../annual-planning-process.utils"
import { getDetailAnnualPlanningProcess, updateAnnualPlanningProcessPopulation, createAnnualPlanningProcessResult } from "../annual-planning-process.services"
import { useSetLoadingPopupStore } from "#hooks/useSetLoading"
import { toast } from "#components/toast"
import { AxiosError } from "axios"
import { ProcessStatus } from "../annual-planning-process.constants"
import { useLoadingPopupStore } from "#store/loading.store"
import { useInformationPopulationTarget } from "./useInformationPopulationTarget"
import { useDataGroupTarget } from "../store/group-target.store"

export const useAnnualPlanningProcessRevisionPage = () => {
  const { t } = useTranslation('annualPlanningProcess')
  const { setLoadingPopup } = useLoadingPopupStore()
  const {
    mutateCentralPopulation,
    central_population,
    resetCentralPopulation
  } = useInformationPopulationTarget()
  const { setGroupTarget } = useDataGroupTarget()
  const user = getUserStorage()
  const params = useParams()
  const id = params?.id
  const [step, setStep] = useState(0)
  const { watch, setValue } = useForm<AnnualPlanningProcessForm>({
    defaultValues: setInitialValuesForm({ user }),
  })

  const userTag: UserTag = useMemo(() => {
    if (user?.entity.type === ENTITY_TYPE.PROVINSI) return ENTITY_TYPE.PROVINSI
    if (user?.entity.type === ENTITY_TYPE.KOTA) return ENTITY_TYPE.KOTA
    return null
  }, [user])

  const {
    data,
    isSuccess,
    isPending,
  } = useQuery({
    queryKey: ["getDetailAnnualPlanningProcess"],
    queryFn: () => getDetailAnnualPlanningProcess(Number(id)),
    enabled: !!id
  })

  const onMutateAnnualPlanningProcessPopulation = async (data: AnnualPlanningProcessForm['population_correction']) => {
    const {
      area_program_plan,
    } = watch()

    if (data && area_program_plan?.id) {
      const payload: UpdateAnnualPlanningProcessPopulationBody = []

      const populationDataCentral = toKeyValueMap(central_population.population_data)
      const populationDataDistrict = mergeTotalsPopulationCorrection(data)

      data.forEach(population => {
        population?.data?.filter(target => target.status === ProcessStatus.REJECT).forEach(target => {
          const { resultPercentage, resultQty } = resultCalculationPopulation({
            target,
            populationDataCentral,
            populationDataDistrict,
          })
          payload.push({
            id: Number(target.id ?? 0),
            percentage: resultPercentage,
            population_correction: Number(target.change_qty ?? 0),
            population: resultQty,
            status: target.status ?? ProcessStatus.REJECT, // submit only population need revision
          })
        })
      })

      return updateAnnualPlanningProcessPopulation(Number(area_program_plan.id), payload)
    }
  }

  const refetchPopulationTarget = async () => {
    const { area_program_plan } = watch()

    const newDataPopulationTarget = await setFormDataPopulationTarget(Number(area_program_plan?.id))

    setValue('population_correction', newDataPopulationTarget, { shouldValidate: true })
  }

  const handleSetUsageIndex = async () => {
    setLoadingPopup(true)
    const { area_program_plan } = watch()
    await refetchPopulationTarget()
    const newData = await setFormUsageIndex(Number(area_program_plan?.id))

    setValue('usage_index', newData, { shouldValidate: true })

    setStep(prev => prev + 1)
    setLoadingPopup(false)
  }

  const {
    mutate: mutateAnnualPlanningProcessPopulation,
    isPending: isPendingAnnualPlanningProcessPopulation,
  } = useMutation({
    mutationKey: ["annualPlanningProcessPopulation"],
    mutationFn: (data: AnnualPlanningProcessForm['population_correction']) => onMutateAnnualPlanningProcessPopulation(data),
    onSuccess: () => {
      toast.success({ description: t('create.toast.success.update_population') })
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
        annual_need_id: Number(area_program_plan?.id)
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

  const updateForm = (
    type: AnnualPlanningProcessFormKey,
    data: AnnualPlanningProcessForm[AnnualPlanningProcessFormKey]
  ) => {
    setValue(type, data)
    if (type === 'population_correction') mutateAnnualPlanningProcessPopulation(data as AnnualPlanningProcessForm['population_correction'])
    else if (type === 'usage_index') mutateAnnualPlanningProcessResult()
  }

  const setDataPopulationTarget = async (id: number, programPlanId: number, regencyId: number) => {
    const newDataPopulationTarget = await setFormDataPopulationTarget(id)

    mutateCentralPopulation({
      programPlanId,
      regencyId
    })

    const dataGroupTarget = await fetchGroupTarget(programPlanId)
    setGroupTarget(dataGroupTarget)

    setValue('population_correction', newDataPopulationTarget, { shouldValidate: true })
  }

  const refetchUsageIndex = async () => {
    setLoadingPopup(true)
    const { area_program_plan } = watch()

    const newData = await setFormUsageIndex(Number(area_program_plan?.id))

    setValue('usage_index', newData, { shouldValidate: true })

    setLoadingPopup(false)
  }

  useEffect(() => {
    resetCentralPopulation()
  }, [])

  useEffect(() => {
    if (data && isSuccess) {
      const { id, program_plan, province, regency, status } = data
      setValue("area_program_plan", {
        id: id,
        regency: { label: regency.name, value: regency.id },
        province: { label: province.name, value: province.id },
        program_plan: { label: program_plan.year, value: program_plan.id },
        entity: null,
        status,
      })
      setDataPopulationTarget(id, program_plan.id, regency.id)
    }
  }, [data, isSuccess])

  useSetLoadingPopupStore(
    isPending ||
    isPendingAnnualPlanningProcessPopulation ||
    isPendingAnnualPlanningProcessResult
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