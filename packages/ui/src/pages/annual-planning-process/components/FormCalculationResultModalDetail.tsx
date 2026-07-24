import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '#components/dialog'
import { Button } from '#components/button'
import { useTranslation } from 'react-i18next'
import { forwardRef, useImperativeHandle, useState } from 'react';
import { GetDataDetailMonthlyCalculationResultResponse } from '../annual-planning-process.types';
import { DataTable } from '#components/data-table';
import { columnsCalculationResultDetail } from '../annual-planning-process.table-form-calculation';

export type FormCalculationResultModalDetailHandle = {
  open: () => void;
  close: () => void;
};

type Props = {
  data: GetDataDetailMonthlyCalculationResultResponse
}

const FormCalculationResultModalDetail = forwardRef<FormCalculationResultModalDetailHandle, Props>((props, ref) => {
  const { data: { entity, activity, material, monthly_distributions } = {} } = props
  const { t, i18n: { language } } = useTranslation(['annualPlanningProcess', 'common'])
  const [open, setOpen] = useState(true)

  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
    close: () => setOpen(false),
  }))

  return (
    <Dialog open={open} size="xl">
      <DialogCloseButton onClick={() => setOpen(false)} />
      <DialogHeader className="ui-my-2">
        <h3 className="ui-text-center ui-text-xl ui-font-medium">
          {t('annualPlanningProcess:create.form.calculation_result.drawer.title')}
        </h3>
      </DialogHeader>
      <div className="ui-h-1 ui-border-t ui-border-neutral-300" />
      <div className="ui-grid ui-grid-cols-3 ui-gap-4 ui-px-5 ui-py-3">
        <div>
          <h2 className="ui-text-sm ui-font-medium ui-text-neutral-500">
            {t('annualPlanningProcess:create.form.drawer_correction_data.health_care_name')}
          </h2>
          <p className="ui-font-bold ui-text-primary-800 ui-mb-1 ui-break-normal">
            {entity?.name}
          </p>
        </div>
        <div>
          <h2 className="ui-text-sm ui-font-medium ui-text-neutral-500">
            {t('annualPlanningProcess:create.form.calculation_result.activity.label')}
          </h2>
          <p className="ui-font-bold ui-text-primary-800 ui-mb-1 ui-break-normal">
            {activity?.name}
          </p>
        </div>
        <div>
          <h2 className="ui-text-sm ui-font-medium ui-text-neutral-500">
            {t('annualPlanningProcess:create.form.calculation_result.material.label')}
          </h2>
          <p className="ui-font-bold ui-text-primary-800 ui-mb-1 ui-break-normal">
            {material?.name}
          </p>
        </div>
      </div>
      <div className="ui-h-1 ui-border-t ui-border-neutral-300" />
      <DialogContent>
        <DataTable
          columns={columnsCalculationResultDetail({ t, language })}
          data={monthly_distributions || []}
        />
      </DialogContent>
      <DialogFooter className="ui-w-full">
        <Button
          id="btn-close-modal-detail"
          type="button"
          variant="outline"
          className="ui-w-full"
          onClick={() => setOpen(false)}
        >
          {t('common:close')}
        </Button>
      </DialogFooter>
    </Dialog>
  )
})

FormCalculationResultModalDetail.displayName = "FormCalculationResultModalDetail";

export default FormCalculationResultModalDetail