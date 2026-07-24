import { useContext } from 'react'
import { FormErrorMessage } from '#components/form-control'
import { InputNumberV2 } from '#components/input-number-v2'
import { Table, Tbody, Td, Th, Thead, Tr } from '#components/table'
import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import { v2DetailDistributionDisposalReceiveDetailFormSchema } from '../schemas/distribution-disposal.schema-form'
import {
  TDistributionDisposalShipmentDetailStockReformed,
  TUpdateReceivedStock,
} from '../types/DistributionDisposal'
import DistributionDisposalDetailMaterialContext from '../utils/distribution-disposal-detail-material.context'
import { materialStockReformer, thousandFormatter } from '../utils/util'
import DistributionDisposalDetailTitleBlock from './DistributionDisposalDetailTitleBlock'

import 'dayjs/locale/id'
import 'dayjs/locale/en'

type DistributionDisposalDetailMaterialStockDrawerTableProps = {
  tempStorageQuantityData: TUpdateReceivedStock[] | null
  setTempStorageQuantityData: (data: TUpdateReceivedStock[] | null) => void
}

const DistributionDisposalDetailMaterialStockDrawerTable: React.FC<
  DistributionDisposalDetailMaterialStockDrawerTableProps
> = ({ tempStorageQuantityData, setTempStorageQuantityData }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(['common', 'distributionDisposal'])

  const { errorForms, setErrorForms, quantityData } = useContext(
    DistributionDisposalDetailMaterialContext
  )

  const formatDate = (date: string) =>
    date ? dayjs(date).locale(language).format('DD MMM YYYY') : '-'

  const handleError = async ({
    index,
    name,
    updatedStock,
  }: {
    index: number
    name: string
    updatedStock: TUpdateReceivedStock
  }) => {
    const fieldPath = `stock_members[${index}].${name}`
    try {
      await v2DetailDistributionDisposalReceiveDetailFormSchema(
        t,
        language
      ).validateAt(fieldPath, updatedStock)
      setErrorForms((prev: any) => ({
        ...prev,
        [fieldPath]: null,
      }))
    } catch (error: any) {
      setErrorForms((prev: any) => ({
        ...prev,
        [fieldPath]: error.message,
      }))
    }
  }

  const reformedStockData = materialStockReformer(
    quantityData?.disposal_shipment_stocks ?? []
  )

  const findSavedQuantityData = tempStorageQuantityData?.find(
    (item) => Number(item?.disposal_item_id) === Number(quantityData?.id)
  )

  const foundSavedStock =
    findSavedQuantityData?.stock_members ?? reformedStockData

  const handleValueChange = ({
    index,
    name,
    value,
  }: {
    index: number
    name: string
    value: number | null
  }) => {
    const updatedStock = {
      disposal_item_id: Number(quantityData?.id),
      confirmed_qty: quantityData?.confirmed_qty ?? null,
      stock_members: foundSavedStock?.map(
        (
          item: TDistributionDisposalShipmentDetailStockReformed,
          idx: number
        ) =>
          idx === index
            ? {
                ...item,
                [name]: value,
              }
            : item
      ),
    }

    if (findSavedQuantityData) {
      setTempStorageQuantityData(
        tempStorageQuantityData?.map((item) =>
          Number(item?.disposal_item_id) === Number(quantityData?.id)
            ? updatedStock
            : item
        ) as TUpdateReceivedStock[]
      )
    } else {
      setTempStorageQuantityData([
        ...(tempStorageQuantityData ?? []),
        updatedStock as TUpdateReceivedStock,
      ])
    }
    handleError({ index, name, updatedStock })
  }

  return (
    <div className="transaction__remove__stock__input__batch__table">
      <Table layout="fixed" overflowXAuto withBorder>
        <Thead>
          <Th className="ui-w-12">
            <div className="ui-text-sm ui-text-dark-blue ui-font-bold">No.</div>
          </Th>
          <Th className="ui-w-36">
            <div className="ui-text-sm ui-text-dark-blue ui-font-bold">
              {t('distributionDisposal:table.column.batch_info')}
            </div>
          </Th>
          <Th className="ui-w-36">
            <div className="ui-text-sm ui-text-dark-blue ui-font-bold">
              {t('distributionDisposal:table.column.activity')}
            </div>
          </Th>
          <Th className="ui-w-36">
            <div className="ui-text-sm ui-text-dark-blue ui-font-bold">
              {t('distributionDisposal:table.column.shipped')}
            </div>
          </Th>
          <Th className="ui-w-36">
            <div className="ui-text-sm ui-text-dark-blue ui-font-bold">
              {t('distributionDisposal:table.column.received')}
            </div>
          </Th>
        </Thead>
        <Tbody className="ui-bg-white ui-group ui-text-sm ui-font-normal">
          {reformedStockData?.map((data, index) => {
            const dataBatch = data?.batch
            const totalShipped =
              data?.accumulated_reasons?.reduce(
                (acc, reason) => ({
                  qty: Number(acc.qty ?? 0) + Number(reason.qty ?? 0),
                }),
                { qty: 0 }
              ).qty ?? 0
            const totalReceived = foundSavedStock?.find(
              (item) => item.batch?.code === dataBatch?.code
            )
            return (
              <Tr
                key={`transaction_remove_stock_input_batch_table_${index?.toString()}`}
              >
                <Td>{index + 1}</Td>
                <Td>
                  <DistributionDisposalDetailTitleBlock
                    arrText={[
                      {
                        label: dataBatch?.code ?? '-',
                        className: 'ui-text-dark-teal ui-text-sm ui-font-bold',
                      },
                      {
                        label: t(
                          'distributionDisposal:table.column.production_date',
                          {
                            value: dataBatch?.production_date
                              ? formatDate(
                                  dataBatch?.production_date
                                )?.toUpperCase()
                              : '-',
                          }
                        ),
                        className:
                          'ui-text-dark-teal ui-text-sm ui-font-normal',
                      },
                      {
                        label: t(
                          'distributionDisposal:table.column.batch.manufacturer',
                          { value: dataBatch?.manufacture?.name ?? '-' }
                        ),
                        className:
                          'ui-text-dark-teal ui-text-sm ui-font-normal',
                      },
                      {
                        label: t(
                          'distributionDisposal:table.column.batch.expired_date',
                          {
                            value: dataBatch?.expired_date
                              ? formatDate(
                                  dataBatch?.expired_date
                                )?.toUpperCase()
                              : '-',
                          }
                        ),
                        className:
                          'ui-text-dark-teal ui-text-sm ui-font-normal',
                      },
                    ]}
                  />
                </Td>
                <Td>{data?.activity?.name}</Td>
                <Td>
                  {thousandFormatter({
                    value: totalShipped,
                    locale: language,
                  })}
                </Td>
                <Td>
                  <InputNumberV2
                    placeholder={t(
                      'distributionDisposal:detail.receive_placeholder'
                    )}
                    value={totalReceived?.received_qty ?? ''}
                    disabled={totalShipped <= 0}
                    onValueChange={(values) =>
                      handleValueChange({
                        index,
                        name: 'received_qty',
                        value: values?.floatValue as number,
                      })
                    }
                  />
                  <FormErrorMessage>
                    {errorForms?.[`stock_members[${index}].received_qty`]}
                  </FormErrorMessage>
                </Td>
              </Tr>
            )
          })}
        </Tbody>
      </Table>
    </div>
  )
}

export default DistributionDisposalDetailMaterialStockDrawerTable
