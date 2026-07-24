import { Button } from '#components/button'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from '#components/drawer'
import Reload from '#components/icons/Reload'
import XMark from '#components/icons/XMark'
import cx from '#lib/cx'
import { useTranslation } from 'react-i18next'

type OrderDetailDrawerProps = {
  id: string
  title: string
  open: boolean
  onClose: () => void
  children: React.ReactNode
  onReset: () => void
  onSubmit: () => void
  disabled?: boolean
  isLoading?: boolean
  submitButton?: {
    label: string
  }
  drawerContentClassName?: string
}

export const OrderDetailDrawer = ({
  id,
  title,
  open,
  onClose,
  children,
  onReset,
  onSubmit,
  disabled = false,
  isLoading = false,
  submitButton,
  drawerContentClassName,
}: OrderDetailDrawerProps) => {
  const { t } = useTranslation(['common', 'orderDetail'])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit?.()
  }

  return (
    <Drawer
      placement="bottom"
      closeOnOverlayClick={false}
      open={open}
      size="full"
      sizeHeight="lg"
    >
      <form id={id} onSubmit={handleSubmit} noValidate className="ui-contents">
        <DrawerHeader
          title={title}
          className="ui-text-center ui-p-6 ui-relative"
        >
          <Button
            variant="subtle"
            type="button"
            color="neutral"
            className="ui-absolute ui-top-2 ui-right-2"
            onClick={() => onClose()}
          >
            <XMark />
          </Button>
        </DrawerHeader>
        <DrawerContent
          className={cx(
            'ui-pt-4 ui-pb-8 ui-px-6 ui-space-y-6 ui-border-y ui-border-zinc-200',
            drawerContentClassName
          )}
        >
          {children}
        </DrawerContent>
        <DrawerFooter className="ui-px-6">
          <Button
            id="btn-reset-confirm-order"
            data-testid="btn-reset-batch"
            type="button"
            variant="subtle"
            onClick={onReset}
            disabled={disabled ?? isLoading}
            leftIcon={<Reload className="ui-size-5" />}
          >
            Reset
          </Button>
          <Button
            id="btn-save-confirm-order"
            data-testid="btn-save-confirm-order"
            type="submit"
            disabled={disabled ?? isLoading}
            loading={isLoading}
            className="ui-w-52"
          >
            {submitButton?.label ?? t('common:submit')}
          </Button>
        </DrawerFooter>
      </form>
    </Drawer>
  )
}
