import { useRef, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '#components/button'
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '#components/dialog'
import { FormErrorMessage, FormLabel } from '#components/form-control'
import { Input } from '#components/input'
import cx from '#lib/cx'
import { TicketingSystemStatusEnum } from '#pages/ticketing-system/ticketing-system.constant'
import { hasPermission } from '#shared/permission/index'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { updateTicketingSystemLink } from '../../ticketing-system.service'

type TicketingSystemDetailPackingLinkProps = {
  link: string
  status: TicketingSystemStatusEnum
}

export default function TicketingSystemDetailPackingLink({
  link,
  status,
}: Readonly<TicketingSystemDetailPackingLinkProps>) {
  const { t } = useTranslation(['common', 'ticketingSystem'])
  const queryClient = useQueryClient()
  const ref = useRef<HTMLFormElement | null>(null)
  const params = useParams()
  const [showModalLink, setShowModalLink] = useState(false)

  const hasAccessLink = hasPermission('ticketing-system-access-packing-link')
  const isManageLink =
    status === TicketingSystemStatusEnum.ReviewedByHelpDesk && hasAccessLink
  const isViewLink =
    link && status !== TicketingSystemStatusEnum.ReviewedByHelpDesk

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      link,
    },
  })

  const { mutate, isPending } = useMutation({
    mutationFn: async (link: string) => {
      await updateTicketingSystemLink(Number(params?.id), link)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['ticketing-system'],
      })
      setShowModalLink(false)
    },
  })

  const onSubmit: SubmitHandler<{ link: string }> = ({ link }) => {
    mutate(link)
  }

  const handleExternalSubmit = () => {
    ref?.current?.dispatchEvent(
      new Event('submit', { cancelable: true, bubbles: true })
    )
  }

  const viewTitle = t('ticketingSystem:detail.link.view')
  const mutateTitle = link
    ? t('ticketingSystem:detail.link.edit')
    : t('ticketingSystem:detail.link.add')

  const title = isManageLink ? mutateTitle : viewTitle

  return (
    <>
      {(isManageLink || isViewLink) && (
        <Button
          variant="outline"
          size="sm"
          className="ui-h-9"
          loading={isPending}
          onClick={() => setShowModalLink(true)}
        >
          {title}
        </Button>
      )}

      <Dialog open={showModalLink} onOpenChange={setShowModalLink}>
        <DialogCloseButton />
        <DialogHeader className="ui-text-center ui-text-xl">
          {title}
        </DialogHeader>
        <DialogContent>
          <div className="ui-space-y-2">
            <FormLabel>Link Packing Slip</FormLabel>
            {isViewLink && (
              <Link
                id="packing-slip-link"
                data-testid="packing-slip-link"
                target="_blank"
                href={link || ''}
                className="ui-inline-block ui-text-sky-700 ui-underline"
              >
                {link}
              </Link>
            )}

            {isManageLink && (
              <form onSubmit={handleSubmit(onSubmit)} ref={ref}>
                <Input
                  {...register('link', {
                    required: t(
                      'ticketingSystem:detail.form.link.validation.required'
                    ),
                    validate: (value) =>
                      value?.startsWith('http') ||
                      t(
                        'ticketingSystem:detail.form.link.validation.start_with'
                      ),
                  })}
                  id="input-packing-slip-link"
                  data-testid="input-packing-slip-link"
                  placeholder={t(
                    'ticketingSystem:detail.form.link.placeholder'
                  )}
                />
                {errors?.link?.message && (
                  <FormErrorMessage>{errors?.link?.message}</FormErrorMessage>
                )}
              </form>
            )}
          </div>
        </DialogContent>
        <DialogFooter
          className={cx('ui-grid ui-grid-cols-1', {
            'ui-grid-cols-2 ui-gap-2': isManageLink,
          })}
        >
          <Button
            id="btn-close-modal-link"
            data-testid="btn-close-modal-link"
            variant="outline"
            onClick={() => setShowModalLink(!open)}
          >
            {isManageLink ? t('cancel') : t('back')}
          </Button>
          {isManageLink && (
            <Button
              id="btn-submit-modal-link"
              data-testid="btn-submit-modal-link"
              onClick={handleExternalSubmit}
            >
              {t('send')}
            </Button>
          )}
        </DialogFooter>
      </Dialog>
    </>
  )
}
