'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { XCircleIcon, XMarkIcon } from '@heroicons/react/24/solid'
import { Button } from '#components/button'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from '#components/drawer'
import { InputNumber } from '#components/input-number'
import { numberFormatter } from '#utils/formatter'
import { useTranslation } from 'react-i18next'

import BmhpApprovalTable, {
  BmhpApprovalTableColumn,
  BmhpApprovalTd,
} from '../../../components/BmhpApprovalTable'
import {
  useGetTargetInput,
  useUpdateTargetInput,
} from '../hooks/useTargetInput'
import { TargetInputItem } from '../libs/target-adjustment.type'

interface AddTargetDrawerProps {
  open: boolean
  onClose: () => void
  /** Puskesmas entity ID — null when drawer is closed */
  entityId: number | null
  /** Year value (e.g. 2026) used for the GET query */
  programPlanYear: number
  // regencyId: number
  /** Called after successful save */
  onSaved: () => void
}

interface AdjustmentTargetDisplayProps {
  item: TargetInputItem
  language: string
}

const AdjustmentTargetDisplay: React.FC<AdjustmentTargetDisplayProps> = ({
  item,
  language,
}) => {
  // const isNotApplicable = item.item_status === 'not_applicable'
  const isNotSubmitted = item.item_status === 'not_submitted'
  // const showNA = item.is_not_screening || isNotApplicable

  if (isNotSubmitted) {
    return (
      <XCircleIcon className="ui-w-5 ui-h-5 ui-text-danger-500 ui-mx-auto" />
    )
  }
  // if (showNA) {
  //   return (
  //     <span
  //       className={clsx(
  //         'ui-text-sm',
  //         'ui-flex ui-items-center ui-justify-center ui-w-9 ui-h-6 ui-rounded-full ui-bg-neutral-100 ui-text-neutral-400 ui-text-xs ui-font-medium ui-mx-auto'
  //       )}
  //     >
  //       N/A
  //     </span>
  //   )
  // }
  return (
    <span className="ui-text-sm">
      {numberFormatter(item.adjustment_target ?? 0, language)}
    </span>
  )
}

