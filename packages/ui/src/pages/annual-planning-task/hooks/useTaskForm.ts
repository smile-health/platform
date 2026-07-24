import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { getProvince } from '#services/location'
import { createTask, editTask, getDetailTask } from '#services/task'
import {
  AmountOfGivingForm,
  CoverageForm,
  AmountOfGiving as TAmountOfGiving,
  TaskFormValues,
} from '#types/task'
import { AxiosError } from 'axios'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { formSchema } from '../schema/taskSchema'
import { getMaterialDetail } from '#services/material'
import { useLoadingPopupStore } from '#store/loading.store'
import { getErrorMessage } from '../utils/taskUtilsError'

type TCoverageModal = {
  type: 'add' | 'edit'
  data: null | AmountOfGivingForm
}

export default function useTaskForm(isEdit = false) {
  const params = useParams()
  const programPlanId = Number(params?.id)
  const taskId = Number(params?.taskId)
  const { t } = useTranslation(['common', 'task'])
  const router = useSmileRouter()
  const { setLoadingPopup } = useLoadingPopupStore()
  const [openAmountOfGivingModal, setOpenAmountOfGivingModal] = useState(false)
  const [openCoverageModal, setOpenCoverageModal] = useState<TCoverageModal>({
    type: 'add',
    data: null as AmountOfGivingForm | null,
  })
  const [consumptionUnitPerDistributionUnit, setConsumptionUnitPerDistributionUnit] = useState(1)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    clearErrors,
    watch,
  } = useForm<TaskFormValues>({
    resolver: yupResolver(formSchema(t)),
    defaultValues: {
      monthly_distribution: [],
      amount_of_giving: [],
    },
  })

  const queryClient = useQueryClient()

  const { data: detailTask } = useQuery({
    queryKey: ['detail-task', taskId],
    queryFn: () => getDetailTask(taskId),
    placeholderData: keepPreviousData,
    enabled: isEdit && Boolean(taskId),
  })

  const setValueAmountOfGiving = (consumptionUnitPerDistributionUnit: number) => {
    setValue(
      'amount_of_giving',
      detailTask?.target_groups.map((item) => ({
        group_target: {
          value: item.id,
          label: item.name,
        },
        number_of_doses: item.number_of_dose.toString(),
        national_ip: detailTask.ip.toString(),
        consumption_unit_per_distribution_unit: consumptionUnitPerDistributionUnit,
        target_coverage: item.coverages.map((coverage) => ({
          province_id: coverage.province.id,
          province_name: coverage.province.name,
          coverage_number: coverage.coverage_number,
        })),
      }))
    )
  }

  const { mutate: getDetailMaterial } = useMutation({
    mutationFn: (id: number) => getMaterialDetail(id),
    onSuccess: (data) => {
      if (isEdit) setValueAmountOfGiving(data.consumption_unit_per_distribution_unit)
      else setConsumptionUnitPerDistributionUnit(data.consumption_unit_per_distribution_unit)
    },
    onError: () => {
      if (isEdit) setValueAmountOfGiving(1)
      else setConsumptionUnitPerDistributionUnit(1)
    },
    onMutate: () => setLoadingPopup(true),
    onSettled: () => setLoadingPopup(false),
  })

  useEffect(() => {
    if (detailTask) {
      setValue('activity', {
        value: detailTask.activity.id,
        label: detailTask.activity.name,
      })
      setValue('material', {
        value: detailTask.material.id,
        label: detailTask.material.name,
      })
      setValue(
        'monthly_distribution',
        detailTask.month_distribution.split(',').map(Number)
      )
      getDetailMaterial(detailTask.material.id)
    }
  }, [detailTask])

  const { mutate: handleCreateTask, isPending: isPendingCreateTask } =
    useMutation({
      mutationFn: (data: TaskFormValues) => createTask(programPlanId, data),
      onSuccess: () => {
        toast.success({
          description: t('task:create.success'),
        })
        queryClient.invalidateQueries({
          queryKey: ['list-task'],
        })
        router.push(`/v5/program-plan/${programPlanId}/task`)
      },
      onError: (err: AxiosError) => {
        toast.danger({
          description: getErrorMessage(err) || t('task:create.error'),
        })
      },
    })

  const { mutate: handleEditTask, isPending: isPendingEditTask } = useMutation({
    mutationFn: (data: TaskFormValues) => editTask(taskId, data),
    onSuccess: () => {
      toast.success({
        description: t('task:edit.success'),
      })
      queryClient.invalidateQueries({
        queryKey: ['list-task'],
      })
      router.push(`/v5/program-plan/${programPlanId}/task`)
    },
    onError: (err: AxiosError) => {
      toast.danger({
        description: getErrorMessage(err) || t('task:edit.error'),
      })
    },
  })

  const monthlyDistribution = watch('monthly_distribution')
  const isDisabledAmountOfGivingButton =
    !watch('activity') || !watch('material')

  const onToggleMonthlyDistribution = (monthIndex: number) => {
    if (monthlyDistribution.includes(monthIndex)) {
      setValue(
        'monthly_distribution',
        monthlyDistribution.filter((index) => index !== monthIndex)
      )
    } else if (monthlyDistribution.length < 12) {
      setValue('monthly_distribution', [...monthlyDistribution, monthIndex])
    }
    clearErrors('monthly_distribution')
  }

  const onToggleAllMonthlyDistribution = () => {
    if (monthlyDistribution.length === 12) {
      setValue('monthly_distribution', [])
    } else {
      setValue('monthly_distribution', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
    }
    clearErrors('monthly_distribution')
  }

  const handleSaveAmountOfGiving = (data: TAmountOfGiving[]) => {
    const prevValue = watch('amount_of_giving') || []
    const newValue = data.map((item) => ({
      ...item,
      target_coverage:
        prevValue.find(
          (prev) => prev.group_target.value === item.group_target?.value
        )?.target_coverage || [],
    })) as AmountOfGivingForm[]

    clearErrors('amount_of_giving')

    if (isEdit) {
      setValue('amount_of_giving', [
        {
          ...prevValue[0],
          number_of_doses: data[0].number_of_doses,
          national_ip: data[0].national_ip,
        },
      ])
    } else {
      setValue('amount_of_giving', [...newValue])
    }
  }

  const { data: provinces } = useQuery({
    queryKey: ['list-province'],
    queryFn: () => getProvince({ page: 1, paginate: 100 }),
    placeholderData: keepPreviousData,
  })

  const handleClickCoverageButton = (
    type: 'add' | 'edit',
    amountOfGiving: AmountOfGivingForm
  ) => {
    setOpenCoverageModal({
      type,
      data: amountOfGiving,
    })
  }

  const handleClickNumberOfDoses = () => {
    setOpenAmountOfGivingModal(true)
  }

  const handleSaveCoverage = (data: CoverageForm[]) => {
    const newValue = watch('amount_of_giving') || []
    const selectedIndex = newValue.findIndex(
      (item) =>
        item.group_target.value === openCoverageModal.data?.group_target.value
    )

    if (selectedIndex === -1) return

    newValue[selectedIndex].target_coverage = data.map((item) => ({
      province_id: item.province.value,
      province_name: item.province.label,
      coverage_number: item.target as number,
    }))

    setValue('amount_of_giving', [...newValue])
    setOpenCoverageModal({ type: 'add', data: null })
  }

  useSetLoadingPopupStore(isPendingCreateTask || isPendingEditTask)

  return {
    programPlanId,
    openCoverageModal,
    isDisabledAmountOfGivingButton,
    openAmountOfGivingModal,
    errors,
    provinces: provinces?.data || [],
    monthlyDistribution,
    consumptionUnitPerDistributionUnit,
    watch,
    setValue,
    clearErrors,
    setOpenCoverageModal,
    onToggleMonthlyDistribution,
    onToggleAllMonthlyDistribution,
    onSaveAmountOfGiving: handleSaveAmountOfGiving,
    onCreateTask: handleCreateTask,
    onEditTask: handleEditTask,
    onClickNumberOfDoses: handleClickNumberOfDoses,
    onClickCoverageButton: handleClickCoverageButton,
    onSaveCoverage: handleSaveCoverage,
    register,
    handleSubmit,
    setOpenAmountOfGivingModal,
    getDetailMaterial,
  }
}
