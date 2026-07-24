import { forwardRef, useContext, useImperativeHandle, useState } from "react"
import { useTranslation } from "react-i18next"

import { Drawer, DrawerContent, DrawerHeader } from '#components/drawer'
import { Button } from "#components/button"
import XMark from "#components/icons/XMark"

import { AnnualPlanningProcessCreateContext } from "../context/ContextProvider"
import TablePopulationCorrection from "./TablePopulationCorrection"

export type PreviewPopulationCorrectionHandle = {
  open: () => void;
  close: () => void;
};

const PreviewPopulationCorrection = forwardRef<PreviewPopulationCorrectionHandle>((_, ref) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation(['annualPlanningProcess', 'common'])
  const {
    parentForm,
  } = useContext(AnnualPlanningProcessCreateContext)

  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
    close: () => setOpen(false),
  }));

  return (
    <Drawer
      open={open}
      onOpenChange={() => setOpen(false)}
      placement="bottom"
      sizeHeight="xl"
      size="full"
      className="ui-rounded-t-lg"
    >
      <DrawerHeader>
        <div className="ui-flex ui-justify-between">
          <div />
          <h6 className="ui-text-xl ui-text-primary-800 ui-font-medium">
            {t('annualPlanningProcess:create.form.drawer_correction_data.preview_title')}
          </h6>
          <Button
            variant="subtle"
            type="button"
            color="neutral"
            onClick={() => setOpen(false)}
          >
            <XMark />
          </Button>
        </div>
      </DrawerHeader>
      <DrawerContent className="ui-border-y ui-border-b-zinc-300">
        <div className="ui-px-1 ui-py-2">
          <div className="ui-space-y-6 ui-mb-6">
            <div className="ui-grid ui-grid-cols-[50%_50%] ui-gap-4">
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
                  {t('annualPlanningProcess:create.form.area_program_plan.program_plan.label')}
                </h2>
                <p className="ui-font-bold ui-text-primary-800 ui-mb-1 ui-break-normal">
                  {parentForm.area_program_plan?.program_plan?.label || '-'}
                </p>
              </div>
            </div>

            <TablePopulationCorrection />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
});

PreviewPopulationCorrection.displayName = "PreviewPopulationCorrection";

export default PreviewPopulationCorrection