const AddTargetDrawer: React.FC<AddTargetDrawerProps> = ({
  open,
  onClose,
  entityId,
  programPlanYear,
  // regencyId,
  onSaved,
}) => {
  const { t, i18n } = useTranslation(['bmhpApproval'])

  // ── Column definitions ─────────────────────────────────────────────────────
  const HEADERS = useMemo<BmhpApprovalTableColumn[]>(
    () => [
      {
        key: 'no',
        header: t('bmhpApproval:target_adjustment.add_target_drawer.col_no'),
        width: 48,
        headerClassName: 'ui-text-center',
      },
      {
        key: 'target_group',
        header: t(
          'bmhpApproval:target_adjustment.add_target_drawer.col_target_group'
        ),
      },
      {
        key: 'adjustment',
        header: t(
          'bmhpApproval:target_adjustment.add_target_drawer.col_target_adjustment'
        ),
        width: 300,
        headerClassName: 'ui-text-center',
      },
      {
        key: 'target',
        header: t(
          'bmhpApproval:target_adjustment.add_target_drawer.col_target'
        ),
        width: 300,
        headerClassName: 'ui-text-center',
      },
    ],
    [t]
  )

  const LEAF_COLUMNS = useMemo<BmhpApprovalTableColumn[]>(
    () => [
      {
        key: 'no',
        header: t('bmhpApproval:target_adjustment.add_target_drawer.col_no'),
      },
      {
        key: 'examination',
        header: t(
          'bmhpApproval:target_adjustment.add_target_drawer.col_examination'
        ),
      },
      {
        key: 'target_group',
        header: t(
          'bmhpApproval:target_adjustment.add_target_drawer.col_target_group'
        ),
      },
      {
        key: 'adjustment',
        header: t(
          'bmhpApproval:target_adjustment.add_target_drawer.col_target_adjustment'
        ),
      },
      {
        key: 'target',
        header: t(
          'bmhpApproval:target_adjustment.add_target_drawer.col_target'
        ),
      },
    ],
    [t]
  )
  // ── Fetch ──────────────────────────────────────────────────────────────────
  const { data, isLoading } = useGetTargetInput({
    params: {
      program_plan_id: programPlanYear,
      // regency_id: regencyId,
      entity_id: entityId ?? 0,
    },
    enabled: open,
  })

  // ── Local editable state ───────────────────────────────────────────────────
  const [localItems, setLocalItems] = useState<TargetInputItem[]>([])
  const originalItemsRef = React.useRef<TargetInputItem[]>([])

  useEffect(() => {
    if (data?.target_input) {
      setLocalItems(structuredClone(data.target_input))
      originalItemsRef.current = structuredClone(data.target_input)
    }
  }, [data])

  const handleTargetChange = (
    targetId: number,
    examinationId: number,
    value: number
  ) => {
    setLocalItems((prev) =>
      prev.map((item) =>
        item.target_id === targetId && item.examination_id === examinationId
          ? { ...item, target: value }
          : item
      )
    )
  }

  // ── Save ───────────────────────────────────────────────────────────────────
  const { saveTargetInput, isSaving } = useUpdateTargetInput()

  const handleSave = () => {
    if (!data) return

    // Only send items where target value has changed
    const changedItems = localItems
      // .filter(
      //   (item) =>
      //     !item.is_not_screening && item.item_status !== 'not_applicable'
      // )
      .filter((localItem) => {
        // Find original item from stored reference
        const originalItem = originalItemsRef.current.find(
          (orig) =>
            orig.target_id === localItem.target_id &&
            orig.examination_id === localItem.examination_id
        )
        const hasChanged =
          originalItem && originalItem.target !== localItem.target
        return hasChanged
      })
      .map((item) => ({
        id: item.id,
        examination_id: item.examination_id,
        target_id: item.target_id,
        target: item.target,
      }))

    // If no changes, just close drawer
    if (changedItems.length === 0) {
      console.log('No changes detected, closing drawer')
      onClose()
      return
    }

    // Send only changed items
    console.log('Sending changed items...')
    saveTargetInput(
      {
        program_plan_id: data.program_plan.id,
        // regency_id: regencyId,
        entity_id: entityId ?? 0,
        target_input: changedItems,
      },
      {
        onSuccess: () => {
          onSaved()
          onClose()
        },
      }
    )
  }

  // ── Info bar ───────────────────────────────────────────────────────────────
  const infoItems = [
    {
      label: t(
        'bmhpApproval:target_adjustment.add_target_drawer.label_province'
      ),
      value: data?.province?.name,
    },
    {
      label: t(
        'bmhpApproval:target_adjustment.add_target_drawer.label_regency'
      ),
      value: data?.regency?.name,
    },
    {
      label: t(
        'bmhpApproval:target_adjustment.add_target_drawer.label_puskesmas'
      ),
      value: data?.entity?.name,
    },
    {
      label: t(
        'bmhpApproval:target_adjustment.add_target_drawer.label_program_plan'
      ),
      value: data?.program_plan?.year,
    },
  ]

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
        title={t('bmhpApproval:target_adjustment.add_target_drawer.title')}
      >
        <button
          type="button"
          onClick={onClose}
          className="ui-absolute ui-right-2 ui-top-2 ui-rounded ui-p-0.5 ui-text-gray-800 hover:ui-bg-gray-200 active:ui-bg-gray-300 focus:ui-outline-none"
          aria-label="Close"
        >
          <XMarkIcon className="ui-h-5 ui-w-5" />
        </button>
      </DrawerHeader>

      <DrawerContent className="ui-overflow-y-auto ui-flex-1 ui-p-5">
        {/* Entity info bar */}
        <div className="ui-grid ui-grid-cols-4 ui-gap-4 ui-mb-6 ui-py-4">
          {infoItems.map(({ label, value }) => (
            <div key={label}>
              <p className="ui-text-xs ui-text-neutral-500">{label}</p>
              <p className="ui-text-sm ui-font-medium">{value ?? '—'}</p>
            </div>
          ))}
        </div>

        {/* Input table */}
        <BmhpApprovalTable
          withBorder
          id="addTargetTable"
          headers={HEADERS}
          leafColumns={LEAF_COLUMNS}
          data={localItems}
          isLoading={isLoading}
          renderRow={(item, idx) => {
            return (
              <>
                <BmhpApprovalTd className="ui-text-center ui-text-neutral-500">
                  {idx + 1}
                </BmhpApprovalTd>
                <BmhpApprovalTd>
                  <div className="ui-flex-col flex">
                    <span className="ui-text-sm ui-font-semibold">
                      {item.target_group_name}
                    </span>
                    <span className="ui-text-sm ui-text-gray-400">
                      {item.examination_name}
                    </span>
                  </div>
                </BmhpApprovalTd>
                <BmhpApprovalTd className="ui-text-center">
                  <AdjustmentTargetDisplay
                    item={item}
                    language={i18n.language}
                  />
                </BmhpApprovalTd>
                <BmhpApprovalTd className="ui-text-center">
                  <InputNumber
                    value={item.target ?? 0}
                    onChange={(val) =>
                      handleTargetChange(
                        item.target_id,
                        item.examination_id,
                        Number(val ?? 0)
                      )
                    }
                    minValue={0}
                    className="ui-w-full ui-text-center"
                  />
                </BmhpApprovalTd>
              </>
            )
          }}
        />
      </DrawerContent>

      <DrawerFooter className="ui-border-t ui-border-neutral-200 ui-flex ui-justify-end ui-gap-3">
        <Button
          variant="solid"
          onClick={handleSave}
          disabled={isSaving || isLoading}
          className="ui-w-52"
        >
          {isSaving
            ? t('bmhpApproval:target_adjustment.add_target_drawer.btn_saving')
            : t('bmhpApproval:target_adjustment.add_target_drawer.btn_save')}
        </Button>
      </DrawerFooter>
    </Drawer>
  )
}

export default AddTargetDrawer
