import { PropsWithChildren } from 'react'
import { Button } from '#components/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '#components/dialog'
import cx from '#lib/cx'
import { Trans, useTranslation } from 'react-i18next'

type Props = PropsWithChildren<{
  title?: string
  open?: boolean
  setOpen?: (open: boolean) => void
  description?: string | React.ReactNode
  details?: string[]
  contentClassName?: string
  listType?: 'paragraph' | 'list'
}>

export default function DashboardInformation({
  title,
  open,
  setOpen,
  description,
  details,
  contentClassName,
  listType = 'paragraph',
  children,
}: Props) {
  const { t } = useTranslation()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogHeader className="ui-text-center">{title}</DialogHeader>
      {children ?? (
        <DialogContent className={cx('ui-space-y-3', contentClassName)}>
          {description && (
            <p className="ui-whitespace-pre-line">
              <Trans
                components={{
                  b: <strong />,
                  br: <br />,
                  lt: <>&lt;</>,
                  gt: <>&gt;</>,
                }}
              >
                {description}
              </Trans>
            </p>
          )}

          {!!details?.length && listType === 'paragraph' && (
            <div className="ui-space-y-1">
              {details?.map((item) => (
                <p key={item}>
                  <Trans
                    components={{
                      b: <strong />,
                    }}
                  >
                    {item}
                  </Trans>
                </p>
              ))}
            </div>
          )}

          {!!details?.length && listType === 'list' && (
            <ul className="ui-list-disc ui-pl-6">
              {details?.map((item) => (
                <li key={item}>
                  <Trans
                    components={{
                      b: <strong />,
                      br: <br />,
                    }}
                  >
                    {item}
                  </Trans>
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      )}
      <DialogFooter className="ui-grid ui-grid-cols-1">
        <Button variant="outline" onClick={() => setOpen?.(!open)}>
          {t('close')}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
