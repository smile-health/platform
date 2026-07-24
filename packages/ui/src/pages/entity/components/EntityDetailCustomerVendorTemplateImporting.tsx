import { useContext, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '#components/button'
import Download from '#components/icons/Download'
import UploadIcon from '#components/icons/UploadIcon'
import ModalError from '#components/modules/ModalError'
import { ModalImport } from '#components/modules/ModalImport'
import { toast } from '#components/toast'
import { BOOLEAN } from '#constants/common'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import {
  downloadCustomerTemplate,
  importEntityCustomer,
} from '#services/entity'
import { useLoadingPopupStore } from '#store/loading.store'
import { ErrorResponse } from '#types/common'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'

import EntityDetailCustomerVendorContext from '../utils/entity-detail-customer-vendor-context'

type Props = {
  entityId: string
}

const EntityDetailCustomerVendorTemplateImporting: React.FC<Props> = ({
  entityId,
}) => {
  const { entity } = useContext(EntityDetailCustomerVendorContext)
  const { t } = useTranslation(['entity', 'common'])
  const [showImport, setShowImport] = useState<boolean>(false)
  const [listOfImportErrors, setListOfImportErrors] = useState<{
    [key: string]: string[]
  } | null>(null)
  const queryClient = useQueryClient()
  const { setLoadingPopup } = useLoadingPopupStore()
  const invalidateQueries = () => {
    queryClient.invalidateQueries({
      queryKey: ['entity__customer_consumption'],
    })
    queryClient.invalidateQueries({
      queryKey: ['entity__customer_distribution'],
    })
  }

  const { mutate: onImport } = useMutation({
    mutationFn: (data: FormData) => importEntityCustomer(entityId, data),
    onMutate: () => setLoadingPopup(true),
    onSettled: () => {
      invalidateQueries()
      setLoadingPopup(false)
    },
    onSuccess: () =>
      toast.success({
        description: t('entity:form.success.success_import_customer'),
      }),
    onError: (error) => {
      if (error instanceof AxiosError) {
        const response =
          (error.response?.data as ErrorResponse) || error?.message
        toast.danger({ description: response.message })
        if (error?.response?.data?.errors) {
          setListOfImportErrors(error.response.data.errors)
        }
      }
    },
  })

  const downloadQuery = useQuery({
    queryKey: ['customer__template'],
    queryFn: () => downloadCustomerTemplate(entityId),
    enabled: false,
  })

  useSetLoadingPopupStore(downloadQuery.isLoading || downloadQuery.isFetching)

  return (
    <>
      {listOfImportErrors !== null && (
        <ModalError
          open={listOfImportErrors !== null}
          errors={listOfImportErrors}
          handleClose={() => {
            setListOfImportErrors(null)
          }}
        />
      )}
      <ModalImport
        open={showImport}
        setOpen={setShowImport}
        onSubmit={onImport}
        description={t('entity:import.description')}
        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        maxSize={10}
      />
      <div className="ui-flex ui-justify-end ui-items-center">
        <Button
          type="button"
          className="ui-px-[18.5px]"
          variant="outline"
          disabled={entity?.status === BOOLEAN.FALSE}
          onClick={() => downloadQuery.refetch()}
        >
          <div className="ui-flex ui-justify-between ui-items-center">
            <div className="ui-mr-2">
              <Download />
            </div>
            {t('common:download_template')}
          </div>
        </Button>
        <Button
          type="button"
          className="ui-px-[18px] ui-ml-[16px]"
          color="primary"
          disabled={entity?.status === BOOLEAN.FALSE}
          onClick={() => setShowImport(true)}
        >
          <div className="ui-flex ui-justify-between ui-items-center">
            <div className="ui-mr-2">
              <UploadIcon />
            </div>
            {t('entity:detail.customer_vendor.import_data_customer')}
          </div>
        </Button>
      </div>
    </>
  )
}

export default EntityDetailCustomerVendorTemplateImporting
