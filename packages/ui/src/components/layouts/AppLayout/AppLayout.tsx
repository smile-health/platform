import { Fragment, ReactNode } from 'react'
import { useRouter } from 'next/router'
import { ArrowLeftIcon, InformationCircleIcon } from '@heroicons/react/24/solid'
import { Button } from '#components/button'
import CustomError from '#components/modules/CustomError'
import {
  TabsLinkList,
  TabsLinkRoot,
  TabsLinkTrigger,
} from '#components/tabs-link'
import { useOnlineStatus } from '#hooks/useOnlineStatus'
import cx from '#lib/cx'
import { useAuth } from '#store/auth.store'
import { useTranslation } from 'react-i18next'

import NavbarV2 from '../../navbar/v2/NavbarV2'
import Header from './Header'

export type TabVariant = 'pills' | 'default'
export type TabPosition = 'center' | 'start' | 'end'

export type AppLayoutProps = {
  children: ReactNode
  title?: React.ReactNode
  subTitle?: string
  tabs?: Array<{
    label: string
    url: string
    hasChildTab?: boolean
    childTab?: string[]
    hidden?: boolean
  }>
  showActionButton?: boolean
  backButton?: {
    label?: string
    onClick?: () => void
    show?: boolean
  }
  actionButtons?: Array<{ label: string; url: string; id?: string }>
  showInformation?: boolean
  onClickInformation?: VoidFunction
  className?: string
  tabVariant?: TabVariant
  tabPosition?: TabPosition
  hasGrandChildTab?: boolean
  grandChildTabs?: string[]
  showFooter?: boolean
}

const executiveDashboardPath = '/[lang]/v5/executive-dashboard'

const whitelistNavbar = [
  '/[lang]/v5/global-settings',
  '/[lang]/v5/global-asset/dashboard/asset-ownership-inventory',
  '/[lang]/v5/global-asset/dashboard/cold-storage-capacity',
  '/[lang]/v5/global-asset/dashboard/temperature-monitoring',
  '/[lang]/v5/global-asset/management/operational-asset-inventory',
  '/[lang]/v5/global-asset/management/monitoring-device-inventory',
  '/[lang]/v5/global-asset/management/storage-temperature-monitoring',
  '/[lang]/v5/notification',
  '/[lang]/v5/program',
  '/[lang]/v5/account',
  '/[lang]/v5/403',
  '/[lang]/v5/export-history',
  executiveDashboardPath,
]

const setBaseUrl = (url: string) => url.split('?')[0]

const AppLayout: React.FC<AppLayoutProps> = (props) => {
  const {
    children,
    title,
    subTitle,
    tabs,
    showActionButton,
    backButton = {
      show: false,
    },
    actionButtons,
    showInformation,
    onClickInformation,
    className,
    tabVariant = 'default',
    tabPosition = undefined,
    hasGrandChildTab = false,
    grandChildTabs = [],
    showFooter = true,
  } = props
  // useAxios()
  const { t } = useTranslation(['common'])
  const router = useRouter()
  const { asPath, pathname } = router
  const isExecutiveDashboard = setBaseUrl(pathname).includes(
    executiveDashboardPath
  )

  const isOnline = useOnlineStatus()

  const handleClickBack = () => {
    if (backButton?.onClick) {
      backButton.onClick()
      return
    }

    router.back()
  }

  const hideNavbar = whitelistNavbar.some((x) =>
    setBaseUrl(pathname).includes(x)
  )

  const { isAuthenticated } = useAuth()

  return !isAuthenticated ? null : (
    <Fragment>
      <Header />
      {!hideNavbar && <NavbarV2 />}
      <div
        className={cx(
          'ui-p-6 ui-min-h-[500px]',
          {
            'ui-p-0': isExecutiveDashboard,
            'ui-container ui-mx-auto': !isExecutiveDashboard,
          },
          className
        )}
      >
        {backButton?.show && (
          <Button
            leftIcon={<ArrowLeftIcon className="ui-h-5" />}
            variant="subtle"
            onClick={handleClickBack}
          >
            {backButton.label ?? t('common:back')}
          </Button>
        )}
        {title && (
          <div
            className={cx('ui-mx-auto', {
              'ui-flex ui-justify-between ui-flex-wrap': showActionButton,
            })}
          >
            {showActionButton && <div className="ui-w-1/4" />}
            <div
              className={cx('ui-mx-auto ui-mt-2', {
                'ui-flex ui-items-center ui-justify-center ui-gap-2':
                  showInformation,
                'ui-mb-6': !!tabs,
                'ui-mb-8': !tabs,
                '!ui-flex-grow': showActionButton,
              })}
            >
              <h2 className="ui-font-bold ui-text-2xl ui-text-center">
                {title}
              </h2>
              {showInformation && (
                <InformationCircleIcon
                  className="ui-size-7 ui-text-dark-blue ui-cursor-pointer"
                  onClick={onClickInformation}
                />
              )}
            </div>
            {subTitle && (
              <h2
                className={cx(
                  'ui-font-bold ui-text-xl ui-text-center ui-text-dark-teal',
                  {
                    'ui-mb-6': !!tabs,
                    'ui-mb-8': !tabs,
                    '!ui-flex-grow': showActionButton,
                  }
                )}
              >
                {subTitle}
              </h2>
            )}
            {showActionButton && (
              <div className="ui-flex ui-justify-end ui-space-x-3">
                {actionButtons?.map((item) => {
                  return (
                    <Button
                      key={`layout-action-button-${item.id}`}
                      id={item.id ?? 'btn-action'}
                      onClick={() => router.push(item.url)}
                      color="primary"
                      variant="outline"
                      className="!ui-mt-[5px]"
                    >
                      {item.label}
                    </Button>
                  )
                })}
              </div>
            )}
          </div>
        )}
        {isOnline ? (
          <Fragment>
            {tabs && (
              <TabsLinkRoot variant={tabVariant} align={tabPosition}>
                <TabsLinkList>
                  {tabs.map((item) => {
                    const parentTabUrl = setBaseUrl(asPath).split('/')

                    const isActive = item?.hasChildTab
                      ? item.childTab?.includes(parentTabUrl?.[5])
                      : setBaseUrl(asPath) === item.url

                    return (
                      <TabsLinkTrigger
                        id={`tab-${item?.label?.toLowerCase()}`}
                        key={item.label}
                        href={item.url}
                        active={isActive}
                      >
                        {item.label}
                      </TabsLinkTrigger>
                    )
                  })}
                </TabsLinkList>
              </TabsLinkRoot>
            )}

            {children}
          </Fragment>
        ) : (
          <CustomError error="connection" />
        )}
      </div>
      {showFooter && (
        <div className="ui-py-20 ui-text-center">
          &copy; {new Date().getFullYear()} SMILE | UNDP
        </div>
      )}
    </Fragment>
  )
}

export default AppLayout
