import { ColumnDef } from '@tanstack/react-table'
import { Button } from '#components/button'
import { Checkbox } from '#components/checkbox'
import { parseDateTime } from '#utils/date'
import { numberFormatter } from '#utils/formatter'
import { TFunction } from 'i18next'

import { transactionPatientIdType } from '../transaction-return-from-facility.constant'
import {
  TPatient,
  TTransactionReturnFacilityConsumptionData,
} from '../transaction-return-from-facility.type'
import TransactionReturnFromFacilityTitleBlock from './TransactionReturnFromFacilityTitleBlock'

type CreateColumnReturnFromFacility = {
  t: TFunction<['transactionCreate', 'common']>
  no?: number
  language: string
  items?: TTransactionReturnFacilityConsumptionData[]
  isPatient?: boolean
  isOpenVial?: boolean
  handleRemoveData?: () => void
}

export const consumptionColumn = ({
  t,
  no,
  language,
  items,
  isPatient,
}: CreateColumnReturnFromFacility): ColumnDef<TTransactionReturnFacilityConsumptionData>[] => {
  const isSelected = (data: TTransactionReturnFacilityConsumptionData) =>
    items?.some((item) => Number(item.id) === Number(data.id)) ?? false
  const getIsSelected = (data: TTransactionReturnFacilityConsumptionData) =>
    isSelected(data) ? 'ui-bg-sky-100' : ''

  const consumptionPatientColumn = {
    header: t(
      'transactionCreate:transaction_return_from_facility.input_table.column.patient_info'
    ),
    accessorKey: 'patients',
    cell: ({
      row: {
        original: { patients, protocol },
      },
    }) =>
      patients && patients?.length > 0 ? patients?.map((patient: TPatient) => (
        <div className="ui-mb-4" key={patient?.identity_number}>
          <TransactionReturnFromFacilityTitleBlock
            arrText={[
              {
                label: `${t(
                  'transactionCreate:transaction_return_from_facility.patient_part.patient_id'
                )}: ${patient?.identity_number ?? '-'}`,
                className: 'ui-text-sm ui-font-normal ui-text-dark-teal',
              },
              ...protocol ? [
                {
                  label: `${t(
                    'transactionCreate:transaction_return_from_facility.patient_part.vaccination_sequence'
                  )}: ${patient?.vaccine_sequence?.title ?? '-'}`,
                  className: 'ui-text-sm ui-font-normal ui-text-dark-teal',
                },
              ] : [],
            ]}
          />
        </div>
      )) : '-',
    meta: {
      cellClassName: ({ original }) => getIsSelected(original),
    },
    minSize: 250,
  } as ColumnDef<TTransactionReturnFacilityConsumptionData>

  const consumptionFinalColumns: ColumnDef<TTransactionReturnFacilityConsumptionData>[] =
    [
      {
        header: 'SI.No',
        accessorKey: 'no',
        cell: ({ row: { index } }) => index + 1 + Number(no),
        size: 50,
        meta: {
          cellClassName: ({ original }) =>
            `ui-text-dark-teal ui-font-normal ${getIsSelected(original)}`,
        },
      },
      {
        header: t(
          'transactionCreate:transaction_return_from_facility.input_table.column.material'
        ),
        accessorKey: 'material.name',
        meta: {
          cellClassName: ({ original }) =>
            `ui-text-dark-teal ui-font-normal ${getIsSelected(original)}`,
        },
        cell: ({ getValue }) => getValue() ?? '-',
        minSize: 200,
      },
      {
        header: t(
          'transactionCreate:transaction_return_from_facility.transaction_date'
        ),
        accessorKey: 'created_at',
        meta: {
          cellClassName: ({ original }) =>
            `ui-text-dark-teal ui-font-normal ${getIsSelected(original)}`,
        },
        cell: ({
          row: {
            original: { created_at },
          },
        }) =>
          parseDateTime(
            created_at ?? '',
            'DD MMM YYYY HH:mm',
            language
          ).toUpperCase(),
        minSize: 200,
      },
      {
        header: t(
          'transactionCreate:transaction_return_from_facility.input_table.column.activity'
        ),
        accessorKey: 'activity.name',
        cell: ({
          row: {
            original: { activity, stock },
          },
        }) => (
          <TransactionReturnFromFacilityTitleBlock
            arrText={[
              {
                label: activity?.name ?? '-',
                className: 'ui-text-sm ui-font-bold ui-text-dark-teal',
              },
              {
                label: `${t('transactionCreate:transaction_return_from_facility.taken_from')}: ${stock?.activity?.name ?? '-'}`,
                className: 'ui-text-sm ui-font-normal ui-text-dark-teal',
              },
            ]}
          />
        ),
        meta: {
          cellClassName: ({ original }) => getIsSelected(original),
        },
        minSize: 200,
      },
      {
        header: t(
          'transactionCreate:transaction_return_from_facility.input_table.detail_column.batch_info'
        ),
        accessorKey: 'stock.name',
        cell: ({
          row: {
            original: { stock },
          },
        }) => (
          <TransactionReturnFromFacilityTitleBlock
            arrText={[
              {
                label: stock?.batch?.code ?? '-',
                className: 'ui-text-sm ui-font-bold ui-text-dark-teal',
              },
              {
                label: `${t(
                  'transactionCreate:transaction_return_from_facility.input_table.detail_column.manufacturer'
                )}: ${stock?.batch?.manufacture?.name ?? '-'}`,
                className: 'ui-text-sm ui-font-normal ui-text-dark-teal',
              },
              {
                label: `${t(
                  'transactionCreate:transaction_return_from_facility.input_table.detail_column.expired_date'
                )}: ${parseDateTime(
                  stock?.batch?.expired_date ?? '',
                  'DD MMM YYYY',
                  language
                )?.toUpperCase()}`,
                className: 'ui-text-sm ui-font-normal ui-text-dark-teal',
              },
            ]}
          />
        ),
        meta: {
          cellClassName: ({ original }) => getIsSelected(original),
        },
        minSize: 250,
      },
      {
        header: t(
          'transactionCreate:transaction_return_from_facility.input_table.column.quantity_info'
        ),
        accessorKey: 'change_qty',
        meta: {
          cellClassName: ({ original }) =>
            `ui-text-dark-teal ${getIsSelected(original)}`,
        },
        cell: ({
          row: {
            original: { change_qty, max_return },
          },
        }) => (
          <TransactionReturnFromFacilityTitleBlock
            arrText={[
              {
                label: `${t('transactionCreate:transaction_return_from_facility.input_table.column.max_return_qty')}: ${numberFormatter(
                  max_return ?? 0,
                  language
                )}`,
                className: 'ui-text-sm ui-font-bold ui-text-dark-teal',
              },
              {
                label: `${t('transactionCreate:transaction_return_from_facility.input_table.column.max_consumption_qty')}: ${numberFormatter(
                  Math.abs(change_qty ?? 0),
                  language
                )}`,
                className: 'ui-text-sm ui-font-normal ui-text-dark-teal',
              },
            ]}
          />
        ),
        minSize: 100,
      },
      {
        header: t(
          'transactionCreate:cancel_transaction_discard.table.discard.column.selection'
        ),
        accessorKey: 'selection',
        meta: {
          cellClassName: ({ original }) =>
            `ui-text-dark-teal ${getIsSelected(original)}`,
        },
        cell: ({ row: { original } }) => (
          <div className="text-center">
            <Checkbox checked={isSelected(original)} />
          </div>
        ),
        size: 80,
      },
    ]

  if (isPatient) {
    const secondToLastArrayIndex = consumptionFinalColumns?.length - 1
    consumptionFinalColumns.splice(
      secondToLastArrayIndex,
      0,
      consumptionPatientColumn
    )
  }

  return consumptionFinalColumns
}

