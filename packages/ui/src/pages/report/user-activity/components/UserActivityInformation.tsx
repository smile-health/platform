import { Button } from '#components/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '#components/dialog'
import { H5 } from '#components/heading'
import { useTranslation } from 'react-i18next'

type Props = Readonly<{
  open?: boolean
  setOpen?: (open: boolean) => void
}>

export default function UserActivityInformation({ open, setOpen }: Props) {
  const { t } = useTranslation('userActivity')
  const tableDescription = t('information.item.table.description', {
    returnObjects: true,
  })

  return (
    <Dialog open={open} onOpenChange={setOpen} size="lg">
      <DialogHeader className="ui-text-center">
        {t('information.title')}
      </DialogHeader>
      <DialogContent className="ui-space-y-3">
        <p>{t('information.description')}</p>
        <div className="ui-space-y-1">
          <H5>{t('information.item.chart.title')}</H5>
          <p>{t('information.item.chart.description')}</p>
        </div>
        <div className="ui-space-y-1">
          <H5>{t('information.item.table.title')}</H5>
          <ul className="ui-list-disc ui-pl-8">
            {tableDescription?.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </div>
      </DialogContent>
      <DialogFooter className="ui-grid ui-grid-cols-1">
        <Button variant="outline" onClick={() => setOpen?.(!open)}>
          Close
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
