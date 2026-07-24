import { Button } from '#components/button'
import { EmptyState } from '#components/empty-state'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { Input, InputSearch } from '#components/input'
import { InputColor } from '#components/input-color'
import { TextArea } from '#components/text-area'
import { FormProvider } from 'react-hook-form'

import {
  FormValidationKeys,
  useGlobalSettingProgramForm,
} from '../hooks/useGlobalSettingProgramForm'
import ProtocolItemWrapper from './ProtocolWrapper'
import { useTransactionBeneficiaryConfigFlag } from '#hooks/useTransactionBeneficiaryConfigFlag'

const ProgramForm: React.FC = () => {
  const {
    t,
    detailProgram,
    router,
    methodsForm,
    handleSubmit,
    onSubmitForm,
    isPending,
    isSuccess,
    disabled,
    handleChangeColor,
    filteredProtocols,
    keywordProtocol,
    setKeywordProtocol,
  } = useGlobalSettingProgramForm()
  const {
    showFieldProtocol
  } = useTransactionBeneficiaryConfigFlag()
  const {
    register,
    formState: { errors },
    watch,
    setValue,
    clearErrors,
  } = methodsForm

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    const filtered = raw.replace(/[^a-zA-Z0-9]/g, '')
    setValue('key', filtered)
    clearErrors('key')
  }

  const protocolsSelected = watch('protocols') || []

  const handleSelectProtocol = (protocolId: number) => {
    clearErrors('protocols')
    if (protocolsSelected.includes(protocolId)) {
      setValue(
        'protocols',
        protocolsSelected.filter((id) => id !== protocolId)
      )
    } else {
      setValue('protocols', [...protocolsSelected, protocolId])
    }
  }

  return (
    <FormProvider {...methodsForm}>
      <form
        onSubmit={handleSubmit(onSubmitForm)}
        className="ui-mt-6 ui-space-y-6 ui-max-w-form ui-mx-auto"
      >
        <div className="ui-p-4 ui-border ui-rounded">
          <div className="ui-grid ui-grid-cols-1 ui-gap-x-6 ui-gap-y-6">
            <FormControl>
              <FormLabel required>
                {t('programGlobalSettings:form.label.key')}
              </FormLabel>
              <Input
                {...register('key')}
                id="input-program-key"
                placeholder={`${t('common:example')} : immunization`}
                maxLength={100}
                disabled={disabled}
                onChange={handleInput}
                error={!!errors?.key?.message}
              />
              {errors?.key?.message && (
                <FormErrorMessage>
                  {t(errors?.key?.message as FormValidationKeys)}
                </FormErrorMessage>
              )}
            </FormControl>
            <FormControl>
              <FormLabel required>
                {t('programGlobalSettings:form.label.name')}
              </FormLabel>
              <Input
                {...register('name')}
                id="input-program-name"
                placeholder={`${t('common:example')} : Immunization`}
                maxLength={100}
                error={!!errors?.name?.message}
                className="ui-uppercase"
              />
              {errors?.name?.message && (
                <FormErrorMessage>
                  {t(errors?.name?.message as FormValidationKeys)}
                </FormErrorMessage>
              )}
            </FormControl>
            <FormControl>
              <FormLabel>
                {t('programGlobalSettings:form.label.description')}
              </FormLabel>
              <div className="ui-w-full">
                <TextArea
                  {...register('description')}
                  id="input-program-description"
                  placeholder={t(
                    'programGlobalSettings:form.placeholder.description'
                  )}
                  maxLength={150}
                />
                <p className="ui-justify-self-end ui-text-sm ui-font-normal ui-text-neutral-500">
                  {watch('description')?.length}/150
                </p>
              </div>
            </FormControl>
            {/* hide for release phase 1
            <FormControl>
              <FormLabel required>
                {t('programGlobalSettings:form.label.classification_material')}
              </FormLabel>
              <RadioGroup>
                <Radio
                  id="radio-material-is-hierarchical"
                  value={1}
                  checked={Number(watch('is_hierarchy_enabled')) === 1}
                  label={t('programGlobalSettings:form.options.classification_material.hierarchy')}
                  disabled={disabled}
                  onChange={() => handleChangeHierarchy(1)}
                />
                <Radio
                  id="radio-material-is-not-hierarchical"
                  value={0}
                  checked={Number(watch('is_hierarchy_enabled')) === 0}
                  label={t('programGlobalSettings:form.options.classification_material.non_hierarchy')}
                  disabled={disabled}
                  onChange={() => handleChangeHierarchy(0)}
                />
              </RadioGroup>
              {errors?.is_hierarchy_enabled?.message && (
                <FormErrorMessage>
                  {t(errors?.is_hierarchy_enabled?.message as FormValidationKeys)}
                </FormErrorMessage>
              )}
            </FormControl> */}
            <FormControl>
              <FormLabel required>
                {t('programGlobalSettings:form.label.color')}
              </FormLabel>
              <InputColor
                {...register('color')}
                id="input-program-color"
                value={watch('color')}
                onChange={handleChangeColor}
                error={!!errors?.color?.message}
              />
              {errors?.color?.message && (
                <FormErrorMessage>
                  {t(errors?.color?.message as FormValidationKeys)}
                </FormErrorMessage>
              )}
            </FormControl>

            {showFieldProtocol && (
              <FormControl>
                <FormLabel>
                  {t('programGlobalSettings:form.label.protocol')}
                </FormLabel>
                <InputSearch
                  placeholder={t(
                    'programGlobalSettings:form.placeholder.protocol'
                  )}
                  defaultValue={keywordProtocol}
                  onChange={(e) => setKeywordProtocol(e.target.value)}
                />
                {errors?.protocols?.message && (
                  <FormErrorMessage>
                    {t(errors?.protocols?.message as FormValidationKeys)}
                  </FormErrorMessage>
                )}
                <div className="ui-grid ui-grid-cols-1 ui-gap-2 ui-mt-4 ui-max-h-96 ui-overflow-auto">
                  {filteredProtocols?.map((protocol) => {
                    const isChecked = protocolsSelected.includes(protocol.id)
                    const isSelected =
                      disabled &&
                      detailProgram?.protocols.some(
                        (selectedProtocol) => selectedProtocol.id === protocol.id
                      )

                    return (
                      <ProtocolItemWrapper
                        key={protocol?.id}
                        protocol={protocol}
                        isChecked={isChecked}
                        disabled={isSelected || false}
                        onChange={handleSelectProtocol}
                      />
                    )
                  })}

                  {filteredProtocols?.length === 0 ? (
                    <EmptyState
                      title={t('common:message.empty.title')}
                      description={t('common:message.empty.description')}
                      withIcon
                      className="ui-h-[480px]"
                    />
                  ) : null}
                </div>
              </FormControl>
            )}
          </div>
        </div>

        <div className="ui-flex ui-justify-end">
          <div className="ui-grid ui-grid-cols-2 ui-w-[300px] ui-gap-2">
            <Button
              id="btn-back-program"
              type="button"
              variant="outline"
              onClick={() => router.back()}
              loading={isPending}
            >
              {t('common:back')}
            </Button>
            <Button
              id="btn-submit-program"
              type="submit"
              loading={isPending}
              disabled={isSuccess}
            >
              {t('common:save')}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}

export default ProgramForm
