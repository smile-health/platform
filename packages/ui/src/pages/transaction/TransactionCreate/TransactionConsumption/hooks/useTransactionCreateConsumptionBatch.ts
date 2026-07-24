import { yupResolver } from '@hookform/resolvers/yup'
import { DetailStock } from '#types/stock'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useModalWarningStore } from '../../store/modal-warning.store'
import { formSchemaBatch } from '../schema/TransactionCreateConsumptionSchemaForm'
import {
  CreateTransactionBatch,
  CreateTransactionChild,
  CreateTransactionConsumptionItems,
} from '../transaction-consumption.type'

export const TransactionCreateConsumptionBatch = () => {
  const { t } = useTranslation([
    'common',
    'transactionCreateConsumption',
    'transactionCreate',
  ])

  const methods = useForm<CreateTransactionChild>({
    resolver: yupResolver(formSchemaBatch(t)),
    mode: 'onChange',
    defaultValues: { batches: [] },
  })

  type NewBatch = {
    itemParent: CreateTransactionConsumptionItems
    itemChild: CreateTransactionBatch[] | null | undefined
    otherBatch: DetailStock | undefined
  }

  const newBatch = ({ itemParent, otherBatch, itemChild }: NewBatch) => {
    const batches: CreateTransactionBatch[] | undefined =
      otherBatch?.stocks?.map((itm) => {
        const batchTemp: CreateTransactionBatch = {
          batch_id: itm.id ?? null,
          activity_id: itm?.activity.id ?? null,
          activity_name: itm?.activity.name ?? null,
          change_qty: null,
          open_vial: null,
          close_vial: null,
          code: itm?.batch?.code ?? null,
          production_date: itm?.batch?.production_date ?? null,
          expired_date: itm?.batch?.expired_date ?? null,
          manufacturer: itm.batch?.manufacture?.id
            ? {
              value: itm?.batch?.manufacture.id,
              label: itm?.batch?.manufacture?.name ?? '',
            }
            : null,
          available_qty: itm?.available_qty ?? 0,
          allocated_qty: itm?.allocated_qty ?? 0,
          open_vial_qty: itm?.open_vial_qty ?? 0,
          on_hand_stock: itm?.qty ?? 0,
          min: itm?.min ?? 0,
          max: itm?.max ?? 0,
          temperature_sensitive: itemParent.temperature_sensitive ?? null,
          pieces_per_unit: itemParent.pieces_per_unit ?? null,
          status_material: null,
          managed_in_batch: itemParent.managed_in_batch ?? null,
          vaccine_max_qty: null,
          vaccine_min_qty: null,
          vaccine_method: null,
          vaccine_type: null,
          patients: null,
          is_vaccine: itemParent.is_vaccine,
          is_need_sequence: itemParent.is_need_sequence,
          is_open_vial: itemParent.is_open_vial,
          protocol_id: itemParent.protocol_id,
        }
        return batchTemp
      })
    const currentBatch =
      itemChild && itemChild?.length > 0 ? [...itemChild] : []
    const inComingBatches: CreateTransactionBatch[] =
      batches && batches?.length > 0 ? currentBatch.concat(batches) : []
    return inComingBatches
  }

  type ResetBatch = {
    currentBatch: CreateTransactionBatch[] | undefined | null
  }

  const resetBatch = ({ currentBatch }: ResetBatch) => {
    const batches: CreateTransactionBatch[] | undefined = currentBatch?.map(
      (itm) => {
        const batchTemp: CreateTransactionBatch = {
          ...itm,
          change_qty: null,
          status_material: null,
          vaccine_max_qty: null,
          vaccine_min_qty: null,
          vaccine_method: null,
          vaccine_type: null,
          patients: null,
        }
        return batchTemp
      }
    )

    return batches
  }

  const columns = (
    managed_in_batch: boolean = true,
    is_vaccine: boolean = false,
    is_need_sequence: boolean = false,
    is_open_vial: boolean = false
  ) => [
      {
        header: 'SI.No',
        id: 'no',
        size: 64,
      },
      {
        header: t('transactionCreateConsumption:table.column.batch_info', {
          type: managed_in_batch ? 'Batch' : 'Detail',
        }),
        id: 'batch_info',
        size: 240
      },
      {
        header: t('transactionCreateConsumption:table.column.stock_info'),
        id: 'stock_info',
        size: 170
      },
      {
        header: t('transactionCreateConsumption:table.column.activity'),
        id: 'activity',
        size: 150
      },
      ...((is_vaccine && is_need_sequence) || is_vaccine
        ? [
          {
            header: t(
              'transactionCreateConsumption:table.column.transactions'
            ),
            id: 'transactions',
          },
        ]
        : []),
      ...(is_open_vial
        ? [
          {
            header: t('transactionCreateConsumption:open_vial'),
            id: 'open_vial',
          },
          {
            header: t('transactionCreateConsumption:close_vial'),
            id: 'close_vial',
          },
        ]
        : [
          {
            header: t('transactionCreateConsumption:table.column.quantity'),
            id: 'quantity',
            size: 180,
          },
        ]),
      {
        header: t('transactionCreateConsumption:table.column.material_status'),
        id: 'material_status',
        size: 180,
      },
    ]

  const { setModalWarning } = useModalWarningStore()

  const checkValidity = async () => {
    const isValid = await methods.trigger()

    if (!isValid) {
      const {
        formState: { errors },
      } = methods
      if (errors.batches?.root?.type === 'at-least-one-change_qty') {
        return setModalWarning(true, t('transactionCreate:alert_save_batch'))
      }
    }
  }

  return {
    methods,
    addNewBatch: ({ itemParent, otherBatch, itemChild }: NewBatch) =>
      newBatch({
        itemParent,
        otherBatch,
        itemChild,
      }),
    resetBatch: ({ currentBatch }: ResetBatch) => resetBatch({ currentBatch }),
    columns,
    checkValidity,
  }
}
