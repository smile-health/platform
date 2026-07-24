import React, { useEffect } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '#components/button'
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '#components/dialog'
import { EmptyState } from '#components/empty-state'
import { toast } from '#components/toast'
import { ErrorResponse } from '#types/common'
import { isAxiosError } from 'axios'
import { FormProvider, useFieldArray, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as Yup from 'yup'

import { bulkCreatePlanTargetGroups, verifyPlanTargetGroup } from '../list/master.service'
import BmhpTargetGroupPlanInfo from './components/BmhpTargetGroupPlanInfo'
import BmhpTargetGroupPlanInputForm from './components/BmhpTargetGroupPlanInputForm'

type TargetGroupPlanModalProps = {
  isOpen: boolean
  onClose: () => void
  programPlanId: number
}

// type OptionType = {
//   value: number | string
//   label: string
// }

export const TargetGroupPlanModal: React.FC<TargetGroupPlanModalProps> = ({
  isOpen,
  onClose,
  programPlanId,
}) => {
  const { t } = useTranslation(['common', 'masterBmhp'])
  const queryClient = useQueryClient()

  const { data: existingTargetGroups = [] } = useQuery({
    queryKey: ['verify-plan-target-groups', programPlanId],
    queryFn: async () => {
      const res = await verifyPlanTargetGroup(programPlanId)
      return res.data
    },
    enabled: isOpen && !!programPlanId,
  })

  const mutation = useMutation({
    mutationFn: async (target_group_ids: number[]) => {
      return bulkCreatePlanTargetGroups({
        program_plan_id: programPlanId,
        target_group_ids,
      })
    },
    onSuccess: () => {
      toast.success({
        title: t('common:message.success.add', {
          type: t('masterBmhp:title.bmhp_material_target_group'),
        }),
      })
      queryClient.invalidateQueries({ queryKey: ['bmhp-material-list'] })
      onClose()
      reset({ target_group: [] })
    },
    onError: (error) => {
      if (isAxiosError(error)) {
        toast.danger({
          description:
            (error?.response?.data as ErrorResponse)?.message ??
            t('common:message.failed.create', {
              type: t('masterBmhp:title.bmhp_material_target_group'),
            }),
        })
      }
    },
  })

  useEffect(() => {
    reset({ target_group: [] })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const methods = useForm({
    resolver: yupResolver(
      Yup.object().shape({
        target_group: Yup.array()
          .of(
            Yup.object().shape({
              target_group_child: Yup.object()
                .shape({
                  value: Yup.number().required('Harus diisi'),
                  label: Yup.string().required('Harus diisi'),
                })
                .nullable()
                .required('Harus diisi'),
            })
          )
          .min(1, 'Minimal satu target group')
          .required(),
      })
    ),
    defaultValues: {
      target_group: [],
    },
  })

  const { control, handleSubmit: hookFormSubmit, reset, watch } = methods

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'target_group',
  })

  const onSubmit = (data: any) => {
    const ids = data.target_group.map((opt: any) =>
      Number(opt.target_group_child.value)
    )
    mutation.mutate(ids)
  }

  const handleClose = () => {
    methods.clearErrors()
    methods.resetField('target_group')
    onClose()
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(val) => !val && handleClose()}
      size="2xl"
    >
      <FormProvider {...methods}>
        <form onSubmit={hookFormSubmit(onSubmit)}>
          <DialogCloseButton onClick={handleClose} />
          <DialogHeader className="ui-text-center ui-text-xl" border>
            {t('masterBmhp:title.bmhp_material_target_group')}
          </DialogHeader>
          <DialogContent className="ui-px-6 ui-min-h-80 ui-overflow-auto ui-max-h-md">
            <div className="ui-mt-4 ui-space-y-6">
              <BmhpTargetGroupPlanInfo append={append as any} />
              {fields.length > 0 ? (
                fields?.map((field: { id: string }, index: number) => (
                  <BmhpTargetGroupPlanInputForm
                    key={index?.toString()}
                    index={index}
                    remove={remove}
                    field={field}
                    programPlanId={programPlanId}
                    existingIds={existingTargetGroups as number[]}
                  />
                ))
              ) : (
                <EmptyState
                  withIcon
                  title={t('common:message.empty.title')}
                  description={t(
                    'common:message.empty.description_empty_list_only'
                  )}
                />
              )}
            </div>
          </DialogContent>
          <DialogFooter className="ui-justify-center" border>
            <div className="ui-grid ui-grid-cols-2 ui-gap-4 ui-w-full mx-auto">
              <Button type="button" variant="default" onClick={handleClose}>
                {t('common:cancel')}
              </Button>
              <Button
                type="submit"
                loading={mutation.isPending}
                disabled={!methods.formState.isValid}
              >
                {t('common:save')}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </FormProvider>
    </Dialog>
  )
}

export default TargetGroupPlanModal
