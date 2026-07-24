import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/24/solid'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '#components/button'
import { Checkbox } from '#components/checkbox'
import { DataTable } from '#components/data-table'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { OptionType, ReactSelectAsync } from '#components/react-select'
import { KfaLevelEnum } from '#constants/material'
import useSmileRouter from '#hooks/useSmileRouter'
import cx from '#lib/cx'
import { loadActivityOptions } from '#services/activity'
import { loadMaterial } from '#services/material'
import { AmountOfGiving, AmountOfGivingForm, TaskFormValues } from '#types/task'
import { getProgramStorage } from '#utils/storage/program'
import { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

import useTaskForm from '../hooks/useTaskForm'
import AmountOfGivingModal from './AmountOfGivingModal'
import FormCoverageModal from './FormCoverageModal'
import { MonthWrapper } from './MonthWrapper'

type TColumns = {
  isEdit: boolean
  t: TFunction<['common', 'task']>
  totalProvince: number
  onClickNumberOfDoses: () => void
  onClickCoverage: (data: AmountOfGivingForm) => void
}

const columns = ({
  isEdit,
  t,
  totalProvince,
  onClickNumberOfDoses,
  onClickCoverage,
}: Readonly<TColumns>): ColumnDef<AmountOfGivingForm>[] => [
    {
      header: t('task:list.columns.group_target'),
      accessorKey: 'group_target.label',
      cell: ({ row: { original } }) => {
        return (
          <div className="ui-flex ui-flex-col ui-gap-8">
            <p>{original.group_target.label}</p>
            {isEdit && (
              <Button
                type="button"
                variant="subtle"
                onClick={() => onClickNumberOfDoses()}
                className="ui-w-max"
              >
                {t('task:form.group_target.edit')}
              </Button>
            )}
          </div>
        )
      },
    },
    {
      header: t('task:list.columns.number_of_doses'),
      accessorKey: 'number_of_doses',
    },
    {
      header: t('task:list.columns.national_ip'),
      accessorKey: 'national_ip',
      cell: ({ row: { original } }) => {
        return (
          <div className="ui-flex ui-flex-col ui-gap-2">
            <p>{original.national_ip}</p>
          </div>
        )
      },
    },
    {
      header: t('task:list.columns.target_coverage'),
      accessorKey: 'target_coverage',
      cell: ({ row: { original } }) => {
        if (original.target_coverage.length === 0) {
          return (
            <Button
              type="button"
              variant="outline"
              leftIcon={<PlusIcon className="h-5 w-5" />}
              onClick={() => onClickCoverage(original)}
            >
              {t('task:form.coverage.label')}
            </Button>
          )
        }

        return (
          <div className="ui-flex ui-flex-col ui-gap-8">
            <p>
              {t('task:form.coverage.saved', {
                coverage: original.target_coverage.length,
                total: totalProvince,
              })}
            </p>

            <Button
              type="button"
              variant={isEdit ? 'subtle' : 'outline'}
              className="ui-w-max"
              onClick={() => onClickCoverage(original)}
            >
              {isEdit
                ? t('task:form.coverage.edit')
                : t('task:form.coverage.update')}
            </Button>
          </div>
        )
      },
    },
  ]

export default function TaskForm({
  isEdit = false,
}: Readonly<{ isEdit?: boolean }>) {
  const { t } = useTranslation(['common', 'task'])
  const {
    programPlanId,
    openCoverageModal,
    isDisabledAmountOfGivingButton,
    openAmountOfGivingModal,
    errors,
    provinces,
    monthlyDistribution,
    consumptionUnitPerDistributionUnit,
    watch,
    setOpenCoverageModal,
    setValue,
    clearErrors,
    onToggleMonthlyDistribution,
    onToggleAllMonthlyDistribution,
    onSaveAmountOfGiving,
    onCreateTask,
    onEditTask,
    onClickNumberOfDoses,
    onClickCoverageButton,
    onSaveCoverage,
    register,
    handleSubmit,
    setOpenAmountOfGivingModal,
    getDetailMaterial,
  } = useTaskForm(isEdit)
  const router = useSmileRouter()
  const program = getProgramStorage()

  const onSubmit = (data: TaskFormValues) => {
    if (isEdit) onEditTask(data)
    else onCreateTask(data)
  }

  return (
    <>
      <AmountOfGivingModal
        isEdit={isEdit}
        activity={watch('activity')?.label}
        material={watch('material')?.label}
        defaultAmountOfGiving={watch('amount_of_giving') as AmountOfGiving[]}
        open={openAmountOfGivingModal}
        setModal={setOpenAmountOfGivingModal}
        onSave={onSaveAmountOfGiving}
        consumptionUnitPerDistributionUnit={consumptionUnitPerDistributionUnit}
      />

      {openCoverageModal.data && (
        <FormCoverageModal
          open={openCoverageModal.data !== null}
          listProvince={provinces || []}
          amountOfGiving={openCoverageModal.data}
          handleClose={() => setOpenCoverageModal({ type: 'add', data: null })}
          handleSave={onSaveCoverage}
        />
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="ui-mt-6 ui-space-y-6 ui-max-w-2xl ui-mx-auto"
      >
        <div className="ui-flex ui-flex-col ui-space-y-5 ui-border ui-border-gray-300 ui-p-6 ui-rounded">
          <FormControl>
            <FormLabel htmlFor="name" required>
              {t('form.activity.label')}
            </FormLabel>
            <ReactSelectAsync
              {...register('activity')}
              id="activity"
              placeholder={t('form.activity.placeholder')}
              loadOptions={loadActivityOptions}
              additional={{
                page: 1,
              }}
              onChange={(option: OptionType) => {
                setValue('activity', option)
                clearErrors('activity')
              }}
              value={watch('activity')}
              error={!!errors?.activity?.message}
              disabled={isEdit}
            />
            <FormErrorMessage>
              {errors?.activity?.value?.message}
            </FormErrorMessage>
          </FormControl>
          <FormControl>
            <FormLabel required>{t('form.material.label')}</FormLabel>
            <ReactSelectAsync
              {...register('material')}
              id="material"
              placeholder={t('form.material.placeholder')}
              loadOptions={loadMaterial}
              additional={{
                page: 1,
                program_id: program?.id,
                material_level_id: KfaLevelEnum.KFA_92,
              }}
              onChange={(option: OptionType) => {
                setValue('material', option)
                getDetailMaterial(option.value)
                clearErrors('material')
              }}
              value={watch('material')}
              error={!!errors?.material?.message}
              disabled={isEdit}
            />
            <FormErrorMessage>
              {errors?.material?.value?.message}
            </FormErrorMessage>
          </FormControl>

          <div className="ui-space-y-2">
            <div className="ui-flex ui-justify-between ui-items-center ui-w-full">
              <FormLabel className="!ui-mt-0" required>
                {t('task:list.columns.monthly_distribution')}
              </FormLabel>

              <FormControl className="ui-flex ui-items-center ui-gap-2">
                <Checkbox
                  checked={monthlyDistribution.length > 0}
                  indeterminate={
                    monthlyDistribution.length > 0 &&
                    monthlyDistribution.length < 12
                  }
                  onChange={onToggleAllMonthlyDistribution}
                />
                <FormLabel htmlFor="monthly_distribution" className="!ui-mt-0">
                  {t('task:form.select_all_month')}
                </FormLabel>
              </FormControl>
            </div>

            <div>
              <MonthWrapper
                values={monthlyDistribution as number[]}
                onClick={onToggleMonthlyDistribution}
              />
              <FormErrorMessage className="ui-mt-2">
                {errors?.monthly_distribution?.message}
              </FormErrorMessage>
            </div>
          </div>
        </div>

        <div className="ui-flex ui-flex-col ui-space-y-5 ui-border ui-border-gray-300 ui-p-6 ui-rounded">
          <div className="ui-flex ui-justify-between ui-items-center">
            <h5 className="ui-text-base ui-font-bold ui-text-[#0C3045]">
              {t('task:form.amount_of_giving.title')}
            </h5>
            {!isEdit && (
              <Button
                type="button"
                leftIcon={<PlusIcon className="h-5 w-5" />}
                onClick={() => setOpenAmountOfGivingModal(true)}
                disabled={isDisabledAmountOfGivingButton}
              >
                {t('task:form.amount_of_giving.add')}
              </Button>
            )}
          </div>
          <DataTable
            data={watch('amount_of_giving') || []}
            columns={columns({
              t,
              isEdit,
              totalProvince: provinces.length || 0,
              onClickNumberOfDoses,
              onClickCoverage: (amountOfGiving) =>
                onClickCoverageButton(isEdit ? 'edit' : 'add', amountOfGiving),
            })}
            bodyClassName={cx({
              'ui-h-[260px]': watch('amount_of_giving')?.length === 0,
            })}
          />
          <FormErrorMessage className="!ui-mt-2">
            {errors?.amount_of_giving?.message}
          </FormErrorMessage>
        </div>

        <div className="ui-flex ui-justify-end">
          <div className="ui-grid ui-grid-cols-2 ui-w-[300px] ui-gap-2">
            <Button asChild variant="outline">
              <Link
                href={router.getAsLink(
                  `/v5/program-plan/${programPlanId}/task`
                )}
              >
                {t('common:back')}
              </Link>
            </Button>
            <Button type="submit">{t('common:save')}</Button>
          </div>
        </div>
      </form>
    </>
  )
}
