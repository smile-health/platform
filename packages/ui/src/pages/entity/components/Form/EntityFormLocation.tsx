import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { Input } from '#components/input'
import {
  LocationAncestor,
  LocationPicker,
} from '#components/modules/LocationPicker'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { TFormData, TFormValidationKeys } from '../../hooks/useEntityForm'

type Props = {
  // The entity's own root->leaf location chain (from its detail response),
  // used to pre-fill each dropdown's label when editing -- otherwise only
  // location_id itself would be populated and every level would render
  // empty until re-picked by hand.
  defaultLocations?: LocationAncestor[]
}

const EntityFormLocation = ({ defaultLocations }: Props) => {
  const { t } = useTranslation(['entity', 'common'])

  const {
    register,
    formState: { errors },
  } = useFormContext<TFormData>()

  return (
    <div className="ui-p-4 ui-border ui-border-neutral-300 ui-rounded">
      <div className="ui-mb-4 ui-font-bold">
        {t('entity:form.location.title')}
      </div>

      <div className="ui-grid ui-grid-cols-1 ui-gap-x-6 ui-gap-y-6">
        {/* This form is much narrower than e.g. the entity list filter
            panel, so side-by-side dropdowns (layout="row") end up too
            cramped -- stack them instead. No maxLevel here on purpose: the
            entity form should always show the full hierarchy, so it's left
            to default from the live-fetched depth rather than a hardcoded
            number that would silently go stale if a level is ever added. */}
        <LocationPicker
          name="location_id"
          layout="column"
          defaultLocations={defaultLocations}
        />
        <div className="ui-grid ui-grid-cols-2 ui-gap-x-6 ui-gap-y-6">
          <FormControl>
            <FormLabel>{t('entity:form.location.label.postal')}</FormLabel>
            <Input
              {...register('postal_code')}
              id="input-postal-code"
              placeholder={`${t('common:example')} : 61234`}
              maxLength={255}
            />
          </FormControl>
        </div>
        <FormControl>
          <FormLabel required>
            {t('entity:form.location.label.address')}
          </FormLabel>
          <Input
            {...register('address')}
            id="input-address"
            placeholder={t('entity:form.location.label.address')}
            maxLength={255}
          />
          {errors?.address?.message && (
            <FormErrorMessage>
              {t(errors?.address?.message as TFormValidationKeys)}
            </FormErrorMessage>
          )}
        </FormControl>
        <div className="ui-grid ui-grid-cols-2 ui-gap-x-6">
          <FormControl>
            <FormLabel>Latitude</FormLabel>
            <Input
              {...register('lat')}
              id="input-lat"
              placeholder={`${t('common:example')} : -6.1856307`}
              maxLength={255}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Longitude</FormLabel>
            <Input
              {...register('lng')}
              id="input-lng"
              placeholder={`${t('common:example')} : 106.8195533`}
              maxLength={255}
            />
          </FormControl>
        </div>
      </div>
    </div>
  )
}

export default EntityFormLocation
