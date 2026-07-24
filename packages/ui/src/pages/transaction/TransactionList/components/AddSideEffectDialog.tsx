import React from 'react'
import { parseDate } from '@internationalized/date'
import { Button } from '#components/button'
import { DatePicker } from '#components/date-picker'
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '#components/dialog'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { Input } from '#components/input'
import { OptionType, ReactSelect } from '#components/react-select'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import { useSideEffectReport } from './hooks/useSideEffectReport'

type TAddSideEffectDialogProps = {
  isOpen: boolean
  onClose: () => void
  consumptionId: number
  actualTransactionDate: string
}

const AddSideEffectDialog: React.FC<TAddSideEffectDialogProps> = ({
  isOpen,
  onClose,
  consumptionId,
  actualTransactionDate,
}) => {
  const { t } = useTranslation(['common', 'transactionList'])
  const {
    register,
    handleSubmit,
    errors,
    setError,
    addSideEffect,
    setValue,
    watch,
    reset,
    listReactionData,
    isLoadingListReaction,
  } = useSideEffectReport({ isOpenModal: isOpen, actualTransactionDate })

  const handleClose = () => {
    onClose()
    reset()
  }

  const handleAddSideEffect = () => {
    addSideEffect({ consumptionId, data: watch() }, { onSuccess: handleClose })
  }

  return (
    <Dialog open={isOpen} size="sm">
      <DialogCloseButton onClick={handleClose} />
      <DialogHeader className="ui-my-2">
        <h3 className="ui-text-center ui-text-xl ui-font-medium">
          {t('transactionList:detail.side_effect.add.title')}
        </h3>
      </DialogHeader>
      <div className="ui-h-1 ui-border-t ui-border-neutral-300" />
      <DialogContent className="ui-overflow-visible ui-my-2 ui-py-2 styled-scroll ui-scroll-pr-2">
        <div className="ui-space-y-4">
          <FormControl>
            <FormLabel htmlFor="reaction-type" required>
              {t('transactionList:detail.side_effect.add.reaction_type.label')}
            </FormLabel>
            <ReactSelect
              {...register('reaction_type')}
              id="reaction-type"
              placeholder={t(
                'transactionList:detail.side_effect.add.reaction_type.placeholder'
              )}
              options={listReactionData?.data || []}
              onChange={(option: OptionType) => {
                setValue('reaction_type', option?.value)
                setValue('other_reaction', '')
                setError('reaction_type', { message: '' })
              }}
              value={listReactionData?.data?.find(
                (x) => x.value === watch('reaction_type')
              )}
              isLoading={isLoadingListReaction}
              error={!!errors?.reaction_type?.message}
            />
            <FormErrorMessage>
              {errors?.reaction_type?.message}
            </FormErrorMessage>
          </FormControl>

          {watch('reaction_type') === 4 && (
            <FormControl>
              <FormLabel htmlFor="other-reaction" required>
                {t(
                  'transactionList:detail.side_effect.add.other_reaction.label'
                )}
              </FormLabel>
              <Input
                {...register('other_reaction')}
                id="other-reaction"
                placeholder={t(
                  'transactionList:detail.side_effect.add.other_reaction.placeholder'
                )}
                type="text"
                error={!!errors?.other_reaction?.message}
              />
              <FormErrorMessage>
                {errors?.other_reaction?.message}
              </FormErrorMessage>
            </FormControl>
          )}

          <FormControl>
            <FormLabel htmlFor="actual-reaction-date" required>
              {t(
                'transactionList:detail.side_effect.add.actual_reaction_date.label'
              )}
            </FormLabel>
            <DatePicker
              {...register('reaction_date')}
              id="actual-reaction-date"
              onChange={(date) => {
                if (!date) return

                const newDate = new Date(date.toString())
                setValue('reaction_date', dayjs(newDate).format('YYYY-MM-DD'))
                setError('reaction_date', { message: '' })
              }}
              error={!!errors?.reaction_date?.message}
              minValue={parseDate(
                dayjs(actualTransactionDate).format('YYYY-MM-DD')
              )}
              maxValue={parseDate(
                dayjs(actualTransactionDate)
                  .add(30, 'days')
                  .format('YYYY-MM-DD')
              )}
            />
            <FormErrorMessage>
              {errors?.reaction_date?.message}
            </FormErrorMessage>
          </FormControl>
        </div>
      </DialogContent>
      <div className="ui-h-1 ui-border-t ui-border-neutral-300" />
      <DialogFooter>
        <div className="ui-grid ui-grid-cols-2 ui-gap-3 ui-w-full">
          <Button
            type="button"
            color="primary"
            variant="outline"
            onClick={handleClose}
          >
            {t('common:close')}
          </Button>
          <Button onClick={handleSubmit(handleAddSideEffect)}>
            {t('common:save')}
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  )
}

export default AddSideEffectDialog
