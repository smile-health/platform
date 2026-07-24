import { useRef } from 'react'
import { TabsContent } from '#components/tabs'
import { usePermission } from '#hooks/usePermission'

import { TDashboardIOTHandler } from '../dashboard.type'
import DashboardInventoryContainer from './components/DashboardInventoryContainer'
import { INVENTORY_COUNT_STOCK_CONTENT } from './dashboard-inventory.constant'

export default function DashboardCountStockPage() {
  usePermission('dashboard-count-stock-view')

  const ref = useRef<TDashboardIOTHandler>(null)

  const onResetPage = () => {
    if (ref.current?.onResetPage) ref.current?.onResetPage()
  }
  const onExport = () => ref.current?.onExport()

  return (
    <DashboardInventoryContainer
      type="add-remove-stock"
      onSubmit={onResetPage}
      onExport={onExport}
    >
      {(tabs, filter, enabled) => {
        return tabs?.map((item) => {
          const Content = INVENTORY_COUNT_STOCK_CONTENT[item?.id]

          return (
            <TabsContent key={item?.id} value={item?.id}>
              <Content
                ref={ref}
                type="add-remove-stock"
                filter={filter}
                enabled={enabled}
              />
            </TabsContent>
          )
        })
      }}
    </DashboardInventoryContainer>
  )
}
