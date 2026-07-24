import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { AnnualPlanningProcessCreateContext } from '../context/ContextProvider';
import { FormDefineDistrictIPDataForm } from '../annual-planning-process.types';
import { formSchemaDefineDistrictIP } from '../annual-planning-process.schemas';
import { ProcessStatus } from '../annual-planning-process.constants';
import {
  createAnnualPlanningProcessDistrictIP,
  updateAnnualPlanningProcessDistrictIP,
  updateStatusAnnualPlanningProcessDistrictIP
} from '../annual-planning-process.services';
import { toast } from '#components/toast';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useSetLoadingPopupStore } from '#hooks/useSetLoading';

type Props = {
  onClose: () => void
  dataIP: FormDefineDistrictIPDataForm | null
  handleUpdateForm: (values: FormDefineDistrictIPDataForm) => void
}

export const useFormDefineDistrictIPInput = (props: Props) => {
  const { onClose, dataIP, handleUpdateForm } = props
  const { t, i18n: { language } } = useTranslation(['annualPlanningProcess', 'common'])
  const {
    parentForm,
    isReview,
    isRevision,
    refetchUsageIndex,
  } = useContext(AnnualPlanningProcessCreateContext)
  const methods = useForm<FormDefineDistrictIPDataForm>({
    resolver: yupResolver(formSchemaDefineDistrictIP(t)),
    mode: 'onChange',
    defaultValues: {
      data: dataIP?.data ?? []
    }
  })

  const {
    control,
    watch,
    formState: { isValid },
    handleSubmit,
    getValues,
  } = methods
  const data = watch('data')

  const handleSetStatusAll = (status: ProcessStatus) => {
    const newValue = data.map(x => ({ ...x, status }))
    methods.setValue('data', newValue, { shouldValidate: true })
  }

  const onSuccess = () => {
    toast.success({ description: t('create.toast.success.update_district_ip') })

    const data = getValues()
    handleUpdateForm(data)
    refetchUsageIndex?.()
    onClose()
  }

  const onError = (err: AxiosError) => {
    const { message } = err.response?.data as {
      message: string
    }
    toast.danger({ description: message })
  }

  const {
    mutate: mutateSubmit,
    isPending: isPendingSubmit,
  } = useMutation({
    mutationKey: ["annualPlanningProcessDistrictIP"],
    mutationFn: (data: FormDefineDistrictIPDataForm['data']) => {
      const { area_program_plan } = parentForm

      const payload = {
        annual_need_id: Number(area_program_plan?.id),
        ips: data?.map(x => ({
          material_id: x.material?.id ?? 0,
          activity_id: x.activity?.id ?? 0,
          sku: x.sku ?? 0,
          national_ip: x.national_ip ?? 0,
          regency_ip: x.district_ip ?? 0,
          target_group_id: x.target_group?.id ?? 0,
        })) ?? []
      }

      return createAnnualPlanningProcessDistrictIP(payload)
    },
    onSuccess,
    onError,
  })

  const {
    mutate: mutateUpdate,
    isPending: isPendingUpdate,
  } = useMutation({
    mutationKey: ["annualPlanningProcessDistrictIPUpdateStatus"],
    mutationFn: (data: FormDefineDistrictIPDataForm['data']) => {
      const { area_program_plan } = parentForm

      const payload = data?.map(x => ({
        id: x.id ?? 0,
        status: Number(x.status)
      })) ?? []

      return updateStatusAnnualPlanningProcessDistrictIP(Number(area_program_plan?.id), payload)
    },
    onSuccess,
    onError,
  })

  const {
    mutate: mutateRevise,
    isPending: isPendingRevise,
  } = useMutation({
    mutationKey: ["annualPlanningProcessDistrictIPUpdateRegencyIP"],
    mutationFn: (data: FormDefineDistrictIPDataForm['data']) => {
      const { area_program_plan } = parentForm

      const payload = data?.map(materialIP => ({
        id: materialIP.id ?? 0,
        status: materialIP.status ?? ProcessStatus.APPROVED,
        regency_ip: materialIP.district_ip ?? 0,
      })) ?? []

      return updateAnnualPlanningProcessDistrictIP(Number(area_program_plan?.id), payload)
    },
    onSuccess,
    onError,
  })

  const onSubmit = ({ data }: FormDefineDistrictIPDataForm) => {
    if (isReview) {
      mutateUpdate(data)
    } else if (isRevision) {
      mutateRevise(data)
    } else {
      mutateSubmit(data)
    }
  }

  useSetLoadingPopupStore(isPendingSubmit || isPendingUpdate || isPendingRevise)

  return {
    t,
    control,
    isValid,
    handleSubmit,
    onSubmit,
    data,
    parentForm,
    isRevision,
    isReview,
    language,
    handleSetStatusAll,
    onClose,
  }
}