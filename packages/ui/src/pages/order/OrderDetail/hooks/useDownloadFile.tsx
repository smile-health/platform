import { useQueries, UseQueryResult } from '@tanstack/react-query'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import { useTranslation } from 'react-i18next'

import { OrderStatusEnum } from '../../order.constant'
import { TOrderIntegrationType } from '../../OrderList/order-list.type'
import {
  downloadFileFetchingFunction,
  downloadFileStatusMap,
} from '../order-detail.constant'

type UseDownloadFileParams = {
  id?: string | number
  status?: OrderStatusEnum
  client_key?: TOrderIntegrationType
}

type DownloadType = keyof typeof downloadFileStatusMap

function createButton(
  label: string,
  query: UseQueryResult,
  type: DownloadType
) {
  return {
    id: type,
    label,
    onClick: () => query.refetch(),
    status: downloadFileStatusMap?.[type],
    isLoading: query?.isLoading || query?.isFetching,
  }
}

export default function useDownloadFile(params: UseDownloadFileParams) {
  const { id, status, client_key } = params
  const { t } = useTranslation('orderDetail')

  const queries = Object.entries(downloadFileFetchingFunction)?.map(
    ([key, fn]) => ({
      queryKey: [key, id],
      queryFn: () => fn(Number(id)),
      enabled: false,
    })
  )

  const [
    downloadLetterQuery,
    downloadConfirmationNoteQuery,
    downloadBatchNoteQuery,
    downloadSbbkQuery,
    downloadVarQuery,
  ] = useQueries({ queries })

  let buttons = []

  if (client_key === 'din') {
    buttons.push(
      createButton(t('button.var_report'), downloadVarQuery, 'export-order-var')
    )
  } else {
    buttons = [
      createButton(
        t('button.letter_report'),
        downloadLetterQuery,
        'export-order-letter-request'
      ),
      createButton(
        t('button.confirmation_note'),
        downloadConfirmationNoteQuery,
        'export-order-confirmation-note'
      ),
      createButton(
        t('button.batch_note'),
        downloadBatchNoteQuery,
        'export-order-batch-note'
      ),
      createButton(t('button.sbbk'), downloadSbbkQuery, 'export-order-sbbk'),
      createButton(
        t('button.var_report'),
        downloadVarQuery,
        'export-order-var'
      ),
    ]?.filter((button) => button.status.includes(status as OrderStatusEnum))
  }

  useSetLoadingPopupStore(buttons?.some((button) => button?.isLoading))

  return buttons
}
