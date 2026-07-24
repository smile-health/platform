import React from 'react'
import { Badge } from '#components/badge'
import { Button } from '#components/button'
import { Input } from '#components/input'
import { Switch } from '#components/switch'
import { useTranslation } from 'react-i18next'

import { EntityData, Material } from '../libs/verify-planning.type'

interface VerifyPlanningTableProps {
  data: EntityData[]
  materials: Material[]
  onValueChange: (
    entityIndex: number,
    examinationId: number,
    targetId: number,
    field: 'target' | 'adjustment_target' | 'status',
    value: number | boolean
  ) => void
  onBatchStatusChange: (status: boolean) => void
  onExport?: () => void
}

/**
 * Table component for displaying and editing verify planning data
 *
 * Table structure (3 header rows):
 *   Row 1: Material (examination) groups — colspan = target_groups.length * 3
 *   Row 2: Target group sub-headers — colspan = 3
 *   Row 3: Column labels — target / adj. target / status
 *
 * Cell lookup: find target item by examination_id + target_id
 */
const VerifyPlanningTable: React.FC<VerifyPlanningTableProps> = ({
  data,
  materials,
  onValueChange,
  onBatchStatusChange,
  onExport,
}) => {
  const { t } = useTranslation(['common', 'bmhpPlanning'])

  if (!data || data.length === 0) {
    return (
      <div className="ui-text-center ui-py-8 ui-text-gray-500">
        Tidak ada data
      </div>
    )
  }

  return (
    <div className="ui-space-y-4">
      <div className="ui-flex ui-justify-end ui-gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onExport?.()}
          className="ui-text-primary ui-border-primary hover:ui-bg-primary/5"
        >
          Export
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onBatchStatusChange(true)}
          className="ui-text-primary ui-border-primary hover:ui-bg-primary/5"
        >
          Setuju Semua
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onBatchStatusChange(false)}
          className="ui-text-danger ui-border-danger hover:ui-bg-danger/5"
        >
          Revisi Semua
        </Button>
      </div>

      <div className="ui-overflow-x-auto ui-rounded-lg ui-border ui-border-gray-200">
        <table className="ui-w-full ui-border-collapse">
          <thead className="ui-bg-gray-50">
            {/* Row 1: Material (examination) group headers */}
            <tr>
              <th
                className="ui-border ui-border-gray-200 ui-px-4 ui-py-3 ui-text-left ui-text-sm ui-font-semibold ui-text-gray-700 ui-sticky ui-left-0 ui-bg-gray-50 ui-z-[50]"
                rowSpan={3}
              >
                {t('bmhpPlanning:verify.entity_name', 'Nama Entitas')}
              </th>
              {materials.map((mat) => (
                <th
                  key={mat.id}
                  className="ui-border ui-border-gray-200 ui-px-4 ui-py-2 ui-text-center ui-text-sm ui-font-semibold ui-text-gray-700 ui-bg-blue-50"
                  colSpan={mat.target_groups.length * 3}
                >
                  {mat.name}
                </th>
              ))}
            </tr>

            {/* Row 2: Target group sub-headers */}
            <tr>
              {materials.map((mat) =>
                mat.target_groups.map((tg) => (
                  <th
                    key={`${mat.id}-${tg.id}`}
                    className="ui-border ui-border-gray-200 ui-px-3 ui-py-2 ui-text-center ui-text-xs ui-font-semibold ui-text-gray-700"
                    colSpan={3}
                  >
                    {tg.name}
                  </th>
                ))
              )}
            </tr>

            {/* Row 3: Column labels (target / adj. target / status) */}
            <tr>
              {materials.map((mat) =>
                mat.target_groups.map((tg) => (
                  <React.Fragment key={`label-${mat.id}-${tg.id}`}>
                    <th className="ui-border ui-border-gray-200 ui-px-3 ui-py-2 ui-text-center ui-text-xs ui-font-medium ui-text-gray-600 ui-min-w-[100px]">
                      {t('bmhpPlanning:verify.target', 'Target')}
                    </th>
                    <th className="ui-border ui-border-gray-200 ui-px-3 ui-py-2 ui-text-center ui-text-xs ui-font-medium ui-text-gray-600 ui-min-w-[100px]">
                      {t(
                        'bmhpPlanning:verify.adjustment_target',
                        'Adj. Target'
                      )}
                    </th>
                    <th className="ui-border ui-border-gray-200 ui-px-3 ui-py-2 ui-text-center ui-text-xs ui-font-medium ui-text-gray-600 ui-min-w-[80px]">
                      {t('bmhpPlanning:verify.status', 'Status')}
                    </th>
                  </React.Fragment>
                ))
              )}
            </tr>
          </thead>

          <tbody>
            {data.map((entity, entityIdx) => (
              <tr key={entity.entity_name.id} className="hover:ui-bg-gray-50">
                <td className="ui-border ui-border-gray-200 ui-px-4 ui-py-3 ui-text-sm ui-text-gray-900 ui-sticky ui-left-0 ui-bg-white ui-z-[20]">
                  <div className="ui-flex ui-items-center ui-gap-2">
                    <span>{entity.entity_name.name}</span>
                    {entity.id === null && (
                      <Badge variant="light" color="neutral" size="sm">
                        Belum ada data
                      </Badge>
                    )}
                  </div>
                </td>

                {materials.map((mat) =>
                  mat.target_groups.map((tg) => {
                    const item = entity.target.find(
                      (t) =>
                        t.examination_id === mat.id && t.target_id === tg.id
                    )
                    const hasData = item?.id !== null && item?.id !== undefined

                    return (
                      <React.Fragment key={`cell-${mat.id}-${tg.id}`}>
                        <td className="ui-border ui-border-gray-200 ui-px-3 ui-py-2 ui-text-center">
                          {hasData ? (
                            <Input
                              type="number"
                              value={item?.target ?? 0}
                              onChange={(e) =>
                                onValueChange(
                                  entityIdx,
                                  mat.id,
                                  tg.id,
                                  'target',
                                  parseInt(e.target.value) || 0
                                )
                              }
                              min={0}
                              className="ui-w-full ui-text-center "
                            />
                          ) : (
                            <span className="ui-text-gray-400">0</span>
                          )}
                        </td>
                        <td className="ui-border ui-border-gray-200 ui-px-3 ui-py-2 ui-text-center">
                          {hasData ? (
                            <Input
                              type="number"
                              value={item?.adjustment_target ?? 0}
                              onChange={(e) =>
                                onValueChange(
                                  entityIdx,
                                  mat.id,
                                  tg.id,
                                  'adjustment_target',
                                  parseInt(e.target.value) || 0
                                )
                              }
                              min={0}
                              className="ui-w-full ui-text-center "
                            />
                          ) : (
                            <span className="ui-text-gray-400">0</span>
                          )}
                        </td>
                        <td className="ui-border ui-border-gray-200 ui-px-3 ui-py-2 ui-text-center">
                          {hasData ? (
                            <div className="ui-flex ui-justify-center">
                              <Switch
                                checked={item?.status ?? false}
                                onCheckedChange={(checked) =>
                                  onValueChange(
                                    entityIdx,
                                    mat.id,
                                    tg.id,
                                    'status',
                                    checked
                                  )
                                }
                                className=""
                              />
                            </div>
                          ) : (
                            <span className="ui-text-gray-400">-</span>
                          )}
                        </td>
                      </React.Fragment>
                    )
                  })
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Note about input visibility */}
        <div className="ui-bg-blue-50 ui-border-t ui-border-blue-200 ui-px-4 ui-py-3 ui-text-sm ui-text-blue-800 ui-sticky ui-left-0">
          <div className="ui-flex ui-items-start ui-gap-2">
            <svg
              className="ui-w-5 ui-h-5 ui-mt-0.5 ui-flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="ui-font-medium">
                {t('bmhpPlanning:verify.note_title', 'Catatan:')}
              </p>
              <p className="ui-mt-1">
                {t(
                  'bmhpPlanning:verify.note_description',
                  'Input hanya ditampilkan untuk data yang sudah ada. Untuk data yang belum ada (ditampilkan sebagai 0 atau -), silakan buat data terlebih dahulu melalui menu planning.'
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyPlanningTable
