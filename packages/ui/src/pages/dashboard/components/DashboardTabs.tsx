import { ReactNode } from 'react'
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from '#components/tabs'
import cx from '#lib/cx'

import { TDashboardTabs } from '../dashboard.type'
import DashboardBox from './DashboardBox'

type Props<T extends string> = Readonly<{
  id: string
  setTab: (tab: T) => void
  tabList: TDashboardTabs<T>[]
  renderChild: (item: TDashboardTabs<T>) => ReactNode
  defaultActiveTab: string
  title: string | ReactNode
  subtitle?: string
  isNewLayout?: boolean
  additionalContent?: ReactNode
  gridSize?: number
}>

export default function DashboardTabs<T extends string>({
  id,
  setTab,
  tabList,
  renderChild,
  defaultActiveTab,
  title,
  subtitle,
  isNewLayout,
  additionalContent,
  gridSize = 5,
}: Props<T>) {
  if (isNewLayout) {
    return (
      <DashboardBox.Root id={id}>
        <DashboardBox.Header bordered>
          <h4>{title}</h4>
          {subtitle && (
            <p className={cx('ui-text-base', 'ui-text-dark-teal')}>
              {subtitle}
            </p>
          )}
        </DashboardBox.Header>
        <div className="ui-relative ui-p-4 ui-bg-gray-50 ui-rounded-b-[inherit]">
          <TabsRoot
            variant="pills"
            defaultValue={defaultActiveTab}
            align="stretch"
          >
            <div className="ui-flex ui-items-center ui-gap-4">
              {additionalContent}
              <TabsList
                className={cx('ui-grow', {
                  'ui-grid-cols-5': gridSize === 5,
                  'ui-grid-cols-6': gridSize === 6,
                  'ui-grid-cols-7': gridSize === 7,
                })}
              >
                {tabList?.map((item) => (
                  <TabsTrigger
                    key={item?.id}
                    value={item?.id}
                    className="ui-justify-center ui-text-sm ui-px-2 ui-h-10"
                    onClick={() => setTab(item?.id)}
                  >
                    {item?.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            {tabList?.map((item) => {
              return (
                <TabsContent key={item?.id} value={item?.id}>
                  {renderChild(item)}
                </TabsContent>
              )
            })}
          </TabsRoot>
        </div>
      </DashboardBox.Root>
    )
  }

  return (
    <TabsRoot variant="pills" defaultValue={defaultActiveTab} align="stretch">
      <DashboardBox.Root id={id}>
        <DashboardBox.Header>
          <TabsList
            className={cx({
              'ui-grid-cols-5': gridSize === 5,
              'ui-grid-cols-6': gridSize === 6,
              'ui-grid-cols-7': gridSize === 7,
            })}
          >
            {tabList?.map((item) => (
              <TabsTrigger
                key={item?.id}
                value={item?.id}
                className="ui-justify-center ui-text-base ui-px-2"
                onClick={() => setTab(item?.id)}
              >
                {item?.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <h4>
            <strong>{title}</strong>
          </h4>
          {subtitle && <p className="ui-text-base">{subtitle}</p>}
        </DashboardBox.Header>
        {tabList?.map((item) => {
          return (
            <TabsContent key={item?.id} value={item?.id}>
              {renderChild(item)}
            </TabsContent>
          )
        })}
      </DashboardBox.Root>
    </TabsRoot>
  )
}
