'use client'

import React, { useMemo } from 'react'
import {
  DocumentCheckIcon,
  PaperAirplaneIcon,
  PencilIcon,
} from '@heroicons/react/24/outline'
import { PlusIcon, XCircleIcon } from '@heroicons/react/24/solid'
import { Button } from '#components/button'
import Download from '#components/icons/Download'
import ImportIcon from '#components/icons/Import'
import { StatusSwitch } from '#components/switch'
import cx from '#lib/cx'
import { numberFormatter } from '#utils/formatter'
import clsx from 'clsx'
import { useTranslation } from 'react-i18next'

import BmhpApprovalTable, {
  BmhpApprovalTableColumn,
  BmhpApprovalTableHeaderGroup,
  BmhpApprovalTd,
} from '../../../components/BmhpApprovalTable'
import { BmhpEntityData, BmhpTargetGroup } from '../libs/target-adjustment.type'

interface TargetAdjustmentTableProps {
  data: BmhpEntityData[]
  targetGroups: BmhpTargetGroup[]
  onAddTarget: (entity: BmhpEntityData) => void
  onToggleStatus: (
    entityId: number,
    targetGroupId: number,
    examinationId: number,
    status: boolean
  ) => void
  onApproveAll: () => void
  onReviseAll: () => void
  onSendRevision: () => void
  onPreview: () => void
  onSeeCalculation?: () => void
  onDownloadTemplate?: () => void
  onImport?: () => void
  hasRejected?: boolean
  canSendRevision?: boolean
  isPreview?: boolean
  seeCalculation?: boolean
}

