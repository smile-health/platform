import { Alert } from '#components/alert'
import { Button } from '#components/button'
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogProps,
} from '#components/dialog'
import cx from '#lib/cx'
import { useTranslation } from 'react-i18next'

type OrderDetailModalProps = {
  title: string
  description?: string
  children?: React.ReactNode
  open: boolean
  error?: string
  isLoading?: boolean
  onSubmit?: () => void
  onClose: () => void
  size?: DialogProps['size']
  submitButton?: {
    label: string
    disabled?: boolean
    className?: string
  }
  cancelButton?: {
    label: string
    disabled?: boolean
    className?: string
  }
  withCancelButton?: boolean
}

export const OrderDetailModal = ({
  title,
  description,
  children,
  open,
  error,
  isLoading,
  submitButton,
  cancelButton,
  size = 'lg',
  withCancelButton = true,
  onSubmit,
  onClose,
}: OrderDetailModalProps) => {
  const { t } = useTranslation('common')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    onSubmit?.()
  }

  return (
    <Dialog
      size={size}
      open={open}
      onOpenChange={onClose}
      className="ui-z-10"
      classNameOverlay="ui-z-10"
      closeOnOverlayClick={false}
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        className={cx('ui-contents', { 'ui-space-y-2': !children })}
      >
        <DialogHeader
          className={cx('ui-space-2 relative', {
            'ui-text-center': children,
          })}
          containerClassName={cx('ui-p-6 ui-pb-0', {
            'ui-border-b ui-pb-[21px]': children,
          })}
        >
          <div className="ui-text-xl ui-font-medium ui-text-dark-blue">
            {title}
          </div>
          {description && (
            <div className="ui-text-base ui-font-normal ui-text-gray-500">
              {description}
            </div>
          )}
          <DialogCloseButton className="ui-top-0 ui-right-0" />
        </DialogHeader>

        {children && (
          <DialogContent className="ui-space-y-6 ui-px-6 ui-pt-4 ui-pb-8 ui-max-h-[650px]">
            {children}
          </DialogContent>
        )}

        <DialogFooter
          className={cx(
            'ui-flex ui-p-6 ui-justify-between ui-items-center ui-gap-4',
            {
              'ui-border-t': children,
            }
          )}
        >
          {error && (
            <div className="ui-w-full">
              <Alert type="danger" withIcon>
                {error}
              </Alert>
            </div>
          )}
          <div className="ui-flex ui-justify-end ui-gap-2 ui-w-full">
            <Button
              type="button"
              id="btnCancelItemModalForm"
              variant="outline"
              onClick={onClose}
              className={cx(
                'ui-text-sm ui-w-full',
                {
                  'ui-w-[250px]': size === 'xl' || size === '2xl',
                },
                cancelButton?.className
              )}
              disabled={isLoading ?? cancelButton?.disabled}
            >
              {cancelButton?.label ?? t('cancel')}
            </Button>
            {onSubmit && (
              <Button
                type="submit"
                id="btnSaveItemModalForm"
                className={cx(
                  'ui-text-sm ui-w-full',
                  {
                    'ui-w-[250px]': size === 'xl' || size === '2xl',
                  },
                  submitButton?.className
                )}
                disabled={submitButton?.disabled || isLoading || Boolean(error)}
                loading={isLoading}
              >
                {submitButton?.label ?? t('submit')}
              </Button>
            )}
          </div>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