export const detailColumn = ({
  t,
  language,
  isPatient,
  isOpenVial,
  handleRemoveData,
}: CreateColumnReturnFromFacility): ColumnDef<TTransactionReturnFacilityConsumptionData>[] => {
  const detailPatientColumn = {
    header: t(
      'transactionCreate:transaction_return_from_facility.input_table.column.patient_info'
    ),
    accessorKey: 'patients',
    cell: ({
      row: {
        original: { patients },
      },
    }) =>
      patients?.map((patient: TPatient) => (
        <div className="ui-mb-4" key={patient?.identity_number}>
          <TransactionReturnFromFacilityTitleBlock
            arrText={[
              {
                label: `${t(
                  'transactionCreate:transaction_return_from_facility.patient_part.identity_type'
                )}: `,
                label2: transactionPatientIdType(patient?.identity_type, t),
                className: 'ui-text-sm ui-font-normal ui-text-dark-teal',
                className2: 'ui-text-sm ui-font-bold ui-text-dark-teal',
              },
              {
                label: `${t(
                  'transactionCreate:transaction_return_from_facility.patient_part.patient_id'
                )}: `,
                label2: patient?.identity_number ?? '-',
                className: 'ui-text-sm ui-font-normal ui-text-dark-teal',
                className2: 'ui-text-sm ui-font-bold ui-text-dark-teal',
              },
              {
                label: `${t(
                  'transactionCreate:transaction_return_from_facility.patient_part.phone_number'
                )}: `,
                label2: patient?.phone_number ?? '-',
                className: 'ui-text-sm ui-font-normal ui-text-dark-teal',
                className2: 'ui-text-sm ui-font-bold ui-text-dark-teal',
              },
              {
                label: `${t(
                  'transactionCreate:transaction_return_from_facility.patient_part.vaccination_sequence'
                )}: `,
                label2: patient?.vaccine_sequence?.title ?? '-',
                className: 'ui-text-sm ui-font-normal ui-text-dark-teal',
                className2: 'ui-text-sm ui-font-bold ui-text-dark-teal',
              },
            ]}
          />
        </div>
      )),
    minSize: 250,
  } as ColumnDef<TTransactionReturnFacilityConsumptionData>

  const detailVaccinationColumn = {
    header: t(
      'transactionCreate:transaction_return_from_facility.patient_part.vaccination_info'
    ),
    accessorKey: 'patients',
    cell: ({
      row: {
        original: { patients },
      },
    }) =>
      patients?.map((patient: TPatient) => (
        <div className="ui-mb-4" key={patient?.identity_number}>
          <TransactionReturnFromFacilityTitleBlock
            arrText={[
              {
                label: `${t(
                  'transactionCreate:transaction_return_from_facility.patient_part.type'
                )}: `,
                label2: patient?.vaccine_type?.title ?? '-',
                className: 'ui-text-sm ui-font-normal ui-text-dark-teal',
                className2: 'ui-text-sm ui-font-bold ui-text-dark-teal',
              },
              {
                label: `${t(
                  'transactionCreate:transaction_return_from_facility.patient_part.method'
                )}: `,
                label2: patient?.vaccine_method?.title ?? '-',
                className: 'ui-text-sm ui-font-normal ui-text-dark-teal',
                className2: 'ui-text-sm ui-font-bold ui-text-dark-teal',
              },
            ]}
          />
        </div>
      )),
    minSize: 250,
  } as ColumnDef<TTransactionReturnFacilityConsumptionData>

  const openVialColumn = {
    header: t(
      'transactionCreate:transaction_return_from_facility.input_table.column.open_vial'
    ),
    accessorKey: 'open_vial_qty',
    cell: ({
      row: {
        original: { open_vial_qty },
      },
    }) => numberFormatter(open_vial_qty ?? 0, language),
    minSize: 250,
  } as ColumnDef<TTransactionReturnFacilityConsumptionData>

  const detailFinalColumns: ColumnDef<TTransactionReturnFacilityConsumptionData>[] =
    [
      {
        header: t(
          'transactionCreate:transaction_return_from_facility.transaction_date'
        ),
        accessorKey: 'created_at',
        cell: ({
          row: {
            original: { created_at },
          },
        }) =>
          parseDateTime(
            created_at ?? '',
            'DD MMM YYYY HH:mm',
            language
          ).toUpperCase(),
        minSize: 200,
      },
      {
        header: t(
          'transactionCreate:transaction_return_from_facility.taken_from_activity'
        ),
        accessorKey: 'stock.activity.name',
        cell: ({ getValue }) => getValue(),
        minSize: 200,
      },
      {
        header: isOpenVial
          ? t(
            'transactionCreate:transaction_return_from_facility.input_table.column.close_vial'
          )
          : t(
            'transactionCreate:transaction_return_from_facility.input_table.column.quantity'
          ),
        accessorKey: 'return_qty',
        cell: ({
          row: {
            original: { return_qty },
          },
        }) => numberFormatter(return_qty ?? 0, language),
        minSize: 100,
      },
      {
        header: t('common:action'),
        accessorKey: 'selection',
        cell: () => (
          <Button
            variant="subtle"
            color="danger"
            className="ui-p-0 ui-w-fit"
            onClick={handleRemoveData}
          >
            {t('common:remove')}
          </Button>
        ),
        size: 80,
      },
    ]

  if (isOpenVial) {
    const secondToLastArrayIndex = detailFinalColumns?.length - 2
    detailFinalColumns.splice(secondToLastArrayIndex, 0, openVialColumn)
  }

  if (isPatient) {
    const secondToLastArrayIndex = detailFinalColumns?.length - 2
    detailFinalColumns.splice(secondToLastArrayIndex, 0, detailPatientColumn)
    detailFinalColumns.splice(
      secondToLastArrayIndex,
      0,
      detailVaccinationColumn
    )
  }

  return detailFinalColumns
}
