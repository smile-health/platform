import React from 'react'
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
} from '#components/form-control'
import { InputNumber } from '#components/input-number'
import { Controller, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { VariantItem } from '../bmhp-method.types'
import { listMasterVariant } from './form.service'

interface VariantInputProps {
  name?: string
  label?: string
}

interface VariantOption {
  id: number
  name: string
  qty?: number
  unit_id?: number
  unit_name?: string
}

export default function VariantInput({
  name = 'variants',
  label,
}: VariantInputProps) {
  const { t } = useTranslation(['masterBmhp', 'common'])
  const {
    control,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext()

  const [variants, setVariants] = React.useState<VariantOption[]>([])
  const [loading, setLoading] = React.useState(false)
  const isInitialMount = React.useRef(true)
  const prevMaterialId = React.useRef<number | null>(null)
  const prevIsVariant = React.useRef<string | null>(null)

  const bmhpMaterialId = watch('bmhp_material_id')
  const isVariant = watch('is_variant')

  // Fetch variants when material changes
  React.useEffect(() => {
    const fetchVariants = async () => {
      const materialId =
        typeof bmhpMaterialId === 'object'
          ? bmhpMaterialId?.value
          : bmhpMaterialId

      if (!materialId) {
        setVariants([])
        setValue(name, [])
        return
      }

      // Don't hit the API until is_variant is explicitly selected
      if (isVariant !== 'true' && isVariant !== 'false') {
        setVariants([])
        return
      }

      // Get existing variants BEFORE clearing (for edit mode)
      const existingVariants = watch(name) || []

      // Check if this is initial mount with existing data (edit mode)
      // Skip fetching if we already have variant data and nothing has changed
      if (isInitialMount.current && existingVariants.length > 0) {
        // Set variants state from existing form data for display
        const displayVariants = existingVariants.map((v: VariantItem) => ({
          id: v.material_id,
          name: v.name,
          qty: v.test_qty,
          unit_id: v.unit_id,
        }))
        setVariants(displayVariants)
        isInitialMount.current = false
        prevMaterialId.current = materialId
        prevIsVariant.current = isVariant
        return
      }

      // Check if material or is_variant actually changed
      const materialChanged = prevMaterialId.current !== materialId
      const isVariantChanged = prevIsVariant.current !== isVariant

      // Skip fetch if nothing changed
      if (!isInitialMount.current && !materialChanged && !isVariantChanged) {
        return
      }

      // Update refs
      prevMaterialId.current = materialId
      prevIsVariant.current = isVariant
      isInitialMount.current = false

      setLoading(true)
      try {
        // Always fetch from variant-material endpoint, passing is_variant as param
        const isVariantNum = isVariant === 'true' ? 1 : 0
        const response = await listMasterVariant({
          material_level_id: '3',
          material_ids: [String(materialId)],
          type: 1,
          is_variant: isVariantNum,
        })

        const variantOptions: VariantOption[] = response.data.map(
          (item: {
            id: number
            name: string
            qty?: number
            unit_id?: number
            unit_name?: string
          }) => ({
            id: item.id,
            name: item.name,
            qty: item.qty,
            unit_id: item.unit_id,
            unit_name: item.unit_name,
          })
        )

        // Remove duplicates based on id using Map
        const uniqueVariants = Array.from(
          new Map(variantOptions.map((item) => [item.id, item])).values()
        )

        setVariants(uniqueVariants)

        // Initialize form values for fetched variants
        const initializedVariants = uniqueVariants.map((variant) => {
          // Check if variant already exists in form (for edit mode)
          const existing = existingVariants.find(
            (v: VariantItem) => v.material_id === variant.id
          )
          return (
            existing || {
              material_id: variant.id,
              name: variant.name,
              test_qty: variant.qty || 0,
              unit_id: variant.unit_id || 0,
            }
          )
        })

        setValue(name, initializedVariants)
      } catch (error) {
        console.error('Error fetching variants:', error)
        setVariants([])
        setValue(name, [])
      } finally {
        setLoading(false)
      }
    }

    fetchVariants()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bmhpMaterialId, isVariant, setValue, name])

  const variantsError = errors?.variants as { message?: string } | undefined

  return (
    <FormControl className="ui-mb-4">
      <FormLabel required>{label || t('masterBmhp:label.variants')}</FormLabel>
      {variantsError?.message && (
        <FormErrorMessage className="ui-mb-2">
          {variantsError.message}
        </FormErrorMessage>
      )}
      {loading && (
        <div className="ui-p-4 ui-text-center ui-text-sm ui-text-gray-500 ui-border ui-border-gray-200 ui-rounded">
          {t('masterBmhp:message.loading_variant')}
        </div>
      )}
      {!loading && variants.length === 0 && !bmhpMaterialId && (
        <div className="ui-p-4 ui-text-center ui-text-sm ui-text-gray-500 ui-border ui-border-gray-200 ui-rounded">
          {t('masterBmhp:message.please_select_a_material')}
        </div>
      )}
      {!loading && variants.length === 0 && bmhpMaterialId && (
        <div className="ui-p-4 ui-text-center ui-text-sm ui-text-gray-500 ui-border ui-border-gray-200 ui-rounded">
          {t('masterBmhp:message.no_variant_found_for_selected')}
        </div>
      )}
      {!loading && variants.length > 0 && (
        <div className="ui-mb-3 ui-border ui-border-gray-200 ui-rounded ui-overflow-visible">
          <table className="ui-w-full ui-text-sm">
            <thead className="ui-bg-gray-50 ui-border-b ui-border-gray-200">
              <tr>
                <th className="ui-px-3 ui-py-2 ui-text-left ui-font-medium ui-text-gray-600">
                  {t('masterBmhp:label.variant_name')}
                </th>
                <th className="ui-px-3 ui-py-2 ui-text-left ui-font-medium ui-text-gray-600 ui-w-32">
                  {t('masterBmhp:label.test_qty')}
                </th>
                <th className="ui-px-3 ui-py-2 ui-text-left ui-font-medium ui-text-gray-600 ui-w-48">
                  {t('masterBmhp:label.unit')}
                </th>
              </tr>
            </thead>
            <tbody>
              {variants.map((variant, index) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const fieldErrors = (errors?.variants as any)?.[index] as
                  | {
                      name?: { message?: string }
                      test_qty?: { message?: string }
                      unit_id?: { message?: string }
                    }
                  | undefined

                return (
                  <tr
                    key={variant.id}
                    className="ui-border-b last:ui-border-b-0 ui-border-gray-100"
                  >
                    <td className="ui-px-3 ui-py-3 ui-text-gray-700">
                      {variant.name}
                      {/* Hidden field to store variant id */}
                      <Controller
                        control={control}
                        name={`${name}.${index}.material_id`}
                        render={({ field: inputField }) => (
                          <input
                            {...inputField}
                            type="hidden"
                            value={variant.id}
                          />
                        )}
                      />
                      {/* Hidden field to store variant name */}
                      <Controller
                        control={control}
                        name={`${name}.${index}.name`}
                        render={({ field: inputField }) => (
                          <input
                            {...inputField}
                            type="hidden"
                            value={variant.name}
                          />
                        )}
                      />
                    </td>
                    <td className="ui-px-1 ui-py-2">
                      <Controller
                        control={control}
                        name={`${name}.${index}.test_qty`}
                        render={({ field: inputField }) => (
                          <FormControl>
                            <InputNumber
                              {...inputField}
                              placeholder="0"
                              minValue={0}
                              onChange={(e) => inputField.onChange(Number(e))}
                            />
                            {fieldErrors?.test_qty?.message && (
                              <FormErrorMessage>
                                {fieldErrors.test_qty.message}
                              </FormErrorMessage>
                            )}
                          </FormControl>
                        )}
                      />
                    </td>
                    <td className="ui-px-1 ui-py-2 ui-pr-2">
                      <div className="ui-px-3 ui-py-3 ui-text-gray-700">
                        {variant.unit_name ||
                          watch(`${name}.${index}.unit_name`) ||
                          '-'}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </FormControl>
  )
}
