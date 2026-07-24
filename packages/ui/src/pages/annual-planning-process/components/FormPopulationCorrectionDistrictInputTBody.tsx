import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Control, Controller, UseFormSetValue } from 'react-hook-form';

import cx from '#lib/cx';
import { numberFormatter } from '#utils/formatter';

import { Td, Tr } from '#components/table';
import { InputNumberV2 } from '#components/input-number-v2';
import { FormControl, FormErrorMessage } from '#components/form-control';

import { ProcessStatus } from '../annual-planning-process.constants';
import { FormPopulationTargetDataForm, FormPopulationTargetForm } from '../annual-planning-process.types';
import { AnnualPlanningProcessCreateContext, FormPopulationCorrectionContext } from '../context/ContextProvider';
import { roundIfNeeded } from '../annual-planning-process.utils';

type Props = {
  index: number
  data: FormPopulationTargetForm
  control: Control<FormPopulationTargetDataForm, any, FormPopulationTargetDataForm>
  setValue: UseFormSetValue<FormPopulationTargetDataForm>
  allDataPopulations: Record<string, number>
}

const FormPopulationCorrectionDistrictInputTBody: React.FC<Props> = (props) => {
  const { index, data, control, setValue, allDataPopulations } = props
  const { t, i18n: { language } } = useTranslation('annualPlanningProcess')
  const {
    isRevision,
  } = useContext(AnnualPlanningProcessCreateContext)
  const {
    data: dataPopulationCorrection,
  } = useContext(FormPopulationCorrectionContext)

  const key = data.key || ''
  const totalCentral = dataPopulationCorrection?.[0]?.[key] ? Number(dataPopulationCorrection[0][key]) : 0
  const totalHealthCare = allDataPopulations[key] ? Number(allDataPopulations[key]) : 0

  const resultPercentage = !data.change_qty ? 0 : data.change_qty / totalHealthCare * 100
  const resultPercentageRounded = roundIfNeeded(resultPercentage)
  const resultQty = !resultPercentage ? 0 : Math.round(totalCentral * resultPercentage / 100);

  return (
    <Tr
      className={cx("ui-text-sm ui-font-normal", {
        "ui-bg-[#FEF2F2]": isRevision && data.status === ProcessStatus.REJECT,
      })}
      key={data.id}
    >
      <Td className="ui-content-start">{index + 1}</Td>
      <Td className="ui-content-start">{data.name || '-'}</Td>
      <Td className="ui-content-start">{resultPercentageRounded}%</Td>
      <Td className="ui-content-start">{numberFormatter(resultQty, language)}</Td>
      <Td className="ui-content-start">
        <Controller
          control={control}
          name={`data.${index}.change_qty`}
          render={({
            field: { value, onChange, ...field },
            fieldState: { error },
          }) => (
            <FormControl>
              <InputNumberV2
                {...field}
                id={`input-qty-correction-${index}`}
                placeholder={t("create.form.drawer_correction_data.qty_correction.placeholder")}
                value={value as unknown as number}
                onValueChange={e => {
                  onChange(e.floatValue ?? null)
                  if (!data.is_revised) setValue(`data.${index}.is_revised`, true)
                }}
                error={!!error?.message}
                maxLength={11}
                disabled={isRevision && data.status !== ProcessStatus.REJECT}
              />
              {error?.message && (
                <FormErrorMessage>{error?.message}</FormErrorMessage>
              )}
            </FormControl>
          )}
        />
      </Td>
    </Tr>
  )
}

export default FormPopulationCorrectionDistrictInputTBody
