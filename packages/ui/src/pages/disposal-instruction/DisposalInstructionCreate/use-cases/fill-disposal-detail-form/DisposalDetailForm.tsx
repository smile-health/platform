import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { reValidateQueryFetchInfiniteScroll } from '#components/infinite-scroll-list'
import {
  OptionType,
  ReactSelect,
  ReactSelectAsync,
} from '#components/react-select'
import { ProgramIntegrationClient } from '#constants/program'
import { USER_ROLE } from '#constants/roles'
import { loadEntities } from '#services/entity'
import { getUserStorage } from '#utils/storage/user'
import { useTranslation } from 'react-i18next'

import useEntityActivitesOption from '../../../../disposal/distribution-disposal/hooks/useEntityActivitiesOption'
import { loadDisposalInstructionTypeOptions } from '../../../disposal-instruction.service'
import { useDisposalInstructionCreate } from '../../DisposalInstructionCreateContext'
import { useMaterialSelection } from '../material-selection/useMaterialSelection'

export const DisposalDetailForm = () => {
  const user = getUserStorage()
  const { t } = useTranslation([
    'common',
    'disposalInstruction',
    'disposalInstructionCreate',
  ])
  const disposalInstructionCreate = useDisposalInstructionCreate()
  const materialSelection = useMaterialSelection()

  const disposalInstructionCreateFormErrors =
    disposalInstructionCreate.form.methods.formState.errors

  const { entityActivities: entityActivityOptions } = useEntityActivitesOption(
    disposalInstructionCreate.form.methods.watch('entity.value')
  )

  return (
    <div className="ui-w-full ui-px-6 ui-py-6 ui-border ui-border-gray-300 ui-rounded ui-flex ui-flex-col space-y-6">
      <div className="ui-font-semibold ui-text-gray-800">
        {t('disposalInstructionCreate:section.detail_form.title')}
      </div>

      <FormControl className="ui-space-y-2">
        <FormLabel>{t('common:form.entity.label')}</FormLabel>
        <ReactSelectAsync
          {...disposalInstructionCreate.form.methods.register('entity')}
          selectRef={
            disposalInstructionCreate.form.methods.register('entity').ref
          }
          name="entity"
          value={disposalInstructionCreate.form.methods.watch('entity')}
          id="entity"
          data-testid="entity"
          loadOptions={loadEntities}
          debounceTimeout={300}
          isClearable
          onChange={(option) => {
            disposalInstructionCreate.form.clean(() => {
              reValidateQueryFetchInfiniteScroll()
              disposalInstructionCreate.form.methods.setValue('entity', option)
              disposalInstructionCreate.form.methods.setValue('activity', null)
              materialSelection.removeAllMaterial()
            })
          }}
          menuPosition="fixed"
          disabled={user?.role === USER_ROLE.MANAGER}
          error={Boolean(disposalInstructionCreate.form.errors.entity)}
          additional={{
            page: 1,
            integration_client_id: ProgramIntegrationClient.WasteManagement,
          }}
        />
        {disposalInstructionCreate.form.errors.entity && (
          <FormErrorMessage>
            {disposalInstructionCreate.form.errors.entity.message}
          </FormErrorMessage>
        )}
      </FormControl>

      <FormControl className="ui-space-y-2">
        <FormLabel className="ui-capitalize" htmlFor="activity" required>
          {t('common:select_activity')}
        </FormLabel>
        <ReactSelect
          {...disposalInstructionCreate.form.methods.register('activity')}
          key={`activity_entity-${disposalInstructionCreate.form.methods.watch('entity.value')}`}
          id="activity"
          data-testid="activity"
          options={entityActivityOptions}
          value={disposalInstructionCreate.form.methods.watch('activity')}
          placeholder={t('common:select_activity')}
          onChange={(option: OptionType) => {
            disposalInstructionCreate.form.clean(() => {
              reValidateQueryFetchInfiniteScroll()
              disposalInstructionCreate.form.methods.setValue(
                'activity',
                option
              )
              materialSelection.removeAllMaterial()
            })
          }}
          menuPosition="fixed"
          error={Boolean(disposalInstructionCreate.form.errors.activity)}
        />
        {disposalInstructionCreate.form.errors.activity && (
          <FormErrorMessage>
            {disposalInstructionCreate.form.errors.activity.message}
          </FormErrorMessage>
        )}
        <p className="ui-text-neutral-500 ui-text-sm ui-italic">
          {t('disposalInstructionCreate:form.activity.info')}
        </p>
      </FormControl>

      <FormControl className="ui-space-y-2">
        <FormLabel className="ui-capitalize" htmlFor="activity" required>
          {t('disposalInstruction:field.disposal_instruction_type.label')}
        </FormLabel>
        <ReactSelectAsync
          {...disposalInstructionCreate.form.methods.register(
            'instruction_type'
          )}
          selectRef={
            disposalInstructionCreate.form.methods.register('instruction_type')
              .ref
          }
          id="instruction_type"
          data-testid="instruction_type"
          name="instruction_type"
          placeholder={t(
            'disposalInstruction:field.disposal_instruction_type.placeholder'
          )}
          value={disposalInstructionCreate.form.methods.watch(
            'instruction_type'
          )}
          loadOptions={loadDisposalInstructionTypeOptions}
          debounceTimeout={300}
          isClearable
          onChange={(option) => {
            disposalInstructionCreate.form.clean(() => {
              materialSelection.removeAllMaterial()
              disposalInstructionCreate.form.methods.setValue(
                'instruction_type',
                option
              )
              disposalInstructionCreate.form.methods.trigger()
            })
          }}
          menuPosition="fixed"
          error={Boolean(
            disposalInstructionCreate.form.errors.instruction_type
          )}
          additional={{ page: 1, paginate: 10 }}
        />
        {disposalInstructionCreate.form.errors.instruction_type && (
          <FormErrorMessage>
            {disposalInstructionCreate.form.errors.instruction_type.message}
          </FormErrorMessage>
        )}
      </FormControl>
    </div>
  )
}
