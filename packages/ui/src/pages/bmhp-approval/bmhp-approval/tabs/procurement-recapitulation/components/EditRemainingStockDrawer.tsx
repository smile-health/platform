'use client'

import React, { useEffect, useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/solid'
import { Button } from '#components/button'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from '#components/drawer'
import { InputNumber } from '#components/input-number'
import { useTranslation } from 'react-i18next'

import BmhpApprovalTable, {
  BmhpApprovalTableColumn,
  BmhpApprovalTd,
} from '../../../components/BmhpApprovalTable'
import {
  useProcurementRecapitulation,
  useSaveRemainingStock,
} from '../hooks/useProcurementRecapitulation'
import { ProcurementRecapitulationItem } from '../libs/procurement-recapitulation.type'

interface EditRemainingStockDrawerProps {
  open: boolean
  onClose: () => void
  programPlanId: number
  tanggalSisaStok?: string
  onSaved: () => void
  provinceName?: string
  cityName?: string
  programPlanYear?: number
}

const EditRemainingStockDrawer: React.FC<EditRemainingStockDrawerProps> = ({
  open,
  onClose,
  programPlanId,
  tanggalSisaStok,
  onSaved,
  provinceName,
  cityName,
  programPlanYear,
}) => {
  const { t } = useTranslation(['bmhpApproval'])

  const COLUMNS: BmhpApprovalTableColumn[] = [
    {
      key: 'no',
      header: t('bmhpApproval:procurement_recapitulation.drawer.col_no'),
      width: 48,
      headerClassName: 'ui-text-center',
    },
    {
      key: 'name',
      header: t('bmhpApproval:procurement_recapitulation.drawer.col_material'),
    },
    {
      key: 'unit',
      header: t('bmhpApproval:procurement_recapitulation.drawer.col_unit'),
      width: 120,
      headerClassName: 'ui-text-center',
    },
    {
      key: 'total_needs',
      header: t(
        'bmhpApproval:procurement_recapitulation.drawer.col_total_needs'
      ),
      width: 160,
      headerClassName: 'ui-text-center',
    },
    {
      key: 'remaining_stock',
      header: t(
        'bmhpApproval:procurement_recapitulation.drawer.col_remaining_stock'
      ),
      width: 200,
      headerClassName: 'ui-text-center',
    },
  ]

  // ── Fetch all items without pagination (enabled only when drawer is open) ────
  const { data, isLoading } = useProcurementRecapitulation({
    params: { program_plan_id: programPlanId, remaining_stock_date: tanggalSisaStok },
    enabled: open && !!programPlanId,
  })

  // ── Local editable state ───────────────────────────────────────────────────
  const [localItems, setLocalItems] = useState<ProcurementRecapitulationItem[]>(
    []
  )
  const [originalItems, setOriginalItems] = useState<
    ProcurementRecapitulationItem[]
  >([])

  useEffect(() => {
    if (data?.data) {
      const cloned = structuredClone(data.data)
      setLocalItems(cloned)
      setOriginalItems(cloned)
    }
  }, [data])

  const handleStockChange = (index: number, value: number) => {
    setLocalItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, remaining_stock: value }
          : item
      )
    )
  }

  // ── Save ───────────────────────────────────────────────────────────────────
  const { save, isSaving } = useSaveRemainingStock()

  const hasChanges = localItems.some((local, index) => {
    const original = originalItems[index]
    return (
      original !== undefined &&
      local.remaining_stock !== original.remaining_stock
    )
  })

  const handleSave = () => {
    // Kirim hanya item yang berubah (changedItems) untuk optimasi
    const changedItems = localItems
      .map((item, index) => ({
        item,
        original: originalItems[index],
      }))
      .filter(
        ({ item, original }) => item.remaining_stock !== original.remaining_stock
      )
      .map(({ item }) => ({
        material_id: item.material_id,
        ...(item.variant_id != null ? { variant_id: item.variant_id } : {}),
        remaining_stock: item.remaining_stock,
      }))

    save(
      {
        program_plan_id: programPlanId,
        items: changedItems,
      },
      {
        onSuccess: () => {
          onSaved()
          onClose()
        },
      }
    )
  }

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
        title={t('bmhpApproval:procurement_recapitulation.drawer.title')}
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
        {/* Province / City / Program Plan info */}
        <div className="ui-grid ui-grid-cols-4 ui-gap-4 ui-mb-6 ui-py-4">
          <div>
            <p className="ui-text-xs ui-text-neutral-500">
              {t('bmhpApproval:procurement_recapitulation.drawer.label_province')}
            </p>
            <p className="ui-text-sm ui-font-medium">
              {provinceName ?? '—'}
            </p>
          </div>
          <div>
            <p className="ui-text-xs ui-text-neutral-500">
              {t('bmhpApproval:procurement_recapitulation.drawer.label_city')}
            </p>
            <p className="ui-text-sm ui-font-medium">
              {cityName ?? '—'}
            </p>
          </div>
          <div>
            <p className="ui-text-xs ui-text-neutral-500">
              {t('bmhpApproval:procurement_recapitulation.drawer.label_program_plan')}
            </p>
            <p className="ui-text-sm ui-font-medium">
              {programPlanYear ?? '—'}
            </p>
          </div>
        </div>
        <BmhpApprovalTable
          withBorder
          id="editRemainingStockTable"
          headers={COLUMNS}
          leafColumns={COLUMNS}
          data={localItems}
          isLoading={isLoading}
          renderRow={(item, idx) => (
            <>
              <BmhpApprovalTd className="ui-text-center ui-text-neutral-500">
                {idx + 1}
              </BmhpApprovalTd>
              <BmhpApprovalTd>
                <span className="ui-text-sm ui-font-medium">{item.name}</span>
              </BmhpApprovalTd>
              <BmhpApprovalTd className="ui-text-center ui-text-neutral-500">
                {item.unit}
              </BmhpApprovalTd>
              <BmhpApprovalTd className="ui-text-center ui-text-neutral-500">
                {item.total_needs.toLocaleString()}
              </BmhpApprovalTd>
              <BmhpApprovalTd className="ui-text-center">
                <InputNumber
                  value={item.remaining_stock}
                  onChange={(val) =>
                    handleStockChange(idx, Number(val ?? 0))
                  }
                  minValue={0}
                  className="ui-w-full ui-text-center"
                />
              </BmhpApprovalTd>
            </>
          )}
        />
      </DrawerContent>

      <DrawerFooter className="ui-border-t ui-border-neutral-200 ui-flex ui-justify-end ui-gap-3">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isSaving}
          className="ui-w-32"
        >
          {t('bmhpApproval:procurement_recapitulation.drawer.btn_cancel')}
        </Button>
        <Button
          variant="solid"
          onClick={handleSave}
          disabled={isSaving || !hasChanges}
          className="ui-w-52"
        >
          {isSaving
            ? t('bmhpApproval:procurement_recapitulation.drawer.btn_saving')
            : t('bmhpApproval:procurement_recapitulation.drawer.btn_save')}
        </Button>
      </DrawerFooter>
    </Drawer>
  )
}

export default EditRemainingStockDrawer
