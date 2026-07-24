import { ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '#components/button'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from '#components/dropdown-menu'
import { H3 } from '#components/heading'
import Plus from '#components/icons/Plus'
import {
  TabsLinkList,
  TabsLinkRoot,
  TabsLinkTrigger,
} from '#components/tabs-link'
import useSmileRouter from '#hooks/useSmileRouter'
import OrderContainer from '#pages/order/OrderContainer'
import { useTranslation } from 'react-i18next'

import { orderCreationList, orderListTabs } from '../order-list-constant'

export default function OrderListContainer({
  children,
  isCursor,
}: {
  readonly children: ReactNode
  readonly isCursor?: boolean
}) {
  const pathname = usePathname()
  const router = useSmileRouter()
  const { t } = useTranslation('orderList')

  const tabsItems = orderListTabs(t, router.getAsLink, isCursor)?.filter(
    (v) => v?.isShow
  )
  const orderCreations = orderCreationList(t, router.getAsLink)?.filter(
    (v) => v?.isShow
  )

  return (
    <OrderContainer title={t('title')} metaTitle={t('title')}>
      <div className="ui-space-y-6">
        <TabsLinkRoot variant="pills" align="center">
          <TabsLinkList>
            {tabsItems?.map((item) => {
              return (
                <TabsLinkTrigger
                  {...item}
                  data-testid={item?.id}
                  key={item?.label}
                  active={item?.href === pathname}
                >
                  {item?.label}
                </TabsLinkTrigger>
              )
            })}
          </TabsLinkList>
        </TabsLinkRoot>
        <div className="ui-flex ui-justify-between ui-gap-4">
          <H3>{t('title')}</H3>
          <DropdownMenuRoot>
            <DropdownMenuTrigger>
              {Boolean(orderCreations?.length) && (
                <Button leftIcon={<Plus className="ui-size-5" />}>
                  {t('create.title')}
                </Button>
              )}
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {orderCreations?.map((item) => (
                <DropdownMenuItem key={item?.id}>
                  <Link
                    className="ui-inline-block ui-w-full ui-h-full"
                    id={item?.id}
                    data-testid={item?.id}
                    href={item?.href}
                  >
                    {item?.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenuRoot>
        </div>
        {children}
      </div>
    </OrderContainer>
  )
}
