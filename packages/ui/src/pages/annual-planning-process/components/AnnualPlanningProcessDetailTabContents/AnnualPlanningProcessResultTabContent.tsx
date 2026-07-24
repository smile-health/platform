import { FormProvider } from "react-hook-form"
import { useParams } from "next/navigation"

import FormCalculationResultFilter from "../FormCalculationResultFilter"
import { Pagination, PaginationContainer, PaginationInfo, PaginationSelectLimit } from "#components/pagination"
import { useFormCalculationResult } from "../../hooks/useFormCalculationResult"
import FormCalculationResultModalDetail from "../FormCalculationResultModalDetail"
import TableCalculationResult from "../TableCalculationResult"
import { GetDetailAnnualPlanningProcessResponse } from "../../annual-planning-process.types"

type Props = {
  data?: GetDetailAnnualPlanningProcessResponse
}

const AnnualPlanningProcessResultTabContent: React.FC<Props> = (props) => {
  const { data: dataAnnualDetail } = props
  const params = useParams()
  const id = params?.id as string
  const {
    t,
    methods,
    datasource,
    pagination,
    refModalDetail,
    dataDetail,
    handleSearch,
    handleReset,
    handleChangePage,
    handleChangePaginate,
    onClickRow,
    materialName,
    activityName,
    materialSubtype,
    handleOnChangeReset,
    mutateExport,
  } = useFormCalculationResult({ id })

  const data = datasource?.data || []

  return (
    <div className="ui-space-y-6 ui-mt-3">
      {dataDetail && (
        <FormCalculationResultModalDetail
          ref={refModalDetail}
          data={dataDetail}
        />
      )}

      <FormProvider {...methods}>
        <FormCalculationResultFilter
          handleSearch={handleSearch}
          handleReset={handleReset}
          handleOnChangeReset={handleOnChangeReset}
          province_ids={dataAnnualDetail?.province.id.toString() || ''}
          regency_ids={dataAnnualDetail?.regency.id.toString() || ''}
          handleExport={mutateExport}
        />
      </FormProvider>

      <div className="ui-p-4 ui-space-y-6 ui-border ui-border-gray-300 ui-rounded">
        <p className="ui-text-base ui-font-bold">
          {t('table_title.needs_calculation')}
        </p>

        <TableCalculationResult
          data={data}
          materialName={materialName}
          activityName={activityName}
          onClickRow={onClickRow}
          pagination={pagination}
          materialSubtype={materialSubtype}
        />

        <PaginationContainer>
          <PaginationSelectLimit
            size={pagination.paginate}
            onChange={(paginate) => handleChangePaginate(paginate)}
            perPagesOptions={datasource?.list_pagination}
          />
          <PaginationInfo
            size={pagination.paginate}
            currentPage={pagination.page}
            total={datasource?.total_item}
          />
          <Pagination
            totalPages={datasource?.total_page || 0}
            currentPage={pagination.page}
            onPageChange={(page) => handleChangePage(page)}
          />
        </PaginationContainer>
      </div>
    </div>
  )
}

export default AnnualPlanningProcessResultTabContent