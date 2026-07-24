'use client'

import React, { useMemo } from 'react'
import { Button } from '#components/button'
import {
  Drawer,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from '#components/drawer'
import { useTranslation } from 'react-i18next'

import {
  BmhpApprovalTableColumn,
  BmhpApprovalTableHeaderGroup,
} from '../../../components/BmhpApprovalTable'
import { BmhpEntityData, BmhpTargetGroup } from '../libs/target-adjustment.type'
import TargetAdjustmentTable from './TargetAdjustmentTable'

interface PreviewDrawerProps {
  open: boolean
  onClose: () => void
  data: BmhpEntityData[]
  targetGroups: BmhpTargetGroup[]
}

/** Groups target_group[] by examination_id */
function groupByExamination(groups: BmhpTargetGroup[]) {
  const map = new Map<
    number,
    { examination_id: number; examination: string; targets: BmhpTargetGroup[] }
  >()
  groups.forEach((g) => {
    if (!map.has(g.examination_id)) {
      map.set(g.examination_id, {
        examination_id: g.examination_id,
        examination: g.examination,
        targets: [],
      })
    }
    map.get(g.examination_id)!.targets.push(g)
  })
  return Array.from(map.values())
}

const PreviewDrawer: React.FC<PreviewDrawerProps> = ({
  open,
  onClose,
  data,
  targetGroups,
}) => {
  const { t } = useTranslation(['bmhpApproval'])
  const examGroups = useMemo(
    () => groupByExamination(targetGroups),
    [targetGroups]
  )

  const headers = useMemo<BmhpApprovalTableHeaderGroup[]>(() => {
    const row1: BmhpApprovalTableColumn[] = [
      {
        key: 'no',
        header: t('bmhpApproval:target_adjustment.table.col_no'),
        width: 48,
        rowSpan: 3,
        sticky: true,
        headerClassName: 'ui-text-center',
      },
      {
        key: 'hc_name',
        header: t(
          'bmhpApproval:target_adjustment.preview_drawer.col_health_care_name'
        ),
        width: 200,
        rowSpan: 3,
        sticky: true,
      },
      ...examGroups.map<BmhpApprovalTableColumn>((eg) => ({
        key: `exam_${eg.examination_id}`,
        colSpan: eg.targets.length * 2,
        header: eg.examination,
        headerClassName: 'ui-text-center ui-bg-blue-50',
      })),
      {
        key: 'updated_by',
        header: t(
          'bmhpApproval:target_adjustment.preview_drawer.col_updated_by'
        ),
        minWidth: 160,
        rowSpan: 3,
        headerClassName: 'ui-text-center',
      },
    ]

    const row2: BmhpApprovalTableColumn[] =
      examGroups.flatMap<BmhpApprovalTableColumn>((eg) =>
        eg.targets.map((tg) => ({
          key: `tg_${eg.examination_id}_${tg.id}`,
          colSpan: 2,
          header: (
            <div className="ui-flex ui-flex-col ui-items-center">
              <div>{tg.name}</div>
              <div className="ui-text-xs ui-font-normal ui-text-neutral-400">
                {eg.examination}
              </div>
            </div>
          ),
          headerClassName: 'ui-text-center',
        }))
      )

    const row3: BmhpApprovalTableColumn[] =
      examGroups.flatMap<BmhpApprovalTableColumn>((eg) =>
        eg.targets.flatMap<BmhpApprovalTableColumn>((tg) => [
          {
            key: `tg_${eg.examination_id}_${tg.id}_target`,
            header: t(
              'bmhpApproval:target_adjustment.preview_drawer.col_target_dinkes'
            ),
            width: 100,
            headerClassName: 'ui-text-center',
          },
          {
            key: `tg_${eg.examination_id}_${tg.id}_adjustment`,
            header: t(
              'bmhpApproval:target_adjustment.preview_drawer.col_adj_target'
            ),
            width: 100,
            headerClassName: 'ui-text-center',
          },
        ])
      )

    return [
      { key: 'row1', columns: row1 },
      { key: 'row2', columns: row2 },
      { key: 'row3', columns: row3 },
    ]
  }, [examGroups, t])

  const leafColumns = useMemo<BmhpApprovalTableColumn[]>(
    () => [
      {
        key: 'no',
        header: t('bmhpApproval:target_adjustment.table.col_no'),
        width: 48,
        sticky: true,
      },
      {
        key: 'hc_name',
        header: t(
          'bmhpApproval:target_adjustment.preview_drawer.col_health_care_name'
        ),
        width: 200,
        sticky: true,
      },
      ...examGroups.flatMap<BmhpApprovalTableColumn>((eg) =>
        eg.targets.flatMap<BmhpApprovalTableColumn>((tg) => [
          {
            key: `tg_${eg.examination_id}_${tg.id}_target`,
            header: t(
              'bmhpApproval:target_adjustment.preview_drawer.col_target_dinkes'
            ),
          },
          {
            key: `tg_${eg.examination_id}_${tg.id}_adjustment`,
            header: t(
              'bmhpApproval:target_adjustment.preview_drawer.col_adj_target'
            ),
          },
        ])
      ),
      {
        key: 'updated_by',
        header: t(
          'bmhpApproval:target_adjustment.preview_drawer.col_updated_by'
        ),
      },
    ],
    [examGroups, t]
  )

  return (
    <Drawer
      open={open}
      onOpenChange={(v) => !v && onClose()}
      placement="bottom"
      size="full"
      sizeHeight="xl"
    >
      <DrawerHeader
        className="ui-border-b ui-border-neutral-200 ui-text-center"
        title={t('bmhpApproval:target_adjustment.preview_drawer.title')}
      >
        <div onClick={onClose}>
          <DrawerCloseButton />
        </div>
      </DrawerHeader>

      <DrawerContent className="ui-overflow-auto ui-flex-1 ui-p-5">
        <TargetAdjustmentTable
          isPreview
          data={data}
          targetGroups={targetGroups}
          onAddTarget={() => {}}
          onToggleStatus={() => {}}
          onApproveAll={() => {}}
          onReviseAll={() => {}}
          onSendRevision={() => {}}
          onPreview={() => {}}
        />
        {/* <BmhpApprovalTable
          headers={headers}
          leafColumns={leafColumns}
          data={data}
          withBorder
          id="previewTable"
          renderRow={(entity, idx) => (
            <>
              <BmhpApprovalTd
                stickyKey="no"
                className="ui-text-center ui-text-neutral-500"
              >
                {idx + 1}
              </BmhpApprovalTd>

              <BmhpApprovalTd stickyKey="hc_name">
                <div className="ui-text-sm ui-font-medium">
                  {entity.entity_name.name}
                </div>
                {entity.entity_name.address && (
                  <div className="ui-text-xs ui-text-neutral-400">
                    {entity.entity_name.address}
                  </div>
                )}
              </BmhpApprovalTd>

              {examGroups.map((eg) =>
                eg.targets.map((tg) => {
                  const item = entity.target.find(
                    (t) =>
                      t.target_id === tg.id &&
                      t.examination_id === eg.examination_id
                  )
                  return (
                    <React.Fragment key={`cell-${eg.examination_id}-${tg.id}`}>
                      <BmhpApprovalTd className="ui-text-center">
                        <span className="ui-text-sm">{item?.target ?? 0}</span>
                      </BmhpApprovalTd>
                      <BmhpApprovalTd className="ui-text-center">
                        <span className="ui-text-sm">
                          {item?.adjustment_target ?? 0}
                        </span>
                      </BmhpApprovalTd>
                    </React.Fragment>
                  )
                })
              )}

              <BmhpApprovalTd>
                {entity.user_updated_by ? (
                  <div>
                    <div className="ui-text-sm ui-font-medium">
                      {[
                        entity.user_updated_by.firstname,
                        entity.user_updated_by.lastname,
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    </div>
                    {entity.updated_at && (
                      <div className="ui-text-xs ui-text-neutral-400">
                        {new Date(entity.updated_at).toLocaleString('id-ID')}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="ui-text-neutral-300">—</span>
                )}
              </BmhpApprovalTd>
            </>
          )}
        /> */}
      </DrawerContent>

      <DrawerFooter className="ui-border-t ui-border-neutral-200 ui-flex ui-justify-end">
        <Button variant="outline" onClick={onClose}>
          {t('bmhpApproval:target_adjustment.preview_drawer.btn_close')}
        </Button>
      </DrawerFooter>
    </Drawer>
  )
}

export default PreviewDrawer
