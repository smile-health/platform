import { useParams } from 'next/navigation'
import { useFeatureIsOn } from '@growthbook/growthbook-react'
import { yupResolver } from '@hookform/resolvers/yup'
import { OptionType } from '#components/react-select'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { useProfile } from '#shared/auth'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { TAssetInventory } from '../../list/libs/asset-inventory-list.types'
import { WorkingStatusEnum } from '../libs/asset-inventory-constant'
import { processingForm } from '../libs/asset-inventory-form.common'
import {
  AssetInventoryFormData,
  AssetInventoryFormSubmitData,
  WorkingStatusOption,
} from '../libs/asset-inventory-form.type'
import { assetInventoryFormValidation } from '../libs/asset-inventory-form.validation-schema'
import { handleDefaultValues } from '../libs/asset-inventory-helper'
import { useSubmitAssetInventory } from './useSubmitAssetInventory'

type useAssetInventoryFormProps = {
  data?: TAssetInventory | null
}

export const useAssetInventoryForm = ({
  data,
}: useAssetInventoryFormProps = {}) => {
  const { t } = useTranslation(['common', 'assetInventory'])
  const {
    NEED_REPAIR,
    UNSUBSCRIBED,
    NOT_USED,
    DEFROSTING,
    UNREPAIRABLE,
    DAMAGED,
    REPAIR,
    STANDBY,
    FUNCTION,
  } = WorkingStatusEnum

  const isEnabledProgramIdSelection = useFeatureIsOn(
    'operational_asset_inventory.program_ids'
  )

  const { data: profile } = useProfile()
  const params = useParams()
  const isEditPage = params?.id
  const profileId = profile?.id ?? null

  const methods = useForm({
    mode: 'onChange',
    defaultValues: handleDefaultValues(Boolean(isEditPage), t, data, profile),
    resolver: yupResolver(assetInventoryFormValidation(t)),
  })

  const {
    control,
    handleSubmit,
    trigger,
    setError,
    formState: { errors },
  } = methods
  const { submitAssetInventory, pendingAssetInventory } =
    useSubmitAssetInventory(t, setError)

  const onSubmit = (data: AssetInventoryFormData) => {
    const processedData = processingForm({
      ...data,
      created_by: profileId,
      updated_by: profileId,
    })
    submitAssetInventory(processedData as AssetInventoryFormSubmitData)
  }

  const anotherOption: OptionType[] = [
    {
      label: t('assetInventory:add_another_option'),
      value: 'other',
    },
  ]

  const workingStatus: Record<WorkingStatusEnum, WorkingStatusOption> = {
    [UNSUBSCRIBED]: {
      value: UNSUBSCRIBED,
      label: t('assetInventory:working_status.unsubscribed'),
      color: 'secondary',
    },
    [NOT_USED]: {
      value: NOT_USED,
      label: t('assetInventory:working_status.not_used'),
      color: 'neutral',
    },
    [DEFROSTING]: {
      value: DEFROSTING,
      label: t('assetInventory:working_status.defrosting'),
      color: 'warning',
    },
    [UNREPAIRABLE]: {
      value: UNREPAIRABLE,
      label: t('assetInventory:working_status.unrepairable'),
      color: 'danger',
    },
    [DAMAGED]: {
      value: DAMAGED,
      label: t('assetInventory:working_status.damaged'),
      color: 'danger',
    },
    [REPAIR]: {
      value: REPAIR,
      label: t('assetInventory:working_status.repair'),
      color: 'secondary',
    },
    [NEED_REPAIR]: {
      value: NEED_REPAIR,
      label: t('assetInventory:working_status.need_repair'),
      color: 'secondary',
    },
    [STANDBY]: {
      value: STANDBY,
      label: t('assetInventory:working_status.standby'),
      color: 'success',
    },
    [FUNCTION]: {
      value: FUNCTION,
      label: t('assetInventory:working_status.function'),
      color: 'success',
    },
  }

  useSetLoadingPopupStore(pendingAssetInventory)

  return {
    t,
    errors,
    params,
    control,
    profile,
    methods,
    profileId,
    isEditPage,
    workingStatus,
    anotherOption,
    trigger,
    onSubmit,
    handleSubmit,
    permissions: {
      enable_program_ids: isEnabledProgramIdSelection,
    },
  }
}
