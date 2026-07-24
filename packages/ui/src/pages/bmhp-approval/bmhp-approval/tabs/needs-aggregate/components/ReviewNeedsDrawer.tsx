'use client'

import React from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Button } from '#components/button'
import {
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from '#components/drawer'
import { useTranslation } from 'react-i18next'

import { useNeedsAggregateDetails } from '../hooks/useNeedsAggregateOperations'

interface ReviewNeedsDrawerProps {
  open: boolean
  onClose: () => void
  data: {
    city_id: number
    city_name: string
    province_name?: string
    year?: number
  } | null
}

const ReviewNeedsDrawer: React.FC<ReviewNeedsDrawerProps> = ({
  open,
  onClose,
  data,
}) => {
  const { t } = useTranslation('bmhpApproval')

  const { data: detailsData, isLoading } = useNeedsAggregateDetails({
    cityId: data?.city_id ?? null,
    programPlanId: data?.year ?? 0,
    enabled: open && !!data?.city_id && !!data?.year,
  })

  return (
    <Drawer
      open={open}
      onOpenChange={(v) => !v && onClose()}
      placement="bottom"
      size="full"
      sizeHeight="xl"
      className="ui-rounded-t-3xl"
    >
      {/* Custom Header */}
      <DrawerHeader
        className="ui-border-b ui-border-neutral-200 ui-text-center"
        title={t('needs_aggregate.drawer.title')}
      >
        <div onClick={onClose}>
          <DrawerCloseButton />
        </div>
      </DrawerHeader>

      <DrawerContent className="ui-flex ui-flex-1 ui-overflow-hidden">
        {data && (
          <div className="ui-flex ui-flex-col ui-w-full ui-h-full">
            {/* Province, City, Program Plan Info */}
            <div className="ui-p-5 ui-pb-4">
              <div className="ui-inline-flex ui-items-center ui-gap-3">
                {/* Province */}
                <div className="ui-bg-neutral-50 ui-p-4 ui-rounded-lg">
                  <p className="ui-text-xs ui-text-neutral-500">
                    {t('needs_aggregate.drawer.label_province')}
                  </p>
                  <p className="ui-text-sm ui-font-semibold ui-text-neutral-800 ui-mt-1">
                    {data.province_name ?? '-'}
                  </p>
                </div>

                {/* City */}
                <div className="ui-bg-neutral-50 ui-p-4 ui-rounded-lg">
                  <p className="ui-text-xs ui-text-neutral-500">
                    {t('needs_aggregate.drawer.label_city')}
                  </p>
                  <p className="ui-text-sm ui-font-semibold ui-text-neutral-800 ui-mt-1">
                    {data.city_name}
                  </p>
                </div>

                {/* Program Plan (Year) */}
                <div className="ui-bg-neutral-50 ui-p-4 ui-rounded-lg">
                  <p className="ui-text-xs ui-text-neutral-500">
                    {t('needs_aggregate.drawer.label_program_plan')}
                  </p>
                  <p className="ui-text-sm ui-font-semibold ui-text-neutral-800 ui-mt-1">
                    {data.year ?? '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Table Container with Sticky Header */}
            <div className="ui-flex-1 ui-overflow-auto">
              <table className="ui-w-full ui-border ui-border-neutral-200">
                {/* Sticky Header */}
                <thead className="ui-sticky ui-top-0 ui-z-10 ui-bg-slate-100">
                  <tr className="ui-border-b ui-border-neutral-200">
                    <th
                      className="ui-p-4 ui-text-left ui-text-sm ui-font-semibold ui-text-neutral-700"
                      style={{ width: '50px' }}
                    >
                      {t('needs_aggregate.drawer.col_no')}
                    </th>
                    <th className="ui-p-4 ui-text-left ui-text-sm ui-font-semibold ui-text-neutral-700 ui-border-neutral-200">
                      {t('needs_aggregate.drawer.col_examination')}
                    </th>
                    <th className="ui-p-4 ui-text-left ui-text-sm ui-font-semibold ui-text-neutral-700 ui-border-neutral-200">
                      {t('needs_aggregate.drawer.col_target_group')}
                    </th>
                    <th
                      className="ui-p-4 ui-text-center ui-text-sm ui-font-semibold ui-text-neutral-700 ui-border-neutral-200"
                      style={{ width: '150px' }}
                    >
                      {t('needs_aggregate.drawer.col_total_needs')}
                    </th>
                    <th
                      className="ui-p-4 ui-text-center ui-text-sm ui-font-semibold ui-text-neutral-700 ui-border-neutral-200"
                      style={{ width: '100px' }}
                    >
                      {t('needs_aggregate.drawer.col_unit')}
                    </th>
                  </tr>
                </thead>
                {/* Scrollable Body */}
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="ui-p-8 ui-text-center ui-text-neutral-500"
                      >
                        Loading...
                      </td>
                    </tr>
                  ) : detailsData?.data && detailsData.data.length > 0 ? (
                    detailsData.data.map((item, idx) => (
                      <tr
                        key={idx}
                        className="ui-border-b ui-border-neutral-100 hover:ui-bg-neutral-50"
                      >
                        <td className="ui-p-4 ui-text-sm ui-text-neutral-600 ui-text-center">
                          {idx + 1}.
                        </td>
                        <td className="ui-p-4 ui-text-sm ui-font-medium ui-text-neutral-800 ui-border-neutral-200">
                          {item.examination_name}
                        </td>
                        <td className="ui-p-4 ui-text-sm ui-text-neutral-700 ui-border-neutral-200">
                          {item.target_group_name}
                        </td>
                        <td className="ui-p-4 ui-text-sm ui-text-right ui-text-neutral-700 ui-border-neutral-200">
                          {item.total_needs}
                        </td>
                        <td className="ui-p-4 ui-text-sm ui-text-center ui-text-neutral-700 ui-border-neutral-200">
                          {item.unit || '-'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="ui-p-8 ui-text-center ui-text-neutral-500"
                      >
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </DrawerContent>

      <DrawerFooter className="ui-border-t ui-border-neutral-200 ui-flex ui-justify-end ui-gap-3">
        <Button variant="outline" onClick={onClose}>
          {t('needs_aggregate.drawer.btn_cancel_review')}
        </Button>
        <Button
          variant="solid"
          className="ui-bg-primary-600 ui-border-primary-600 hover:ui-bg-primary-700"
        >
          {t('needs_aggregate.drawer.btn_mark_reviewed')}
        </Button>
      </DrawerFooter>
    </Drawer>
  )
}

export default ReviewNeedsDrawer
