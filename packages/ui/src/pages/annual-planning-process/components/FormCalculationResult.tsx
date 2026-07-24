import { FormProvider } from "react-hook-form"

import { Button } from "#components/button"
import CheckV2 from "#components/icons/CheckV2"
import { ModalConfirmation } from "#components/modules/ModalConfirmation"

import InformationAnnualPlanning from "./InformationAnnualPlanning"
import FormCalculationResultFilter from "./FormCalculationResultFilter"
import { Pagination, PaginationContainer, PaginationInfo, PaginationSelectLimit } from "#components/pagination"
import { useFormCalculationResult } from "../hooks/useFormCalculationResult"
import FormCalculationResultModalDetail from "./FormCalculationResultModalDetail"
import { useContext } from "react"
import { AnnualPlanningProcessCreateContext } from "../context/ContextProvider"
import TableCalculationResult from "./TableCalculationResult"

const FormCalculationResult: React.FC = () => {
  const {
    isReview,
    isRevision,
    parentForm: { area_program_plan, population_correction, usage_index },
  } = useContext(AnnualPlanningProcessCreateContext)
  const {
    t,
    methods,
    datasource,
    pagination,
    refModalDetail,
    dataDetail,
    openConfirmation,
    descriptionConfirmation,
    setOpenConfirmation,
    handleSearch,
    handleReset,
    handleChangePage,
    handleChangePaginate,
    onClickRow,
    handleSubmitConfirmation,
    materialName,
    activityName,
    materialSubtype,
    handleOnChangeReset,
    mutateExport,
  } = useFormCalculationResult({
    id: area_program_plan?.id,
    population_correction,
    usage_index,
    isReview,
    isRevision,
  })

  const data = datasource?.data || []

  return (
    <div className="ui-space-y-6">
      <ModalConfirmation
        open={openConfirmation}
        setOpen={setOpenConfirmation}
        onSubmit={handleSubmitConfirmation}
        title={t('common:confirmation')}
        description={descriptionConfirmation}
        subDescriptionClassName="ui-text-left"
      />

      {dataDetail && (
        <FormCalculationResultModalDetail
          ref={refModalDetail}
          data={dataDetail}
        />
      )}

      <div className="ui-space-y-3">
        <InformationAnnualPlanning />
      </div>

      <FormProvider
        {...methods}
      >
        <FormCalculationResultFilter
          handleSearch={handleSearch}
          handleReset={handleReset}
          handleOnChangeReset={handleOnChangeReset}
          province_ids={area_program_plan?.province?.value?.toString() || ''}
          regency_ids={area_program_plan?.regency?.value?.toString() || ''}
          handleExport={mutateExport}
        />
      </FormProvider>

      <div className="ui-p-4 ui-space-y-6 ui-border ui-border-gray-300 ui-rounded">
        <div className="ui-flex ui-justify-between ui-items-center">
          <p className="ui-text-base ui-font-bold">
            {t('annualPlanningProcess:table_title.material_list')}
          </p>
          <Button
            type="button"
            onClick={() => setOpenConfirmation(true)}
            leftIcon={<CheckV2 />}
          >
            {t('common:finish')}
          </Button>
        </div>

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

export default FormCalculationResult