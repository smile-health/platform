import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { yupResolver } from '@hookform/resolvers/yup'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { OptionType } from '#components/react-select'
import { AmountOfGiving, AmountOfGivingFormValues } from '#types/task'
import { useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { listAnnualPlanningTargetGroup } from '../../annual-planning-target-group/services/annual-planning-target-group.services'
import { amountOfGivingSchema } from '../schema/taskSchema'

export default function useAmountOfGiving(
  open: boolean,
  amountOfGiving: AmountOfGiving[]
) {
  const { t } = useTranslation(['common', 'task'])
  const params = useParams()
  const programPlanId = Number(params.id)

  const { data: dataListAnnualPlanningTargetGroup } = useQuery({
    queryKey: ['list-annual-planning-target-group', programPlanId],
    queryFn: async () => {
      const response = await listAnnualPlanningTargetGroup({
        page: 1,
        paginate: 100,
        programPlanId,
      })

      const list: OptionType[] = response.data.map((item) => ({
        label: item.name as string,
        value: item.id as number,
      }))

      return list
    },
    placeholderData: keepPreviousData,
    enabled: Boolean(programPlanId) && open,
  })

  const form = useForm<AmountOfGivingFormValues>({
    resolver: yupResolver(amountOfGivingSchema(t)),
    mode: 'onChange',
    defaultValues: {
      amount_of_giving: [],
    },
  })

  useEffect(() => {
    form.reset({
      amount_of_giving: open ? amountOfGiving : [],
    })
  }, [open, amountOfGiving])

  const { fields: inputFields } = useFieldArray({
    control: form.control,
    name: 'amount_of_giving',
  })

  const generatedFilteredOptionsTargetGroup = useCallback(
    (selectedTargetGroup: OptionType | null) => {
      const otherSelectedTargetGroup = form
        .getValues('amount_of_giving')
        .filter((item) => item.group_target?.value)
        .map((item) => item.group_target?.value)

      return dataListAnnualPlanningTargetGroup?.filter((item) => {
        if (item.value === selectedTargetGroup?.value) return true

        return !otherSelectedTargetGroup.includes(item.value)
      })
    },
    [dataListAnnualPlanningTargetGroup, form]
  )

  const [confirmationCloseModal, setConfirmationCloseModal] = useState(false)

  const handleSubmit = (fallback: (data: AmountOfGiving[]) => void) => {
    const values = form.getValues().amount_of_giving || []

    let isError = false
    values.forEach((item, index) => {
      if (!item.group_target?.value) {
        isError = true
        form.setError(
          `amount_of_giving.${index}.group_target`,
          { message: t('common:validation.required') },
          { shouldFocus: true }
        )
      }
      if (!item.number_of_doses) {
        isError = true
        form.setError(
          `amount_of_giving.${index}.number_of_doses`,
          { message: t('common:validation.required') },
          { shouldFocus: true }
        )
      }
      if (!item.national_ip) {
        isError = true
        form.setError(
          `amount_of_giving.${index}.national_ip`,
          { message: t('common:validation.required') },
          { shouldFocus: true }
        )
      }
      if (!!form.formState.errors?.amount_of_giving?.[index]?.national_ip) {
        isError = true
      }
    })

    if (isError) return

    fallback(values)
  }

  return {
    generatedFilteredOptionsTargetGroup,
    form,
    control: form.control,
    errors: form.formState.errors,
    inputFields,
    confirmationCloseModal,
    handleSubmit,
    watch: form.watch,
    setValue: form.setValue,
    setError: form.setError,
    clearErrors: form.clearErrors,
    setConfirmationCloseModal,
  }
}
