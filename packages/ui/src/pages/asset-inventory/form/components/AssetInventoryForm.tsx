import React from 'react'
import { Button } from '#components/button'
import { FormProvider } from 'react-hook-form'

import { TAssetInventory } from '../../list/libs/asset-inventory-list.types'
import {
  loadCalibrationSchedule,
  loadMaintainerSchedule,
  loadVendor,
} from '../../services/asset-inventory.services'
import { useAssetInventoryForm } from '../hooks/useAssetInventoryForm'
import { AssetInventoryBudgetSection } from './AssetInventoryBudgetSection'
import { AssetInventoryElectricitySection } from './AssetInventoryElectricitySection'
import { AssetInventoryEntitySection } from './AssetInventoryEntitySection'
import AssetInventoryGroupSection from './AssetInventoryGroupSection'
import { AssetInventoryOwnershipSection } from './AssetInventoryOwnershipSection'
import { AssetInventoryProgramSection } from './AssetInventoryProgramSection'
import { AssetInventorySpecificationSection } from './AssetInventorySpecificationSection'
import { AssetInventoryWorkingStatusSection } from './AssetInventoryWorkingStatusSection'

type AssetInventoryFormProps = {
  data?: TAssetInventory | null
}

const AssetInventoryForm: React.FC<AssetInventoryFormProps> = ({ data }) => {
  const {
    t,
    errors,
    control,
    profile,
    methods,
    anotherOption,
    trigger,
    onSubmit,
    handleSubmit,
    isEditPage,
    permissions,
  } = useAssetInventoryForm({ data })

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="ui-mt-6 ui-w-[50%] ui-mx-auto"
      >
        <AssetInventorySpecificationSection
          errors={errors}
          anotherOption={anotherOption}
          isEditPage={Boolean(isEditPage)}
        />
        <AssetInventoryWorkingStatusSection errors={errors} />
        <AssetInventoryEntitySection errors={errors} profile={profile} />
        {permissions.enable_program_ids && (
          <AssetInventoryProgramSection errors={errors} />
        )}
        <AssetInventoryOwnershipSection
          errors={errors}
          profile={profile}
          anotherOption={anotherOption}
        />
        <AssetInventoryBudgetSection
          errors={errors}
          anotherOption={anotherOption}
        />
        <AssetInventoryElectricitySection errors={errors} />
        <AssetInventoryGroupSection
          errors={errors}
          control={control}
          trigger={trigger}
          title={t('assetInventory:form.title.warranty')}
          fields={[
            {
              id: 'warranty_start_date',
              name: 'warranty_start_date',
              label: t('assetInventory:columns.warranty.start_date'),
              type: 'date-picker',
              trigger_fields: ['warranty_end_date', 'warranty_vendor'],
            },
            {
              id: 'warranty_end_date',
              name: 'warranty_end_date',
              label: t('assetInventory:columns.warranty.end_date'),
              type: 'date-picker',
              trigger_fields: ['warranty_start_date', 'warranty_vendor'],
            },
            {
              id: 'warranty_vendor',
              name: 'warranty_vendor',
              label: t('assetInventory:columns.smile_vendor'),
              type: 'select-async-paginate',
              trigger_fields: ['warranty_start_date', 'warranty_end_date'],
              isVendor: true,
              loadOptions: loadVendor,
              additional: {
                page: 1,
                isGlobal: true,
              },
            },
          ]}
        />
        <AssetInventoryGroupSection
          errors={errors}
          control={control}
          trigger={trigger}
          title={t('assetInventory:form.title.calibration')}
          fields={[
            {
              id: 'calibration_last_date',
              name: 'calibration_last_date',
              label: t(
                'assetInventory:columns.calibration.last_calibration_date'
              ),
              type: 'date-picker',
              trigger_fields: ['calibration_schedule', 'calibration_vendor'],
            },
            {
              id: 'calibration_schedule',
              name: 'calibration_schedule',
              label: t('assetInventory:columns.calibration.schedule.label'),
              type: 'select-async-paginate',
              trigger_fields: ['calibration_last_date', 'calibration_vendor'],
              loadOptions: loadCalibrationSchedule,
              additional: {
                page: 1,
              },
            },
            {
              id: 'calibration_vendor',
              name: 'calibration_vendor',
              label: t('assetInventory:columns.smile_vendor'),
              type: 'select-async-paginate',
              trigger_fields: ['calibration_last_date', 'calibration_schedule'],
              isVendor: true,
              loadOptions: loadVendor,
              additional: {
                page: 1,
                isGlobal: true,
              },
            },
          ]}
        />
        <AssetInventoryGroupSection
          errors={errors}
          control={control}
          trigger={trigger}
          title={t('assetInventory:form.title.maintenance')}
          fields={[
            {
              id: 'maintenance_last_date',
              name: 'maintenance_last_date',
              label: t(
                'assetInventory:columns.maintenance.last_maintenance_date'
              ),
              type: 'date-picker',
              trigger_fields: ['maintenance_schedule', 'maintenance_vendor'],
            },
            {
              id: 'maintenance_schedule',
              name: 'maintenance_schedule',
              label: t('assetInventory:columns.maintenance.schedule.label'),
              type: 'select-async-paginate',
              trigger_fields: ['maintenance_last_date', 'maintenance_vendor'],
              loadOptions: loadMaintainerSchedule,
              additional: {
                page: 1,
              },
            },
            {
              id: 'maintenance_vendor',
              name: 'maintenance_vendor',
              label: t('assetInventory:columns.smile_vendor'),
              type: 'select-async-paginate',
              trigger_fields: ['maintenance_last_date', 'maintenance_schedule'],
              isVendor: true,
              loadOptions: loadVendor,
              additional: {
                page: 1,
                isGlobal: true,
              },
            },
          ]}
        />
        <div className="ui-flex ui-justify-end">
          <Button
            type="submit"
            variant="solid"
            className="ui-mt-4 ui-w-auto ui-px-10 ui-bg-primary-500 ui-text-white hover:ui-bg-primary-600"
          >
            {t('common:save')}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}

export default AssetInventoryForm
