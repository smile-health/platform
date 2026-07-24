import { Button } from '#components/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '#components/dialog'
import { H5 } from '#components/heading'
import { Table, Tbody, Td, Th, Thead, Tr } from '#components/table'
import { Trans, useTranslation } from 'react-i18next'

type Props = Readonly<{
  open?: boolean
  setOpen?: (open: boolean) => void
}>

export default function DashboardStockTakingInformation({
  open,
  setOpen,
}: Props) {
  const { t } = useTranslation('dashboardStockTaking')
  const { t: tDashboard } = useTranslation('dashboard')
  const { t: tCommon } = useTranslation('common')
  const tableDescription = t('information.item.description', {
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
          <H5>{t('information.item.title')}</H5>
          <ul className="ui-list-disc ui-pl-8">
            {tableDescription?.map((item) => (
              <li key={item}>
                <Trans
                  components={{
                    bold: <strong />,
                  }}
                >
                  {item}
                </Trans>
              </li>
            ))}
          </ul>
        </div>
        <Table withBorder withColumnBorders rounded layout="fixed">
          <Thead>
            <Tr>
              <Th className="ui-text-center ui-font-semibold" colSpan={2}>
                {t('column.entity.condition')}
              </Th>
              <Th className="ui-text-center ui-font-semibold" colSpan={3}>
                {t('column.display_in_dashboard')}
              </Th>
            </Tr>
            <Tr>
              <Th className="ui-text-center ui-font-semibold">
                {t('column.entity.have_transaction')}
              </Th>
              <Th className="ui-text-center ui-font-semibold">
                {t('column.entity.done')}
              </Th>
              <Th className="ui-text-center ui-font-semibold">
                {t('column.entity.not_yet')}
              </Th>
              <Th className="ui-text-center ui-font-semibold">
                {t('column.entity.done')}
              </Th>
              <Th className="ui-text-center ui-font-semibold">
                {t('column.entity.total')}
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td className="ui-text-center">{tCommon('no')}</Td>
              <Td className="ui-text-center">{tCommon('no')}</Td>
              <Td className="ui-text-center">{tCommon('yes')}</Td>
              <Td className="ui-text-center">{tCommon('no')}</Td>
              <Td className="ui-text-center">0</Td>
            </Tr>
            <Tr>
              <Td className="ui-text-center">{tCommon('no')}</Td>
              <Td className="ui-text-center">{tCommon('yes')}</Td>
              <Td className="ui-text-center">{tCommon('no')}</Td>
              <Td className="ui-text-center">{tCommon('yes')}</Td>
              <Td className="ui-text-center">0</Td>
            </Tr>
            <Tr>
              <Td className="ui-text-center">{tCommon('yes')}</Td>
              <Td className="ui-text-center">{tCommon('no')}</Td>
              <Td className="ui-text-center">{tCommon('yes')}</Td>
              <Td className="ui-text-center">{tCommon('no')}</Td>
              <Td className="ui-text-center">1</Td>
            </Tr>
            <Tr>
              <Td className="ui-text-center">{tCommon('yes')}</Td>
              <Td className="ui-text-center">{tCommon('yes')}</Td>
              <Td className="ui-text-center">{tCommon('no')}</Td>
              <Td className="ui-text-center">{tCommon('yes')}</Td>
              <Td className="ui-text-center">1</Td>
            </Tr>
          </Tbody>
        </Table>
      </DialogContent>
      <DialogFooter className="ui-grid ui-grid-cols-1">
        <Button variant="outline" onClick={() => setOpen?.(!open)}>
          {tDashboard('close')}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
