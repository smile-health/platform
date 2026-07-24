import { useContext } from 'react'
import { Button } from '#components/button'
import Export from '#components/icons/Export'
import { InputSearch } from '#components/input'
import { BOOLEAN } from '#constants/common'
import { useTranslation } from 'react-i18next'

import { IS_CONSUMPTION } from '../utils/constants'
import EntityDetailCustomerVendorContext from '../utils/entity-detail-customer-vendor-context'

interface Props {
  buttonTitle: string
  onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void
  selectedRows: string[]
  refetch?: () => void
  buttonLoading?: boolean
  exportClickFunction: () => void
  handleOpenDeleteModal: () => void
  dataKey: string
}

const EntityDetailCustomerFilter: React.FC<Props> = ({
  selectedRows,
  buttonTitle,
  onSearch,
  buttonLoading,
  exportClickFunction,
  handleOpenDeleteModal,
  dataKey,
}) => {
  const { t } = useTranslation(['common', 'entity'])
  const { isSubmittingCustomer, isViewOnly, handleOpenModal, entity } =
    useContext(EntityDetailCustomerVendorContext)

  return (
    <div className="ui-mb-6 ui-flex ui-justify-end ui-items-center">
      {selectedRows.length > 0 ? (
        <div className="ui-flex ui-justify-end ui-items-end">
          <p className="ui-mr-4 ui-text-[14px] ui-italic ui-leading-[20px]">
            {t('common:data_has_been_selected', {
              selectedRows: selectedRows.length.toString(),
            })}
          </p>
          <Button
            variant="solid"
            color="danger"
            onClick={handleOpenDeleteModal}
            loading={buttonLoading}
            id={`delete_all_selected_${dataKey}`}
          >
            {t('common:delete_all_selected')}
          </Button>
        </div>
      ) : (
        <>
          <div className="ui-mr-[18px] ui-w-[378.67px]">
            <InputSearch
              id={`search_${dataKey}`}
              placeholder={`${t('common:search')} ${
                dataKey === 'vendor'
                  ? t(
                      'entity:detail.customer_vendor.vendor_name'
                    )?.toLowerCase()
                  : t(
                      'entity:detail.customer_vendor.customer_name'
                    )?.toLowerCase()
              }`}
              onChange={onSearch}
            />
          </div>
          {['customer_distribution', 'customer_consumption'].includes(
            dataKey
          ) ? (
            <>
              <Button
                id={`export_${dataKey}`}
                onClick={() => exportClickFunction()}
                variant="outline"
                disabled={buttonLoading}
              >
                <div className="ui-flex ui-justify-center ui-items-center">
                  <Export className="ui-mr-2 ui-mt-[2px]" />
                  {t('common:export')}
                </div>
              </Button>
              {!isViewOnly ? (
                <Button
                  id={`add_${dataKey}`}
                  onClick={() =>
                    handleOpenModal({
                      data: null,
                      isConsumptionArg:
                        dataKey === 'customer_consumption'
                          ? IS_CONSUMPTION.TRUE
                          : IS_CONSUMPTION.FALSE,
                    })
                  }
                  disabled={buttonLoading || entity?.status === BOOLEAN.FALSE}
                  loading={isSubmittingCustomer}
                  className="ui-ml-[16px]"
                >
                  {buttonTitle}
                </Button>
              ) : null}
            </>
          ) : null}
        </>
      )}
    </div>
  )
}

export default EntityDetailCustomerFilter
