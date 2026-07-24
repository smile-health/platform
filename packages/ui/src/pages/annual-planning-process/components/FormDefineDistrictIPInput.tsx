import { Controller } from 'react-hook-form';
import { XMarkIcon } from "@heroicons/react/24/solid"

import { Button } from '#components/button';
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader } from '#components/drawer'
import XMark from '#components/icons/XMark';
import { Table, TableEmpty, Tbody, Td, Th, Thead, Tr } from '#components/table';
import { EmptyState } from '#components/empty-state';

import { FormDefineDistrictIPDataForm } from '../annual-planning-process.types';
import { numberFormatter } from '#utils/formatter';
import { FormControl, FormErrorMessage } from '#components/form-control';
import { ProcessStatus } from '../annual-planning-process.constants';
import cx from '#lib/cx';
import Eraser from '#components/icons/Eraser';
import FileCheck from '#components/icons/FileCheck';
import ColumnStatusMaterial from './ColumnStatusMaterial';
import { useFormDefineDistrictIPInput } from '../hooks/useFormDefineDistrictIPInput';
import { InputNumber } from '#components/input-number';
import { Switch } from '#components/switch';
import CheckV2 from '#components/icons/CheckV2';

type Props = {
  onClose: () => void
  dataIP: FormDefineDistrictIPDataForm | null
  handleUpdateForm: (values: FormDefineDistrictIPDataForm) => void
}

const FormDefineDistrictIPInput = (props: Props) => {
  const { onClose, dataIP, handleUpdateForm } = props
  const {
    t,
    control,
    isValid,
    data,
    parentForm,
    isRevision,
    isReview,
    language,
    handleSubmit,
    onSubmit,
    handleSetStatusAll,
  } = useFormDefineDistrictIPInput({ onClose, dataIP, handleUpdateForm })

  return (
    <Drawer
      open={!!dataIP}
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
            {t('annualPlanningProcess:create.form.district_ip.drawer.title')}
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
            <div
              className={cx("ui-grid ui-grid-cols-3 ui-gap-4", {
                "ui-grid-cols-4": isReview
              })}
            >
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

              {isReview && (
                <div className="ui-flex ui-justify-end ui-gap-4 ui-items-center">
                  <Button
                    type="button"
                    variant="subtle"
                    color="danger"
                    leftIcon={<Eraser />}
                    onClick={() => handleSetStatusAll(ProcessStatus.REJECT)}
                    size="sm"
                    className="ui-p-1"
                  >
                    {t('annualPlanningProcess:create.form.district_ip.drawer.revise_all')}
                  </Button>
                  <Button
                    type="button"
                    variant="subtle"
                    leftIcon={<FileCheck />}
                    onClick={() => handleSetStatusAll(ProcessStatus.APPROVED)}
                    size="sm"
                    className="ui-p-1"
                  >
                    {t('annualPlanningProcess:create.form.district_ip.drawer.approve_all')}
                  </Button>
                </div>
              )}
            </div>

            <form id="FormDefineDistrictIPInput" onSubmit={handleSubmit(onSubmit)}>
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
                    <Th id="header-name" className="ui-w-1/3 ui-font-semibold">
                      {t('create.form.district_ip.column.material_name')}
                    </Th>
                    <Th id="header-activity" className="ui-w-10 ui-font-semibold">
                      {t('create.form.district_ip.column.activity')}
                    </Th>
                    <Th id="header-target-group" className="ui-w-10 ui-font-semibold">
                      {t('create.form.district_ip.column.target_group')}
                    </Th>
                    <Th id="header-sku" className="ui-w-10 ui-font-semibold">
                      SKU
                    </Th>
                    <Th id="header-national-ip" className="ui-w-10 ui-font-semibold">
                      {t('create.form.district_ip.column.national_ip')}
                    </Th>
                    {isRevision && (
                      <Th id="header-data-status" className="ui-w-24 ui-font-semibold">
                        {t('create.form.district_ip.column.data_status')}
                      </Th>
                    )}
                    <Th id="header-district-ip" className="ui-w-10 ui-font-semibold">
                      {t('create.form.district_ip.column.district_ip')}
                    </Th>
                    {isReview && (
                      <Th id="header-data-status" className="ui-w-24 ui-font-semibold">
                        {t('create.form.district_ip.column.data_status')}
                      </Th>
                    )}
                  </Tr>
                </Thead>
                <Tbody className="ui-bg-white">
                  {data.map((x, i) => (
                    <Tr
                      className={cx("ui-text-sm ui-font-normal", {
                        "ui-bg-[#FEF2F2]": isRevision && x.status === ProcessStatus.REJECT,
                      })}
                      key={`cell-input-${x.material?.id}`}
                    >
                      <Td className="ui-content-start">{i + 1}</Td>
                      <Td className="ui-content-start">{x.material?.name || '-'}</Td>
                      <Td className="ui-content-start">{x.activity?.name || '-'}</Td>
                      <Td className="ui-content-start">{x.target_group?.name || '-'}</Td>
                      <Td className="ui-content-start">{x.sku || '-'}</Td>
                      <Td className="ui-content-start">{numberFormatter(x.national_ip, language)}</Td>
                      {isRevision && (
                        <Td className="ui-content-start">
                          <ColumnStatusMaterial status={x.status} t={t} />
                        </Td>
                      )}
                      {isReview && (
                        <Td className="ui-content-start">
                          {numberFormatter(x.district_ip, language)}
                        </Td>
                      )}
                      <Td className="ui-content-start">
                        {isReview ? (
                          <Controller
                            control={control}
                            name={`data.${i}.status`}
                            render={({
                              field: { value, onChange, ...field },
                            }) => (
                              <FormControl className='!ui-h-[29px]'>
                                <Switch
                                  {...field}
                                  checked={value === ProcessStatus.APPROVED}
                                  size="lg"
                                  onCheckedChange={checked => onChange(checked ? ProcessStatus.APPROVED : ProcessStatus.REJECT)}
                                  labelInside={{
                                    on: <CheckV2 className="ui-text-white ui-h-5 ui-w-5" />,
                                    off: <XMarkIcon className="ui-text-white ui-h-5 ui-w-5" />,
                                  }}
                                  colorInside={{
                                    off: "data-[state=unchecked]:ui-bg-red-600",
                                    on: "data-[state=checked]:ui-bg-green-700"
                                  }}
                                />
                              </FormControl>
                            )}
                          />
                        ) : (
                          <Controller
                            control={control}
                            name={`data.${i}.district_ip`}
                            render={({
                              field: { value, onChange, ...field },
                              fieldState: { error },
                            }) => (
                              <FormControl>
                                <InputNumber
                                  {...field}
                                  hideStepper
                                  id={`input-qty-correction-${i}`}
                                  placeholder={t("annualPlanningProcess:create.form.drawer_correction_data.qty_correction.placeholder")}
                                  value={value as unknown as number}
                                  onChange={(e) => onChange(e)}
                                  error={!!error?.message}
                                  disabled={isRevision && x.status !== ProcessStatus.REJECT}
                                  minValue={0}
                                />
                                {error?.message && (
                                  <FormErrorMessage>{error?.message}</FormErrorMessage>
                                )}
                              </FormControl>
                            )}
                          />
                        )}
                      </Td>
                    </Tr>
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
          form="FormDefineDistrictIPInput"
          className="ui-w-48"
          disabled={!isValid}
        >
          {t('common:save')}
        </Button>
      </DrawerFooter>
    </Drawer >
  )
}

export default FormDefineDistrictIPInput