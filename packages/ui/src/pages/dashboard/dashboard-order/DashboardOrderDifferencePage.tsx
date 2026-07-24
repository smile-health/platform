import { useRef } from 'react'
import { TabsContent } from '#components/tabs'
import { usePermission } from '#hooks/usePermission'

import { TDashboardIOTHandler } from '../dashboard.type'
import DashboardOrderContainer from './components/DashboardOrderContainer'
import { ORDER_DIFFERENCE_CONTENT } from './dashboard-order.constant'

export default function DashboardOrderDifferencePage() {
  usePermission('dashboard-order-difference-view')

  const ref = useRef<TDashboardIOTHandler>(null)

  const onResetPage = () => {
    if (ref.current?.onResetPage) ref.current?.onResetPage()
  }
  const onExport = () => ref.current?.onExport()

  return (
    <DashboardOrderContainer
      type="order-difference"
      onSubmit={onResetPage}
      onExport={onExport}
    >
      {(tabs, filter, enabled) => {
        return tabs?.map((item) => {
          const Content = ORDER_DIFFERENCE_CONTENT[item?.id]

          return (
            <TabsContent key={item?.id} value={item?.id}>
              <Content
                ref={ref}
                type="order-difference"
                filter={filter}
                enabled={enabled}
              />
            </TabsContent>
          )
        })
      }}
    </DashboardOrderContainer>
  )
}
