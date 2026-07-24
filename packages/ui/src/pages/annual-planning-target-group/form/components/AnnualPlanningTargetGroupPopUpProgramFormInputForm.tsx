import React, { useContext } from 'react'
import { Button } from '#components/button'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import XMark from '#components/icons/XMark'
import { ReactSelectAsync } from '#components/react-select'
import useSmileRouter from '#hooks/useSmileRouter'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import ProgramPlanDetailContext from '../../../program-plan/list/libs/program-plan-detail.context'
import { loadTargetGroupOptions } from '../../services/annual-planning-target-group.services'

type AnnualPlanningTargetGroupPopUpProgramFormInputFormProps = {
  remove: (index: number) => void
  field: {
    id: string
  }
  index: number
}

const AnnualPlanningTargetGroupPopUpProgramFormInputForm = ({
  index,
  remove,
  field,
}: AnnualPlanningTargetGroupPopUpProgramFormInputFormProps) => {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext()
  const { detailProgramPlanData } = useContext(ProgramPlanDetailContext)
  const router = useSmileRouter()
  const { id: planId } = router.query as { id: string }
  const { t } = useTranslation(['common', 'annualPlanningTargetGroup'])

  const targetGroupChildErrorMessage = (errors as any)?.target_group?.[index]
    ?.target_group_child?.message

  return (
    <div
      className="ui-flex ui-justify-start ui-items-start ui-gap-4"
      key={field.id}
    >
      <FormControl className="ui-w-full">
        <FormLabel htmlFor={`target_group.${index}.target_group_child_id`}>
          {t('annualPlanningTargetGroup:target_group')}
        </FormLabel>
        <Controller
          name={`target_group.${index}.target_group_child`}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <ReactSelectAsync
              {...field}
              key={`target_group__${field.value?.value}`}
              id={`target_group.${index}.target_group_child_id`}
              disabled={false}
              loadOptions={loadTargetGroupOptions}
              placeholder={t('annualPlanningTargetGroup:select_target_group')}
              additional={{
                page: 1,
                plan_id: Number(planId),
                year: detailProgramPlanData?.year || new Date().getFullYear(),
                exclude_ids: watch(`target_group`)
                  .filter(
                    (
                      item: { target_group_child: { value: number } },
                      idx: number
                    ) => item.target_group_child?.value && idx !== index
                  )
                  .map(
                    (item: { target_group_child: { value: number } }) =>
                      item.target_group_child.value
                  ),
              }}
              error={!!error?.message}
              menuPosition="fixed"
            />
          )}
        />
        {targetGroupChildErrorMessage && (
          <FormErrorMessage>{targetGroupChildErrorMessage}</FormErrorMessage>
        )}
      </FormControl>
      <Button
        type="button"
        className="ui-mt-5"
        variant="subtle"
        color="danger"
        rightIcon={<XMark />}
        onClick={() => remove(index)}
      >
        {t('common:remove')}
      </Button>
    </div>
  )
}

export default AnnualPlanningTargetGroupPopUpProgramFormInputForm
