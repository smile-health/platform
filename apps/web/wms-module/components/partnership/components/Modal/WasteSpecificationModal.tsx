import { WasteCassificationPartnership } from '@/types/partnership';
import { Button } from '@repo/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '@repo/ui/components/dialog';
import { FormControl, FormLabel } from '@repo/ui/components/form-control';
import { InputNumberV2 } from '@repo/ui/components/input-number-v2';
import {
  OptionType,
  OptionTypeWithData,
  ReactSelect,
} from '@repo/ui/components/react-select';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface WasteSpecificationModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  editIndex: number | null;
  modalForm: {
    type: string;
    typeLabel: string;
    group: string;
    groupLabel: string;
    characteristic: string;
    characteristicLabel: string;
    classification: string;
    pricePerKg: string;
  };
  setModalForm: (form: any) => void;
  handleSaveSpecification: () => void;
  wasteTypeOption?: OptionType[];
  wasteGroupOption?: OptionType[];
  wasteCharacteristicOption?: OptionType[];
  control: any;
  setValue: any;
}

export const WasteSpecificationModal = ({
  showModal,
  setShowModal,
  editIndex,
  modalForm,
  setModalForm,
  handleSaveSpecification,
  wasteTypeOption,
  wasteGroupOption,
  wasteCharacteristicOption,
  control,
  setValue,
}: WasteSpecificationModalProps) => {
  const { t } = useTranslation(['partnership', 'common']);
  const handleWasteTypeChange = (option: OptionType | null) => {
    const newValue = option?.value || '';
    const newLabel = option?.label || '';
    setModalForm({
      ...modalForm,
      type: newValue,
      typeLabel: newLabel,
      group: '',
      groupLabel: '',
      characteristic: '',
      characteristicLabel: '',
      classification: '',
    });

    setValue('modalSpecification.type', newValue);
    setValue('modalSpecification.typeLabel', newLabel);
    setValue('modalSpecification.group', '');
    setValue('modalSpecification.groupLabel', '');
    setValue('modalSpecification.characteristic', '');
    setValue('modalSpecification.characteristicLabel', '');
    setValue('modalSpecification.classification', '');
  };

  const handleWasteGroupChange = (option: OptionType | null) => {
    const newValue = option?.value || '';
    const newLabel = option?.label || '';
    setModalForm({
      ...modalForm,
      group: newValue,
      groupLabel: newLabel,
      characteristic: '',
      characteristicLabel: '',
      classification: '',
    });

    setValue('modalSpecification.group', newValue);
    setValue('modalSpecification.groupLabel', newLabel);
    setValue('modalSpecification.characteristic', '');
    setValue('modalSpecification.characteristicLabel', '');
    setValue('modalSpecification.classification', '');
  };

  const handleWasteCharacteristicChange = (
    option: OptionTypeWithData<WasteCassificationPartnership> | null
  ) => {
    const newValue = option?.value || '';
    const newLabel = option?.label || '';
    const newClassificationId = option?.data?.wasteClassificationId || '';
    setModalForm({
      ...modalForm,
      characteristic: newValue,
      characteristicLabel: newLabel,
      classification: newClassificationId,
    });

    setValue('modalSpecification.characteristic', newValue);
    setValue('modalSpecification.characteristicLabel', newLabel);
    setValue('modalSpecification.classification', newClassificationId);
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal} size="lg">
      <DialogHeader className="ui-text-center ui-pr-0">
        <span className="ui-font-medium">
          {editIndex !== null
            ? t('partnership:list.button.edit_specification')
            : t('partnership:list.button.add_specification')}
        </span>
      </DialogHeader>
      <div className="ui-h-1 ui-border-t ui-border-neutral-300" />
      <DialogContent className="ui-overflow-visible ui-my-2 ui-py-2 styled-scroll ui-scroll-pr-2">
        <div className="ui-space-y-6">
          <Controller
            name="modalSpecification.type"
            control={control}
            render={() => (
              <FormControl>
                <FormLabel htmlFor="select-waste-type" required>
                  {t('partnership:form.waste_type.label')}
                </FormLabel>
                <ReactSelect
                  id="select-waste-type"
                  placeholder={t('partnership:form.waste_type.placeholder')}
                  options={wasteTypeOption}
                  value={
                    modalForm.type
                      ? wasteTypeOption?.find(
                          (x) => x.value === Number(modalForm.type)
                        )
                      : null
                  }
                  onChange={handleWasteTypeChange}
                  isClearable
                />
              </FormControl>
            )}
          />

          <Controller
            name="modalSpecification.group"
            control={control}
            render={() => (
              <FormControl>
                <FormLabel htmlFor="select-waste-group" required>
                  {t('partnership:form.waste_group.label')}
                </FormLabel>
                <ReactSelect
                  id="select-waste-group"
                  placeholder={t('partnership:form.waste_group.placeholder')}
                  options={wasteGroupOption}
                  value={
                    modalForm.group
                      ? wasteGroupOption?.find(
                          (x) => x.value === Number(modalForm.group)
                        )
                      : null
                  }
                  onChange={handleWasteGroupChange}
                  isClearable
                  disabled={!modalForm.type}
                />
              </FormControl>
            )}
          />

          <Controller
            name="modalSpecification.characteristic"
            control={control}
            render={() => (
              <FormControl>
                <FormLabel htmlFor="select-waste-characteristic">
                  {t('partnership:form.waste_characteristic.label')}
                </FormLabel>
                <ReactSelect
                  id="select-waste-characteristic"
                  placeholder={t(
                    'partnership:form.waste_characteristic.placeholder'
                  )}
                  options={wasteCharacteristicOption}
                  value={
                    modalForm.characteristic
                      ? wasteCharacteristicOption?.find(
                          (x) => x.value === Number(modalForm.characteristic)
                        )
                      : null
                  }
                  onChange={handleWasteCharacteristicChange}
                  isClearable
                  disabled={!modalForm.group}
                />
                {editIndex === null && (
                  <div className="ui-text-sm ui-text-blue-700 ui-mt-1">
                    {t('partnership:form.help_text_characteristic')}
                  </div>
                )}
              </FormControl>
            )}
          />

          <FormControl>
            <FormLabel htmlFor="input-price-per-kg" required>
              {t('partnership:form.price_kg.label')}
            </FormLabel>
            <InputNumberV2
              id="pricePerKg"
              placeholder="0"
              value={modalForm.pricePerKg}
              min={0}
              onValueChange={(values) => {
                setModalForm({
                  ...modalForm,
                  pricePerKg: values.floatValue?.toString(),
                });
              }}
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
            disabled={
              !modalForm.type || !modalForm.group || !modalForm.pricePerKg
            }
            className="ui-w-full"
          >
            {t('common:save')}
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  );
};
