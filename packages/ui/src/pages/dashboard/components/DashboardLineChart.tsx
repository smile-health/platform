import { useState } from 'react'
import { InformationCircleIcon } from '@heroicons/react/24/solid'
import { Button } from '#components/button'
import { LineChart } from '#components/chart'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '#components/dialog'
import DashboardBox from '#pages/dashboard/components/DashboardBox'
import { useTranslation } from 'react-i18next'

import { DataValue } from '../dashboard.type'

type Props = Readonly<{
  id: string
  data?: DataValue
  color?: string
  title: string
  subtitle?: string
  isLoading?: boolean
  exportFileName: string
  information?: {
    show?: boolean
    title: string
    description: string
  }
}>

export default function DashboardLineChart({
  id,
  data,
  color,
  title,
  subtitle,
  isLoading,
  information,
  exportFileName,
}: Props) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <DashboardBox.Root id={id}>
      <DashboardBox.Header>
        {information && (
          <Dialog
            open={open && information?.show}
            onOpenChange={setOpen}
            className="ui-z-20"
          >
            <DialogHeader className="ui-text-center">
              {information?.title}
            </DialogHeader>
            <DialogContent>{information?.description}</DialogContent>
            <DialogFooter className="ui-grid ui-grid-cols-1">
              <Button variant="outline" onClick={() => setOpen(!open)}>
                {t('close')}
              </Button>
            </DialogFooter>
          </Dialog>
        )}
        <div className="ui-flex ui-justify-center ui-items-center ui-gap-2">
          <h4>
            <strong>{title}</strong>
          </h4>
          {information?.show && (
            <button onClick={() => setOpen(true)}>
              <InformationCircleIcon className="ui-size-6" />
            </button>
          )}
        </div>
        {subtitle && <p className="ui-text-base">{subtitle}</p>}
      </DashboardBox.Header>
      <DashboardBox.Body>
        <DashboardBox.Config
          download={{
            targetElementId: id,
            fileName: exportFileName,
          }}
        />
        <DashboardBox.Content isLoading={isLoading} isEmpty={!data?.length}>
          <LineChart data={data || []} color={color} maxVisible={11} />
        </DashboardBox.Content>
      </DashboardBox.Body>
    </DashboardBox.Root>
  )
}
