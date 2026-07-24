'use client'

import React from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Button } from '#components/button'
import { Drawer, DrawerContent, DrawerFooter } from '#components/drawer'
import { useTranslation } from 'react-i18next'

interface ReviewTargetDrawerProps {
  open: boolean
  onClose: () => void
  data: {
    city_name: string
    province_name?: string
    year?: number
  } | null
}

// Mock data for medical equipment/material table
const MOCK_TABLE_DATA = [
  { id: 1, name: 'Alat Tes Rapid TB', target: 100, targetAdjustment: 95 },
  { id: 2, name: 'Alat Tes Gula Darah', target: 150, targetAdjustment: 145 },
  { id: 3, name: 'Alat Tes HIV', target: 80, targetAdjustment: 78 },
  { id: 4, name: 'Alat Tes Malaria', target: 60, targetAdjustment: 60 },
  { id: 5, name: 'Alat Tes Hepatitis', target: 70, targetAdjustment: 68 },
  { id: 6, name: 'Alat Tes Anemia', target: 200, targetAdjustment: 195 },
  { id: 7, name: 'Alat Tes Gigi', target: 120, targetAdjustment: 115 },
  { id: 8, name: 'Alat Tes Fungsi Ginjal', target: 90, targetAdjustment: 88 },
]

const ReviewTargetDrawer: React.FC<ReviewTargetDrawerProps> = ({
  open,
  onClose,
  data,
}) => {
  const { t } = useTranslation('bmhpApproval')
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
      <div className="ui-relative ui-p-5 ui-border-b ui-border-neutral-200">
        <h3 className="ui-text-lg ui-font-bold ui-text-neutral-800 ui-text-center">
          {t('province_completeness.drawer.title')}
        </h3>
        <button
          onClick={onClose}
          className="ui-absolute ui-top-5 ui-right-5 ui-p-2 ui-text-neutral-500 hover:ui-text-neutral-700"
        >
          <XMarkIcon className="ui-w-6 ui-h-6" />
        </button>
      </div>

      <DrawerContent className="ui-flex ui-flex-1 ui-overflow-hidden">
        {data && (
          <div className="ui-flex ui-flex-col ui-w-full ui-h-full">
            {/* Province, City, Program Plan Info */}
            <div className="ui-p-5 ui-pb-4">
              <div className="ui-inline-flex ui-items-center ui-gap-3">
                {/* Province */}
                <div className="ui-bg-neutral-50 ui-p-4 ui-rounded-lg">
                  <p className="ui-text-xs ui-text-neutral-500">
                    {t('province_completeness.drawer.label_province')}
                  </p>
                  <p className="ui-text-sm ui-font-semibold ui-text-neutral-800 ui-mt-1">
                    {data.province_name ?? '-'}
                  </p>
                </div>

                {/* City */}
                <div className="ui-bg-neutral-50 ui-p-4 ui-rounded-lg">
                  <p className="ui-text-xs ui-text-neutral-500">
                    {t('province_completeness.drawer.label_city')}
                  </p>
                  <p className="ui-text-sm ui-font-semibold ui-text-neutral-800 ui-mt-1">
                    {data.city_name}
                  </p>
                </div>

                {/* Program Plan (Year) */}
                <div className="ui-bg-neutral-50 ui-p-4 ui-rounded-lg">
                  <p className="ui-text-xs ui-text-neutral-500">
                    {t('province_completeness.drawer.label_program_plan')}
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
                      {t('province_completeness.drawer.col_no')}
                    </th>
                    <th className="ui-p-4 ui-text-left ui-text-sm ui-font-semibold ui-text-neutral-700 ui-border-neutral-200">
                      {t('province_completeness.drawer.col_name')}
                    </th>
                    <th
                      className="ui-p-4 ui-text-center ui-text-sm ui-font-semibold ui-text-neutral-700 ui-border-neutral-200"
                      style={{ width: '200px' }}
                    >
                      {t('province_completeness.drawer.col_target')}
                    </th>
                    <th
                      className="ui-p-4 ui-text-center ui-text-sm ui-font-semibold ui-text-neutral-700 ui-border-neutral-200"
                      style={{ width: '200px' }}
                    >
                      {t('province_completeness.drawer.col_target_adjustment')}
                    </th>
                  </tr>
                </thead>
                {/* Scrollable Body */}
                <tbody>
                  {MOCK_TABLE_DATA.map((item, idx) => (
                    <tr
                      key={item.id}
                      className="ui-border-b ui-border-neutral-100 hover:ui-bg-neutral-50"
                    >
                      <td className="ui-p-4 ui-text-sm ui-text-neutral-600 ui-text-center">
                        {idx + 1}.
                      </td>
                      <td className="ui-p-4 ui-text-sm ui-font-medium ui-text-neutral-800 ui-border-neutral-200">
                        {item.name}
                      </td>
                      <td className="ui-p-4 ui-text-sm ui-text-right ui-text-neutral-700 ui-border-neutral-200">
                        {item.target.toLocaleString('id-ID')}
                      </td>
                      <td className="ui-p-4 ui-text-sm ui-text-right ui-text-neutral-700 ui-border-neutral-200">
                        {item.targetAdjustment.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </DrawerContent>

      <DrawerFooter className="ui-border-t ui-border-neutral-200 ui-flex ui-justify-end ui-gap-3">
        <Button variant="outline" onClick={onClose}>
          {t('province_completeness.drawer.btn_cancel_review')}
        </Button>
        <Button
          variant="solid"
          className="ui-bg-primary-600 ui-border-primary-600 hover:ui-bg-primary-700"
        >
          {t('province_completeness.drawer.btn_mark_reviewed')}
        </Button>
      </DrawerFooter>
    </Drawer>
  )
}

export default ReviewTargetDrawer
