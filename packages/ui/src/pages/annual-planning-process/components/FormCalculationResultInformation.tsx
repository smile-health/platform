import { Button } from '#components/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '#components/dialog'
import { useTranslation } from 'react-i18next'
import { useModalCalculationInformation } from '../store/modal-calculation-information.store'

const FormCalculationResultInformation: React.FC = () => {
  const { t } = useTranslation(['annualPlanningProcess', 'common'])
  const { openCalculationInformation, setOpenCalculationInformation } = useModalCalculationInformation()

  return (
    <Dialog open={openCalculationInformation} onOpenChange={setOpenCalculationInformation} size="lg">
      <DialogHeader className="ui-text-center">
        {t('annualPlanningProcess:create.form.calculation_result.information.title')}
      </DialogHeader>
      <DialogContent className="ui-text-start ui-space-y-6 ui-text-neutral-500 ui-px-6">
        <div
          className='ui-space-y-2'
          dangerouslySetInnerHTML={{ __html: t("annualPlanningProcess:information.description.column").replace(/\\/g, '') }}
        />
        <div
          className='ui-space-y-2'
          dangerouslySetInnerHTML={{ __html: t("annualPlanningProcess:information.description.formula").replace(/\\/g, '') }}
        />
        <div
          className='ui-space-y-2'
          dangerouslySetInnerHTML={{ __html: t("annualPlanningProcess:information.description.note").replace(/\\/g, '') }}
        />
      </DialogContent>
      <DialogFooter className="ui-grid ui-grid-cols-1">
        <Button variant="outline" onClick={() => setOpenCalculationInformation(!openCalculationInformation)}>
          {t('common:close')}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}

export default FormCalculationResultInformation
