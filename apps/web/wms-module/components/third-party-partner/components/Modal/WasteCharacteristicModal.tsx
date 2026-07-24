import { WasteCassificationPartnership } from '@/types/partnership';
import { Button } from '@repo/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '@repo/ui/components/dialog';
import { FormControl, FormLabel } from '@repo/ui/components/form-control';
import {
  OptionType,
  OptionTypeWithData,
  ReactSelect,
} from '@repo/ui/components/react-select';
import dayjs from 'dayjs';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  getDefaultProviderType,
  getProviderTypeOptions,
} from '../../utils/helper';

interface WasteCharacteristicModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  editIndex: number | null;
  modalForm: {
    characteristicId: string;
    characteristicLabel: string;
    providerType: string;
  };
  setModalForm: (form: any) => void;
  handleSaveSpecification: () => void;
  wasteTypeOption?: OptionType[];
  wasteGroupOption?: OptionType[];
  wasteCharacteristicOption?: OptionType[];
  control: any;
  setValue: any;
  register: any;
  watch: any;
  isSameCompany: boolean;
}

export const WasteCharacteristicModal = ({
  showModal,
  setShowModal,
  editIndex,
  modalForm,
  setModalForm,
  handleSaveSpecification,
  wasteCharacteristicOption,
  control,
  setValue,
  register,
  watch,
  isSameCompany,
}: WasteCharacteristicModalProps) => {
  const { t } = useTranslation(['thirdPartyPartner', 'common']);

  const handleWasteCharacteristicChange = (
    option: OptionTypeWithData<WasteCassificationPartnership> | null
  ) => {
    const newValue = option?.value || '';
    const newLabel = option?.label || '';

    const newClassificationId = option?.data?.wasteClassificationId || '';
    setModalForm({
      ...modalForm,
      characteristicId: newValue,
      characteristicLabel: newLabel,
      classification: newClassificationId,
      ...(isSameCompany && {
        providerType: getDefaultProviderType(
          getProviderTypeOptions(),
          option?.data?.providerType
        ),
      }),
    });

    setValue('modalSpecification.characteristicId', newValue);
    setValue('modalSpecification.characteristicLabel', newLabel);
    setValue('modalSpecification.classification', newClassificationId);

    if (isSameCompany) {
      setValue(
        'providerType',
        getDefaultProviderType(
          getProviderTypeOptions(),
          option?.data?.providerType
        )
      );
      setValue('contractId', option?.data?.contractId ?? '');
      setValue('contractDate', {
        start: new Date(
          dayjs(option?.data?.contractStartDate).format('YYYY-MM-DD')
        ),
        end: new Date(
          dayjs(option?.data?.contractEndDate).format('YYYY-MM-DD')
        ),
      });
    }
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal} size="lg">
      <DialogHeader className="ui-text-center ui-pr-0">
        <span className="ui-font-medium">
          {editIndex !== null
            ? t('thirdPartyPartner:list.button.edit_characteristic')
            : t('thirdPartyPartner:list.button.add_characteristic')}
        </span>
      </DialogHeader>
      <div className="ui-h-1 ui-border-t ui-border-neutral-300" />
      <DialogContent className="ui-overflow-visible ui-my-2 ui-py-2 styled-scroll ui-scroll-pr-2">
        <div className="ui-space-y-6">
          <Controller
            name="modalSpecification.characteristicId"
            control={control}
            render={({ field }) => (
              <FormControl>
                <FormLabel htmlFor="select-waste-characteristicId" required>
                  {t('thirdPartyPartner:form.waste_characteristic.label')}
                </FormLabel>
                <ReactSelect
                  id="select-waste-characteristicId"
                  placeholder={t(
                    'thirdPartyPartner:form.waste_characteristic.placeholder'
                  )}
                  options={wasteCharacteristicOption}
                  value={
                    modalForm.characteristicId
                      ? wasteCharacteristicOption?.find(
                          (x) => x.value === Number(modalForm.characteristicId)
                        )
                      : null
                  }
                  onChange={handleWasteCharacteristicChange}
                  isClearable
                  className="ui-z-300"
                  menuPosition="fixed"
                />
              </FormControl>
            )}
          />

          <FormControl>
            <FormLabel required>
              {t('thirdPartyPartner:form.partnership_type.label')}
            </FormLabel>
            <ReactSelect
              {...register('providerType')}
              id="select-asset-status"
              placeholder={t(
                'thirdPartyPartner:form.partnership_type.placeholder'
              )}
              options={getProviderTypeOptions()}
              onChange={(option: OptionType) => {
                setModalForm({
                  ...modalForm,
                  providerType: option?.value,
                });
                setValue('providerType', option?.value);
              }}
              value={getProviderTypeOptions()?.find(
                (x) => x.value === modalForm.providerType
              )}
              isClearable
              disabled={isSameCompany}
              className="ui-z-300"
              menuPosition="fixed"
            />
          </FormControl>
        </div>
      </DialogContent>
      <div className="ui-h-1 ui-border-t ui-border-neutral-300" />
      <DialogFooter className="ui-flex ui-justify-center ui-py-4">
        <div className="ui-grid ui-grid-cols-2 ui-gap-3 ui-w-full ui-pb-2">
          <Button
            variant="outline"
            className="ui-w-full"
            onClick={() => setShowModal(false)}
          >
            {t('common:cancel')}
          </Button>
          <Button
            onClick={handleSaveSpecification}
            disabled={!modalForm.characteristicId || !modalForm.providerType}
            className="ui-w-full"
          >
            {t('common:save')}
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  );
};
