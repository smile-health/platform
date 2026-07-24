import React, { ReactNode } from 'react'
import { useFeatureIsOn } from '@growthbook/growthbook-react'
import { Button } from '#components/button'
import Plus from '#components/icons/Plus'
import AppLayout from '#components/layouts/AppLayout/AppLayout'
import {
  TabsLinkList,
  TabsLinkRoot,
  TabsLinkTrigger,
} from '#components/tabs-link'
import { useOnlineStatus } from '#hooks/useOnlineStatus'
import useSmileRouter from '#hooks/useSmileRouter'
import { FeatureName } from '#shared/permission/features/index'
import { hasPermission } from '#shared/permission/index'
import { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'

type Tabs = Array<{
  label: string
  url: string
  featureName: FeatureName
  hasChildTab?: boolean
  childTab?: string[]
}>

const tabs = (t: TFunction, lang: string): Tabs => [
  {
    label: t('tab.entity'),
    url: `/${lang}/v5/global-settings/entity`,
    featureName: 'entity-global-view',
  },
  {
    label: 'Program',
    url: `/${lang}/v5/global-settings/program`,
    featureName: 'program-global-view',
  },
  {
    label: t('tab.user'),
    url: `/${lang}/v5/global-settings/user`,
    featureName: 'user-global-view',
  },
  // { label: 'Role', url: `/${lang}/v5/global-settings/role` },
  {
    label: 'Material',
    url: `/${lang}/v5/global-settings/material/data`,
    featureName: 'material-global-view',
    hasChildTab: true,
    childTab: ['data', 'volume'],
  },
  {
    label: t('tab.budget_source'),
    url: `/${lang}/v5/global-settings/budget-source`,
    featureName: 'budget-source-global-view',
  },
  {
    label: t('tab.manufacturer'),
    url: `/${lang}/v5/global-settings/manufacturer`,
    featureName: 'manufacturer-global-view',
  },
  {
    label: t('tab.assets.label'),
    url: `/${lang}/v5/global-settings/asset/type`,
    featureName: 'asset-type-global-view',
    hasChildTab: true,
    childTab: ['type', 'model', 'vendor', 'pqs'],
  },
  {
    label: t('tab.patient'),
    url: `/${lang}/v5/global-settings/patient`,
    featureName: 'patient-global-view',
  },
  {
    label: t('tab.annual_planning_target_group'),
    url: `/${lang}/v5/global-settings/annual-planning-target-group`,
    featureName: 'annual-planning-target-group-view',
  },
  {
    label: t('tab.population'),
    url: `/${lang}/v5/global-settings/population`,
    featureName: 'population-view',
  },
]

type TTabsItem = {
  id: string
  label: string
  href: string
  isShow: boolean
}

type TProps = {
  children: ReactNode
  title?: string
  showButtonCreate?: boolean
  buttonCreate?: {
    label: string
    onClick: () => void
  }
  childTabs?: TTabsItem[]
}

const GlobalSettings: React.FC<TProps> = ({
  children,
  title,
  showButtonCreate = true,
  buttonCreate,
  childTabs,
}) => {
  const {
    t,
    i18n: { language },
  } = useTranslation()
  const router = useSmileRouter()
  const isOnline = useOnlineStatus()
  const pathname = router.pathname
  const isShowAnnualPlanningTargetGroup = useFeatureIsOn(
    'annual_planning.global_target_group'
  )
  const isShowPopulation = useFeatureIsOn('annual_planning.global_population')
  const isShowPatient = useFeatureIsOn('global_setting.patient')

  const featureFlags: Record<string, boolean> = {
    'annual-planning-target-group-view': isShowAnnualPlanningTargetGroup,
    'population-view': isShowPopulation,
    'patient-global-view': isShowPatient,
  }

  return isOnline ? (
    <AppLayout
      title={t('dropdown_setting.global_settings')}
      tabs={tabs(t, language).filter(
        (tab) =>
          hasPermission(tab.featureName) &&
          (typeof featureFlags[tab.featureName] === 'undefined' ||
            (typeof featureFlags[tab.featureName] === 'boolean' &&
              featureFlags[tab.featureName]))
      )}
    >
      {childTabs && (
        <div className="ui-mt-6">
          <TabsLinkRoot variant="pills" align="center">
            <TabsLinkList>
              {childTabs?.map((item) => {
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
      <div className="ui-my-6 ui-flex ui-justify-between ui-items-center">
        <h5 className="ui-font-bold ui-text-xl">{title}</h5>
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
      {children}
    </AppLayout>
  ) : null
}

export default GlobalSettings
