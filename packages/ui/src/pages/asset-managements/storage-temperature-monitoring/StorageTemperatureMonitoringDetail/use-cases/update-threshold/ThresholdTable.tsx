import React, { ReactNode, useCallback, useMemo, useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { Button } from '#components/button'
import { DataTable } from '#components/data-table'
import { Radio } from '#components/radio'
import cx from '#lib/cx'
import { TCapacity } from '#services/asset-model'
import { TemperatureThreshold } from '#services/asset-type'
import { numberFormatter } from '#utils/formatter'
import { useTranslation } from 'react-i18next'

import { ThresholdModal } from './ThresholdModal'

const renderRadioCell = (
  row: TemperatureThreshold,
  isEditing: boolean,
  onRadioChange: (item: TemperatureThreshold) => void
) => {
  return (
    <Radio
      className="!ui-bg-gray-100"
      checked={Boolean(row?.is_active ?? 0)}
      disabled={!isEditing}
      value={(row?.is_active ?? 0) ? 1 : 0}
      onChange={() => {
        onRadioChange(row)
      }}
    />
  )
}

type ThresholdTableProps = {
  data: TemperatureThreshold[] | TCapacity[]
  tableHead: string[]
  type: 'temperature_threshold' | 'capacity'
  buttonLabels?: string[]
  onUpdateActiveThreshold?: (item: { temperature_threshold_id: number }) => void
  isUpdatingActiveThreshold?: boolean
  otherInformation?: string | ReactNode
  isWarehouse?: boolean
}

const ThresholdTable: React.FC<ThresholdTableProps> = ({
  data,
  tableHead,
  buttonLabels,
  type,
  onUpdateActiveThreshold,
  isUpdatingActiveThreshold,
  otherInformation,
  isWarehouse,
}) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'storageTemperatureMonitoringDetail'])

  const [thresholds, setThresholds] = useState<TemperatureThreshold[]>(
    data as TemperatureThreshold[]
  )
  const [isEditing, setIsEditing] = useState(false)
  const [confirmationModal, setConfirmationModal] = useState(false)

  const classRow = useCallback(
    (item: TemperatureThreshold) => {
      const isActive = Boolean(item?.is_active ?? 0)
      if (isEditing || isActive) {
        return 'ui-bg-white'
      }
      if (!isEditing) {
        return 'ui-bg-neutral-100'
      }
      return ''
    },
    [isEditing]
  )

  const handleThresholdActiveStyling = useCallback(
    (item: TemperatureThreshold, isActive?: boolean) => {
      return cx('ui-bg-white', { [classRow(item)]: isActive })
    },
    []
  )

  const handleSelectThreshold = useCallback(
    (item: TemperatureThreshold) => {
      setThresholds((prev) => {
        const selectedId = item?.id
        const selectedActive =
          prev.find((t) => t?.id === selectedId)?.is_active === 1

        if (selectedActive) {
          return prev.map((t) => ({ ...t, is_active: 0 }))
        }

        return prev.map((t) => ({
          ...t,
          is_active: t?.id === selectedId ? 1 : 0,
        }))
      })
    },
    [thresholds]
  )

  const columns: ColumnDef<TCapacity>[] = useMemo(() => {
    const metrics = '°C'
    return [
      {
        accessorKey: ' ',
        header: ' ',
        meta: {
          cellClassName: ({ original }) =>
            handleThresholdActiveStyling(
              original as TemperatureThreshold,
              Boolean(original?.is_active)
            ),
        },
        cell: ({ row }) => {
          return renderRadioCell(
            row.original as TemperatureThreshold,
            isEditing,
            handleSelectThreshold
          )
        },
      },
      {
        accessorKey: tableHead?.[0] ?? '',
        header: tableHead?.[0] ?? '',
        meta: {
          cellClassName: ({ original }) =>
            handleThresholdActiveStyling(original as TemperatureThreshold),
        },
        cell: ({ row }) => {
          return `${
            numberFormatter(row.original.min_temperature, language) ?? '-'
          } ${metrics}`
        },
      },
      {
        accessorKey: tableHead?.[1] ?? '',
        header: tableHead?.[1] ?? '',
        meta: {
          cellClassName: ({ original }) =>
            handleThresholdActiveStyling(original as TemperatureThreshold),
        },
        cell: ({ row }) => {
          return `${
            numberFormatter(row.original.max_temperature, language) ?? '-'
          } ${metrics}`
        },
      },
    ]
  }, [type, isEditing, thresholds])

  const handleUpdateActiveThreshold = (data: TemperatureThreshold[]) => {
    const payload = data?.find(
      (t) => t?.is_active === 1
    ) as TemperatureThreshold

    onUpdateActiveThreshold?.({
      temperature_threshold_id: payload?.id ?? 0,
    })

    setTimeout(() => {
      setIsEditing(!isEditing)
      setConfirmationModal(false)
    }, 500)
  }

  const handleCancelUpdateActiveThreshold = () => {
    setIsEditing(!isEditing)
    setThresholds(data as TemperatureThreshold[])
  }

  return (
    <>
      <ThresholdModal
        open={confirmationModal}
        setOpen={setConfirmationModal}
        onConfirm={() => handleUpdateActiveThreshold(thresholds)}
        isUpdating={isUpdatingActiveThreshold}
      />
      <div className="ui-border-none ui-rounded-sm ui-border ui-bg-white ui-grid ui-grid-cols-4 ui-w-full">
        <div className="ui-table-header-group !ui-w-100">
          <div className="ui-bg-gray-100">
            <DataTable columns={columns} data={thresholds} />
          </div>
          <div className="ui-mt-2">{otherInformation}</div>
          {!isWarehouse && (
            <div className="!ui-w-full ui-mt-2">
              <div className="ui-w-full">
                {isEditing ? (
                  <div className="ui-grid ui-grid-cols-2 ui-gap-2 ui-w-full">
                    <Button
                      className="!ui-w-full"
                      type="button"
                      variant="outline"
                      disabled={isUpdatingActiveThreshold}
                      onClick={() => handleCancelUpdateActiveThreshold()}
                    >
                      {buttonLabels?.[1] ?? t('common:cancel')}
                    </Button>
                    <Button
                      className="!ui-w-full"
                      type="button"
                      variant="solid"
                      loading={isUpdatingActiveThreshold}
                      onClick={() => setConfirmationModal(true)}
                    >
                      {buttonLabels?.[2] ?? t('common:save')}
                    </Button>
                  </div>
                ) : (
                  <>
                    {thresholds.length > 1 && (
                      <Button
                        className="!ui-w-full"
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditing(!isEditing)
                        }}
                      >
                        {buttonLabels?.[0] ?? t('common:edit')}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default ThresholdTable