const TargetAdjustmentTable: React.FC<TargetAdjustmentTableProps> = ({
  data,
  targetGroups,
  onAddTarget,
  onToggleStatus,
  onApproveAll,
  onReviseAll,
  onSendRevision,
  onPreview,
  onSeeCalculation,
  onDownloadTemplate,
  onImport,
  hasRejected = false,
  canSendRevision = false,
  isPreview = false,
  seeCalculation = false,
}) => {
  const { t, i18n } = useTranslation(['bmhpApproval', 'common'])
  // ── Header groups (2-level thead) ─────────────────────────────────────────
  const headers = useMemo<BmhpApprovalTableHeaderGroup[]>(() => {
    // Row 1: fixed cols span 2 rows; dynamic TG cols span 2 columns
    const row1: BmhpApprovalTableColumn[] = [
      {
        key: 'no',
        header: t('bmhpApproval:target_adjustment.table.col_no'),
        width: 60,
        rowSpan: 2,
        sticky: true,
        headerClassName: 'ui-text-center',
      },
      {
        key: 'hc_name',
        header: t('bmhpApproval:target_adjustment.table.col_health_care_name'),
        width: 320,
        rowSpan: 2,
        sticky: true,
      },
      ...(!isPreview
        ? [
            {
              key: 'target_input',
              header: t(
                'bmhpApproval:target_adjustment.table.col_target_input'
              ),
              width: 180,
              rowSpan: 2,
              sticky: true,
              headerClassName: 'ui-text-center',
            },
          ]
        : []),
      ...targetGroups.map<BmhpApprovalTableColumn>((tg) => ({
        key: `tg_${tg.examination_id}_${tg.id}`,
        colSpan: 2,
        header: (
          <div className="ui-flex ui-flex-col ui-items-center">
            <div>{tg.name}</div>
            <div className="ui-text-xs ui-font-normal ui-text-neutral-400">
              {tg.examination}
            </div>
          </div>
        ),
        headerClassName: 'ui-text-center',
      })),
      {
        key: 'updated_by',
        header: t('bmhpApproval:target_adjustment.table.col_updated_by'),
        minWidth: 160,
        rowSpan: 2,
        headerClassName: 'ui-text-center',
      },
    ]

    // Row 2: only the Target/Adjustment sub-headers for each TG
    const row2: BmhpApprovalTableColumn[] = [
      ...targetGroups.flatMap<BmhpApprovalTableColumn>((tg) => [
        {
          key: `tg_${tg.examination_id}_${tg.id}_target`,
          header: t('bmhpApproval:target_adjustment.table.col_target'),
          // minWidth: 110,
          width: 130,
          headerClassName: 'ui-text-center',
        },
        {
          key: `tg_${tg.examination_id}_${tg.id}_adjustment`,
          header: t(
            'bmhpApproval:target_adjustment.table.col_target_adjustment'
          ),
          // minWidth: 120,
          width: 130,
          headerClassName: 'ui-text-center',
        },
      ]),
    ]

    return [
      { key: 'row1', columns: row1 },
      { key: 'row2', columns: row2 },
    ]
  }, [targetGroups, t, isPreview])

  // ── Leaf columns (drives colSpan on empty/loading rows) ───────────────────
  const leafColumns = useMemo<BmhpApprovalTableColumn[]>(
    () => [
      {
        key: 'no',
        header: t('bmhpApproval:target_adjustment.table.col_no'),
        width: 60,
        sticky: true,
      },
      {
        key: 'hc_name',
        header: t('bmhpApproval:target_adjustment.table.col_health_care_name'),
        width: 320,
        sticky: true,
      },
      {
        key: 'target_input',
        header: t('bmhpApproval:target_adjustment.table.col_target_input'),
        width: 130,
        sticky: true,
      },
      ...targetGroups.flatMap<BmhpApprovalTableColumn>((tg) => [
        {
          key: `tg_${tg.examination_id}_${tg.id}_target`,
          header: t('bmhpApproval:target_adjustment.table.col_target_dinkes'),
        },
        {
          key: `tg_${tg.examination_id}_${tg.id}_adjustment`,
          header: t(
            'bmhpApproval:target_adjustment.table.col_target_adjustment'
          ),
        },
      ]),
      {
        key: 'updated_by',
        header: t('bmhpApproval:target_adjustment.table.col_updated_by'),
      },
    ],
    [targetGroups, t]
  )

  return (
    <div className={cx('ui-space-y-4', !isPreview && 'ui-border ui-p-5')}>
      {/* Toolbar */}
      <div
        className={cx(
          'ui-flex ui-items-center ui-justify-between ui-flex-wrap ui-gap-3',
          isPreview && 'ui-hidden'
        )}
      >
        <span className="ui-text-base ui-font-semibold">
          {t('bmhpApproval:target_adjustment.table.health_care_list')}
        </span>
        <div className="ui-flex ui-items-center ui-divide-x">
          <div className="ui-px-2 ui-flex ui-gap-2">
            {onDownloadTemplate && (
              <Button
                variant="subtle"
                size="sm"
                type="button"
                onClick={onDownloadTemplate}
                leftIcon={<Download className="h-5 w-5" />}
              >
                {t('common:download_template')}
              </Button>
            )}
            {onImport && (
              <Button
                variant="subtle"
                size="sm"
                type="button"
                onClick={onImport}
                leftIcon={<ImportIcon className="h-5 w-5" />}
              >
                {t('common:import')}
              </Button>
            )}
          </div>
          <div className="ui-px-2 ui-flex ui-gap-2">
            <Button
              variant="subtle"
              color="danger"
              size="sm"
              onClick={onReviseAll}
              leftIcon={<PencilIcon className="h-5 w-5" />}
            >
              {t('bmhpApproval:target_adjustment.table.btn_revise_all')}
            </Button>
            <Button
              variant="subtle"
              size="sm"
              onClick={onApproveAll}
              leftIcon={<DocumentCheckIcon className="ui-h-5 ui-w-5" />}
            >
              {t('bmhpApproval:target_adjustment.table.btn_approve_all')}
            </Button>
          </div>
          <div className="ui-px-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!canSendRevision}
              onClick={onSendRevision}
              leftIcon={<PaperAirplaneIcon className="ui-h-5 ui-w-5" />}
            >
              {t('bmhpApproval:target_adjustment.table.btn_send_revision')}
            </Button>
          </div>
          <div className="ui-px-2 ui-flex ui-gap-2">
            <Button variant="outline" size="sm" onClick={onPreview}>
              {t('bmhpApproval:target_adjustment.table.btn_preview')}
            </Button>
            <Button
              variant="solid"
              size="sm"
              disabled={!seeCalculation}
              onClick={onSeeCalculation}
            >
              {t('bmhpApproval:target_adjustment.table.btn_see_calculation')}
            </Button>
          </div>
        </div>
      </div>

      <BmhpApprovalTable
        headers={headers}
        leafColumns={leafColumns}
        data={data}
        withBorder
        id="targetAdjustmentTable"
        renderRow={(row, rowIndex) => {
          return (
            <>
              {/* No */}
              <BmhpApprovalTd
                stickyKey="no"
                className="ui-text-center ui-text-neutral-500"
              >
                {rowIndex + 1}
              </BmhpApprovalTd>

              {/* Health Care Name */}
              <BmhpApprovalTd stickyKey="hc_name">
                <div className="ui-text-sm ui-font-medium">
                  {row.entity_name.name}
                </div>
                {row.entity_name.address && (
                  <div className="ui-text-xs ui-text-neutral-400">
                    {row.entity_name.address}
                  </div>
                )}
              </BmhpApprovalTd>

              {/* Target Input */}
              {!isPreview && (
                <BmhpApprovalTd
                  stickyKey="target_input"
                  className="ui-text-center"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => onAddTarget(row)}
                    leftIcon={<PlusIcon className="ui-w-3 ui-h-3" />}
                  >
                    {t('bmhpApproval:target_adjustment.table.btn_add_target')}
                  </Button>
                </BmhpApprovalTd>
              )}

              {/* Dynamic target-group cells */}
              {targetGroups.map((tg) => {
                const item = row.target.find(
                  (t) =>
                    t.target_id === tg.id &&
                    t.examination_id === tg.examination_id
                )
                const approved = item?.status === true
                const itemStatus = item?.item_status

                // const isNotScreening = item?.is_not_screening === true
                // const isNotApplicable = itemStatus === 'not_applicable'
                // verification_status=0 means puskesmas excluded this tg — treat same as not_submitted
                const isNotSubmitted = itemStatus === 'not_submitted' || item?.verification_status === 0

                // Show X icon only for not_submitted
                const showXIcon = isNotSubmitted

                return (
                  <React.Fragment key={`${tg.examination_id}_${tg.id}`}>
                    {/* Target (Dinkes) */}
                    <BmhpApprovalTd className="ui-text-center">
                      <div className="ui-flex ui-flex-col ui-items-center ui-gap-1">
                        <span className="ui-text-sm">
                          {numberFormatter(item?.target ?? 0, i18n.language)}
                        </span>
                      </div>
                    </BmhpApprovalTd>

                    {/* Target Adjustment */}
                    <BmhpApprovalTd className="ui-text-center ui-flex-col">
                      <div className="ui-flex ui-flex-col ui-items-center ui-gap-1">
                        {showXIcon ? (
                          <XCircleIcon className="ui-w-5 ui-h-5 ui-text-danger-500 ui-mx-auto" />
                        ) : (
                          <>
                            <span
                              className={clsx(
                                'ui-text-sm'
                                // (isNotScreening || isNotApplicable) &&
                                //   'ui-flex ui-items-center ui-justify-center ui-w-9 ui-h-6 ui-rounded-full ui-bg-neutral-100 ui-text-neutral-400 ui-text-xs ui-font-medium ui-mx-auto'
                              )}
                            >
                              {/* {isNotScreening || isNotApplicable
                                ? 'N/A'
                                : 
                              } */}
                              {numberFormatter(
                                item?.adjustment_target ?? 0,
                                i18n.language
                              )}
                            </span>
                            {!isPreview && (
                              // !isNotScreening &&
                              // !isNotApplicable &&
                              <StatusSwitch
                                checked={approved}
                                onCheckedChange={(checked) =>
                                  onToggleStatus(
                                    row.entity_name.id,
                                    tg.id,
                                    tg.examination_id,
                                    checked
                                  )
                                }
                                size="sm"
                              />
                            )}
                          </>
                        )}
                      </div>
                    </BmhpApprovalTd>
                  </React.Fragment>
                )
              })}

              {/* Updated By */}
              <BmhpApprovalTd>
                {row.user_updated_by ? (
                  <div>
                    <div className="ui-text-sm ui-font-medium">
                      {[
                        row.user_updated_by.firstname,
                        row.user_updated_by.lastname,
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    </div>
                    {row.updated_at && (
                      <div className="ui-text-xs ui-text-neutral-400">
                        {new Date(row.updated_at).toLocaleString('id-ID')}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="ui-text-neutral-300">—</span>
                )}
              </BmhpApprovalTd>
            </>
          )
        }}
      />
    </div>
  )
}

export default TargetAdjustmentTable
