import { ModalConfirmation } from "#components/modules/ModalConfirmation";
import useChangeStatus from "#hooks/useChangeStatus";
import { useSetLoadingPopupStore } from "#hooks/useSetLoading";
import useSmileRouter from "#hooks/useSmileRouter";
import { updateStatusEntity } from "#services/entity";
import { CommonType } from "#types/common";
import { TEntities } from "#types/entity";
import { useTranslation } from "react-i18next";

import { SortingState } from "@tanstack/react-table";

import { DataTable } from "../../../components/data-table/DataTable";
import { columns } from "../constants/table";

type EntityTableProps = CommonType & {
  data?: TEntities[]
  size?: number
  page?: number
  isLoading?: boolean
  sorting?: SortingState
  setSorting?: (sorting: SortingState) => void
}

export default function EntityTable(props: EntityTableProps) {
  const {
    data,
    size = 10,
    page = 1,
    isLoading,
    isGlobal,
    sorting,
    setSorting,
  } = props
  const router = useSmileRouter()
  const { t } = useTranslation(['common', 'entity'])

  const {
    onChangeStatus,
    isLoading: isLoadingUpdateStatus,
    changeStatusState,
    setChangeStatusState,
    handleResetChangeStatusState,
  } = useChangeStatus({
    titlePage: 'status entity',
    validateQueryKey: 'entities',
    queryFn: (id, status) => updateStatusEntity(id, { status: String(status) }),
  })

  useSetLoadingPopupStore(isLoadingUpdateStatus)

  return (
    <div className="ui-space-y-6">
      <ModalConfirmation
        key={changeStatusState?.id}
        open={changeStatusState?.show}
        description={
          changeStatusState?.status
            ? t('entity:action.deactivate.confirmation')
            : t('entity:action.activate.confirmation')
        }
        setOpen={handleResetChangeStatusState}
        onSubmit={onChangeStatus}
      />
      <DataTable
        data={data}
        columns={columns(t, {
          isGlobal,
          isLoadingUpdateStatus,
          setLink: router.getAsLink,
          setLinkGlobal: router.getAsLinkGlobal,
          setChangeStatusState,
          page,
          size,
        })}
        isLoading={isLoading}
        sorting={sorting}
        setSorting={setSorting}
        className="ui-overflow-x-auto"
      />
    </div>
  )
}
