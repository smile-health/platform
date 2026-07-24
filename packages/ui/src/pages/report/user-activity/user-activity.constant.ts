import cx from '#lib/cx'
import dayjs from 'dayjs'
import { TFunction } from 'i18next'

import UserActivityChart from './components/UserActivityChart'
import UserActivityTable from './components/UserActivityTable'

export const DOWNLOAD_EXTENSIONS = ['png', 'jpg', 'pdf']

export function getUserActivityTabs(t: TFunction<'userActivity'>) {
  return [
    {
      id: 'overview',
      label: t('title.tab.overview'),
      component: UserActivityChart,
    },
    {
      id: 'entity',
      label: t('title.tab.entity'),
      component: UserActivityTable,
    },
  ]
}

export function getEntityTableHeader(
  t: TFunction<'userActivity'>,
  lang: string,
  month: string,
  intervalPeriod: string[],
  isShowCustomerActivity = false
) {
  return [
    [
      {
        label: 'SI.NO',
        class:
          'ui-sticky ui-left-0 ui-min-w-14 ui-w-14 ui-border-r ui-border-gray-300',
      },
      {
        label: t('column.entity'),
        class:
          'ui-sticky ui-left-14 ui-min-w-48 ui-w-48 ui-border-r ui-border-gray-300',
      },
      ...(isShowCustomerActivity
        ? [
            {
              label: t('column.customer'),
              class:
                'ui-sticky ui-left-[248px] ui-min-w-48 ui-w-48 ui-border-r ui-border-gray-300',
            },
          ]
        : []),
      ...(intervalPeriod?.length
        ? [
            {
              label: month,
              colSpan: intervalPeriod?.length,
              class: 'ui-text-center',
            },
            {
              label: t('column.active'),
              class: cx(
                'ui-sticky ui-border-l ui-border-gray-300 ui-text-center',
                {
                  'ui-right-[225px]': lang === 'en',
                  'ui-right-[210px]': lang === 'id',
                }
              ),
            },
            {
              label: t('column.inactive'),
              class: cx(
                'ui-sticky ui-border-l ui-border-gray-300 ui-text-center',
                {
                  'ui-right-[160px]': lang === 'en',
                  'ui-right-[150px]': lang === 'id',
                }
              ),
            },
            {
              label: t('column.frequency.total'),
              class: cx(
                'ui-sticky ui-border-l ui-border-gray-300 ui-text-center',
                {
                  'ui-right-[80px]': lang === 'en',
                  'ui-right-[75px]': lang === 'id',
                }
              ),
            },
            {
              label: t('column.frequency.average'),
              class:
                'ui-sticky ui-right-0 ui-border-l ui-border-gray-300 ui-text-center',
            },
          ]
        : []),
    ],
    intervalPeriod?.length
      ? [
          {
            label: '',
            class:
              'ui-sticky ui-left-0 ui-min-w-14 ui-w-14  ui-border-r ui-border-gray-300',
          },
          {
            label: '',
            class:
              'ui-sticky ui-left-14 ui-min-w-48 ui-w-48 ui-border-r ui-border-gray-300',
          },
          ...(isShowCustomerActivity
            ? [
                {
                  label: '',
                  class:
                    'ui-sticky ui-left-[248px] ui-min-w-48 ui-w-48 ui-border-r ui-border-gray-300',
                },
              ]
            : []),
          ...(intervalPeriod || []).map((period, index) => ({
            label: dayjs(period).format('DD'),
            class: cx(
              'ui-border-r ui-border-gray-300 ui-bg-slate-200 ui-text-center',
              {
                'ui-border-r-0': index === intervalPeriod.length - 1,
              }
            ),
          })),
          {
            label: '',
            class: cx(
              'ui-sticky ui-border-l ui-border-gray-300 ui-text-center',
              {
                'ui-right-[225px]': lang === 'en',
                'ui-right-[210px]': lang === 'id',
              }
            ),
          },
          {
            label: '',
            class: cx(
              'ui-sticky ui-border-l ui-border-gray-300 ui-text-center',
              {
                'ui-right-[160px]': lang === 'en',
                'ui-right-[150px]': lang === 'id',
              }
            ),
          },
          {
            label: '',
            class: cx(
              'ui-sticky ui-border-l ui-border-gray-300 ui-text-center',
              {
                'ui-right-[80px]': lang === 'en',
                'ui-right-[75px]': lang === 'id',
              }
            ),
          },
          {
            label: '',
            class:
              'ui-sticky ui-right-0 ui-border-l ui-border-gray-300 ui-text-center',
          },
        ]
      : [],
  ]
}
