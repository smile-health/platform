import { useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, useFormContext } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { Button } from '#components/button';
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader } from '#components/drawer'
import XMark from '#components/icons/XMark';
import { Table, TableEmpty, Tbody, Th, Thead, Tr } from '#components/table';
import { EmptyState } from '#components/empty-state';

import { AnnualPlanningProcessCreateContext } from '../context/ContextProvider';
import { FormPopulationCorrectionDataForm, FormPopulationCorrectionForm, FormPopulationTargetDataForm } from '../annual-planning-process.types';
import { formSchemaPopulationTarget } from '../annual-planning-process.schemas';
import FormPopulationCorrectionDistrictInputTBody from './FormPopulationCorrectionDistrictInputTBody';
import InformationPopulationTargetHealthCare from './InformationPopulationTargetHealthCare';
import { setAllDataPopulations } from '../annual-planning-process.utils';

type Props = {
  onClose: () => void
  dataPopulation: FormPopulationCorrectionForm | null
  index: number | null
  handleUpdateForm: (values: FormPopulationTargetDataForm) => void
}

const FormPopulationCorrectionDistrictInput = (props: Props) => {
  const { t } = useTranslation(['annualPlanningProcess', 'common'])
  const { onClose, dataPopulation, index, handleUpdateForm } = props
  const {
    parentForm,
  } = useContext(AnnualPlanningProcessCreateContext)
  const {
    watch: watchFormParentPopulations,
  } = useFormContext<FormPopulationCorrectionDataForm>()
  const dataFormParentPopulations = watchFormParentPopulations('data')
  const methods = useForm<FormPopulationTargetDataForm>({
    resolver: yupResolver(formSchemaPopulationTarget(t)),
    mode: 'onChange',
    defaultValues: {
      data: dataPopulation?.data ?? []
    }
  })

  const {
    control,
    watch,
    formState: { isValid },
    handleSubmit,
    setValue,
  } = methods
  const data = watch('data')

  const onSubmit = (values: FormPopulationTargetDataForm) => {
    handleUpdateForm(values)
  }

  const [nameColumn, percentageColumn, qtyColumn, changeQtyColumn] = useMemo(() => {
    return t('annualPlanningProcess:create.form.drawer_correction_data.column', {
      returnObjects: true
    }) as string[]
  }, [t])

  const allDataPopulations = setAllDataPopulations({
    dataFormParentPopulations,
    data,
    index,
  })

  return (
    <Drawer
      open={!!dataPopulation}
      onOpenChange={onClose}
      placement="bottom"
      sizeHeight="xl"
      size="full"
      className="ui-rounded-t-lg"
    >
      <DrawerHeader>
        <div className="ui-flex ui-justify-between">
          <div />
          <h6 className="ui-text-xl ui-text-primary-800 ui-font-medium">
            {t('annualPlanningProcess:create.form.drawer_correction_data.title')}
          </h6>
          <Button
            variant="subtle"
            type="button"
            color="neutral"
            onClick={onClose}
          >
            <XMark />
          </Button>
        </div>
      </DrawerHeader>
      <DrawerContent className="ui-border-y ui-border-b-zinc-300">
        <div className="ui-px-1 ui-py-2">
          <div className="ui-space-y-6 ui-mb-6">
            <div className="ui-grid ui-grid-cols-4 ui-gap-4">
              <div>
                <h2 className="ui-text-sm ui-font-medium ui-text-neutral-500">
                  {t('common:form.province.label')}
                </h2>
                <p className="ui-font-bold ui-text-primary-800 ui-mb-1 ui-break-normal">
                  {parentForm.area_program_plan?.province?.label || '-'}
                </p>
              </div>
              <div>
                <h2 className="ui-text-sm ui-font-medium ui-text-neutral-500">
                  {t('common:form.city.label')}
                </h2>
                <p className="ui-font-bold ui-text-primary-800 ui-mb-1 ui-break-normal">
                  {parentForm.area_program_plan?.regency?.label || '-'}
                </p>
              </div>
              <div>
                <h2 className="ui-text-sm ui-font-medium ui-text-neutral-500">
                  {t('annualPlanningProcess:create.form.area_program_plan.program_plan.label')}
                </h2>
                <p className="ui-font-bold ui-text-primary-800 ui-mb-1 ui-break-normal">
                  {parentForm.area_program_plan?.program_plan?.label || '-'}
                </p>
              </div>
              <div>
                <h2 className="ui-text-sm ui-font-medium ui-text-neutral-500">
                  {t('annualPlanningProcess:create.form.drawer_correction_data.health_care_name')}
                </h2>
                <p className="ui-font-bold ui-text-primary-800 ui-mb-1 ui-break-normal">
                  {dataPopulation?.name ?? '-'}
                </p>
              </div>
            </div>

            <InformationPopulationTargetHealthCare allDataPopulations={allDataPopulations} />

            <form id="FormPopulationCorrectionDistrictInput" onSubmit={handleSubmit(onSubmit)}>
              <Table
                withBorder
                rounded
                hightlightOnHover
                overflowXAuto
                stickyOffset={0}
                empty={data.length === 0}
                verticalAlignment="center"
              >
                <Thead className="ui-bg-slate-100">
                  <Tr>
                    <Th id="header-no" className="ui-w-10 ui-font-semibold">
                      No
                    </Th>
                    <Th id="header-name" className="ui-w-1/2 ui-font-semibold">
                      {nameColumn}
                    </Th>
                    <Th id="header-percentage" className="ui-w-10 ui-font-semibold">
                      {percentageColumn}
                    </Th>
                    <Th id="header-qty" className="ui-w-10 ui-font-semibold">
                      {qtyColumn}
                    </Th>
                    <Th id="header-change-qty" className="ui-w-10 ui-font-semibold">
                      {changeQtyColumn}
                    </Th>
                  </Tr>
                </Thead>
                <Tbody className="ui-bg-white">
                  {data.map((populationTarget, index) => (
                    <FormPopulationCorrectionDistrictInputTBody
                      key={`cell-input-${populationTarget.key}-${index}`}
                      index={index}
                      data={populationTarget}
                      control={control}
                      setValue={setValue}
                      allDataPopulations={allDataPopulations}
                    />
                  ))}
                </Tbody>
                <TableEmpty>
                  <EmptyState
                    title={t('common:message.empty.title')}
                    description={t('common:message.empty.description')}
                    withIcon
                  />
                </TableEmpty>
              </Table>
            </form>
          </div>
        </div>
      </DrawerContent>
      <DrawerFooter>
        <Button
          type="submit"
          form="FormPopulationCorrectionDistrictInput"
          className="ui-w-48"
          disabled={!isValid}
        >
          {t('common:save')}
        </Button>
      </DrawerFooter>
    </Drawer >
  )
}

export default FormPopulationCorrectionDistrictInput