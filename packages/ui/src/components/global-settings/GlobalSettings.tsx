import { ReactNode } from 'react'
import { Button } from '#components/button'
import Plus from '#components/icons/Plus'
import AppLayout, {
  TabPosition,
  TabVariant,
} from '#components/layouts/AppLayout/AppLayout'
import {
  TabsLinkList,
  TabsLinkRoot,
  TabsLinkTrigger,
} from '#components/tabs-link'
import { useOnlineStatus } from '#hooks/useOnlineStatus'
import useSmileRouter from '#hooks/useSmileRouter'
import cx from '#lib/cx'
import { FeatureName } from '#shared/permission/features/index'
import { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

type TTabs = Array<{
  label: string
  url: string
  featureName: FeatureName
  hasChildTab?: boolean
  childTab?: string[]
  hasParentTab?: boolean
  parentTab?: string[]
}>

type TChildTab = {
  id: string
  label: string
  href: string
  isShow: boolean
}

type TProps = {
  header: string
  children: ReactNode
  title: string
  showButtonCreate?: boolean
  buttonCreate?: {
    label: string
    onClick: () => void
  }
  tabs: (t: TFunction, lang: string) => TTabs
  subTitle?: string
  childTabs?: TChildTab[]
  grandChildTabs?: TChildTab[]
  tabPosition?: TabPosition
  tabVariant?: TabVariant
  childTabVariant?: TabVariant
  childTabPosition?: TabPosition
}

const GlobalSettings: React.FC<TProps> = ({
  header,
  children,
  title,
  subTitle,
  showButtonCreate = true,
  buttonCreate,
  tabs,
  childTabs,
  grandChildTabs,
  tabPosition = 'start',
  tabVariant = 'default',
  childTabVariant = 'pills',
  childTabPosition = 'center',
}) => {
  const {
    t,
    i18n: { language },
  } = useTranslation()
  const isOnline = useOnlineStatus()
  const router = useSmileRouter()
  const pathname = router.pathname
  const hasGrandChildTab = Boolean(grandChildTabs?.length)

  return isOnline ? (
    <AppLayout
      title={header}
      tabs={tabs(t, language)}
      tabPosition={tabPosition}
      tabVariant={tabVariant}
      hasGrandChildTab={hasGrandChildTab}
    >
      {childTabs && (
        <div className="ui-my-4">
          <TabsLinkRoot variant={childTabVariant} align={childTabPosition}>
            <TabsLinkList>
              {childTabs?.map((item) => {
                const isActive = hasGrandChildTab
                  ? pathname?.split('/').includes(item?.href?.split('/')?.[5])
                  : pathname?.split('/').pop() === item?.href?.split('/').pop()

                return (
                  <TabsLinkTrigger
                    {...item}
                    data-testid={item?.id}
                    key={item?.label}
                    active={isActive}
                  >
                    {item?.label}
                  </TabsLinkTrigger>
                )
              })}
            </TabsLinkList>
          </TabsLinkRoot>
        </div>
      )}
      <div className="ui-my-6 ui-flex ui-justify-between ui-items-center">
        <div className={cx({ 'ui-flex ui-flex-col': !!subTitle })}>
          <h5 className="ui-font-bold ui-text-xl">{title}</h5>
          {subTitle && (
            <h6 className="ui-text-base ui-text-neutral-500">{subTitle}</h6>
          )}
        </div>
        {showButtonCreate && buttonCreate && (
          <Button
            id={`create-global-setting-${title?.toLowerCase()}`}
            data-testid={`create-global-setting-${title?.toLowerCase()}`}
            type="button"
            onClick={buttonCreate.onClick}
            className="ui-min-w-40"
            leftIcon={<Plus className="ui-size-5" />}
          >
            {buttonCreate.label}
          </Button>
        )}
      </div>
      {hasGrandChildTab && (
        <div className="ui-my-4">
          <TabsLinkRoot variant="default" align="start">
            <TabsLinkList>
              {grandChildTabs?.map((item) => {
                const isActive =
                  pathname?.split('/').pop() === item?.href?.split('/').pop()
                return (
                  <TabsLinkTrigger
                    {...item}
                    data-testid={item?.id}
                    key={item?.label}
                    active={isActive}
                  >
                    {item?.label}
                  </TabsLinkTrigger>
                )
              })}
            </TabsLinkList>
          </TabsLinkRoot>
        </div>
      )}
      {children}
    </AppLayout>
  ) : null
}

export default GlobalSettings
