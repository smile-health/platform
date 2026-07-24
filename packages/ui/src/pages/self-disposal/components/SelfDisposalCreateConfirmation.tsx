import { Button } from '#components/button'
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
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  FormData,
} from '../schema/SelfDisposalFormSchema'

import { Input } from '#components/input'
import { TextArea } from '#components/text-area'
export default function SelfDisposalCreateConfirmation({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { t } = useTranslation(['common', 'selfDisposal'])
  const { control } = useFormContext<FormData>()
  return (
    <Dialog open={open} closeOnOverlayClick={false} onOpenChange={onClose} size="md">
      <DialogCloseButton></DialogCloseButton>
      <DialogHeader className="ui-text-center ui-text-xl">
        {t('common:confirmation')}
      </DialogHeader>
      <DialogContent className="ui-space-y-5">
        <Controller
          control={control}
          name="no_document"
          render={({
            field: { value, onChange, ...field },
            fieldState: { error },
          }) => (
            <FormControl>
              <FormLabel required>
                {t('selfDisposal:create.disposal_report_number')}
              </FormLabel>
              <Input
                {...field}
                placeholder={t('selfDisposal:create.placeholder_disposal_report_number')}
                value={value ?? ''}
                onChange={onChange}
                error={Boolean(error?.message)}
              />
              {error?.message && (
                <FormErrorMessage>{error?.message}</FormErrorMessage>
              )}
            </FormControl>
          )}
        />
        <Controller
          control={control}
          name="comment"
          render={({
            field: { value, onChange, ...field },
            fieldState: { error },
          }) => (
            <FormControl>
              <FormLabel>{t('selfDisposal:create.comment')}</FormLabel>
              <TextArea
                {...field}
                placeholder={t('selfDisposal:create.placeholder_comment')}
                value={value ?? ''}
                error={Boolean(error?.message)}
                onChange={onChange}
              />
              {error?.message && (
                <FormErrorMessage>{error?.message}</FormErrorMessage>
              )}
            </FormControl>
          )}
        />
      </DialogContent>
      <DialogFooter>
        <Button
          color="danger"
          className="ui-w-full"
          variant="default"
          onClick={onClose}
        >
          {t('common:cancel')}
        </Button>

        <Button
          type="submit"
          form="parent"
          className="ui-w-full"
          variant="solid"
        >
          {t('common:submit')}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
