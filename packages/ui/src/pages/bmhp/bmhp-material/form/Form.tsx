// pages/bmhp-material/form.tsx
import React from 'react'
import { toast } from '#components/toast'
import useSmileRouter from '#hooks/useSmileRouter'
import { UseFormBuilderSchema } from '#pages/bmhp/hooks/useFormBuilder'
import MasterFormPage from '#pages/bmhp/master/form/MasterFormPage'
import { ErrorResponse } from '#types/common'
import { isAxiosError } from 'axios'
import { TFunction } from 'i18next'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import * as Yup from 'yup'

import { CreateBmhpMaterialBody } from '../bmhp-material.types'
import { getBmhpMaterialDetail } from '../detail'
import {
  createBmhpMaterial,
  listMasterMaterial,
  listMasterVariant,
  updateBmhpMaterial,
} from './form.service'

const BMHPMaterialValidationSchema = (t: TFunction<['common', 'masterBmhp']>) =>
  Yup.object({
    name: Yup.string().required(t('masterBmhp:validation.name.required')),
    description: Yup.string().optional().nullable(),
    // is_active: Yup.string().min(
    //   1,
    //   t('masterBmhp:validation.is_active.required')
    // ),
    material_details: Yup.array().min(
      1,
      t('masterBmhp:validation.material_details.min')
    ),
  })

type MaterialOption = {
  value: string | number
  label: string
  material_level_id: number
  test_qty?: number
  unit_name?: string
  unit_of_consumption_name?: string
}

interface BMHPMaterialForm {
  name: string
  description: string
  is_active: string
  material_details?: MaterialOption[]
  material_variant_details?: MaterialOption[]
  material_variant_qty?: Record<string, number>
}

const MaterialVariantTable = () => {
  const { t } = useTranslation(['common', 'masterBmhp'])
  const { watch, setValue } = useFormContext()
  const [variants, setVariants] = React.useState<MaterialOption[]>([])
  const [loading, setLoading] = React.useState(false)
  const isInitialMount = React.useRef(true)
  const prevMaterialIds = React.useRef<string>('')

  // Watch material_details
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const materialDetails: MaterialOption[] = watch('material_details') || []

  // Memoize material IDs to prevent unnecessary re-fetches
  const materialIds = React.useMemo(
    () => materialDetails.map((item) => item.value).join(','),
    [materialDetails]
  )

  // Fetch variants when material_details changes
  React.useEffect(() => {
    const fetchVariants = async () => {
      // Skip if no materials selected
      if (materialDetails.length === 0) {
        setVariants([])
        setValue('material_variant_details', [])
        return
      }

      // Get existing variant details from form
      const existingVariantDetails = watch('material_variant_details') || []

      // Check if this is initial mount with existing data (edit mode)
      // Skip fetching if we already have variant data and nothing has changed
      if (isInitialMount.current && existingVariantDetails.length > 0) {
        // Use existing variant data for display
        setVariants(existingVariantDetails)
        isInitialMount.current = false
        prevMaterialIds.current = materialIds
        return
      }

      // Check if materials actually changed
      const materialsChanged = prevMaterialIds.current !== materialIds

      // Skip fetch if nothing changed
      if (!isInitialMount.current && !materialsChanged) {
        return
      }

      // Update refs
      prevMaterialIds.current = materialIds
      isInitialMount.current = false

      setLoading(true)
      try {
        // Use listMasterVariant with type=2
        const response = await listMasterVariant({
          material_level_id: '3',
          material_ids: materialDetails.map((item) => String(item.value)),
          type: 2,
        })

        // Extract variants from response
        const allVariants: MaterialOption[] = []
        if (response.data && response.data.length > 0) {
          response.data.forEach(
            (variant: {
              id: number
              name: string
              qty: number
              parent_id: number
              material_level_id: number
              unit_id: number
              unit_name: string
              unit_of_consumption_name?: string
            }) => {
              allVariants.push({
                value: variant.id,
                label: variant.name,
                material_level_id: variant.material_level_id,
                test_qty: variant.qty,
                unit_name: variant.unit_name,
                unit_of_consumption_name: variant.unit_of_consumption_name,
              })
            }
          )
        }

        // Remove duplicates based on material_id
        const uniqueVariants = Array.from(
          new Map(allVariants.map((item) => [item.value, item])).values()
        )

        setVariants(uniqueVariants)
        // Store variants in form for submission
        setValue('material_variant_details', uniqueVariants)

        // Initialize qty map with 0 for all variants
        const qtyMap: Record<string, number> = {}
        uniqueVariants.forEach((variant) => {
          qtyMap[variant.value] = 0
        })
        setValue('material_variant_qty', qtyMap)
      } catch (error) {
        console.error('Error fetching variants:', error)
        setVariants([])
        setValue('material_variant_details', [])
      } finally {
        setLoading(false)
      }
    }

    fetchVariants()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materialIds, setValue])

  // Collect level 3 items from material_details + fetched variants
  const level3FromDetails = materialDetails.filter(
    (item) => item.material_level_id === 3
  )
  const tableItems = [...level3FromDetails, ...variants]

  if (tableItems.length === 0) return null

  return (
    <div className="ui-border ui-border-[#d2d2d2] ui-rounded ui-overflow-hidden">
      {loading && (
        <div className="ui-p-4 ui-text-center ui-text-sm ui-text-gray-500">
          {t('masterBmhp:message.loading_variant')}
        </div>
      )}
      {!loading && (
        <table className="ui-w-full">
          <thead>
            <tr className="ui-bg-gray-50 ui-border-b ui-border-[#d2d2d2]">
              <th className="ui-px-4 ui-py-3 ui-text-left ui-text-sm ui-font-medium ui-text-gray-600">
                {t('masterBmhp:label.variants')}
              </th>
              <th className="ui-px-4 ui-py-3 ui-text-left ui-text-sm ui-font-medium ui-text-gray-600 ui-w-32">
                {t('masterBmhp:label.quantity')}
              </th>
              <th className="ui-px-4 ui-py-3 ui-text-left ui-text-sm ui-font-medium ui-text-gray-600 ui-w-32">
                {t('masterBmhp:label.unit')}
              </th>
            </tr>
          </thead>
          <tbody>
            {tableItems.map((variant) => (
              <tr
                key={variant.value}
                className="ui-border-b ui-border-[#d2d2d2] last:ui-border-b-0"
              >
                <td className="ui-px-4 ui-py-3 ui-text-sm">{variant.label}</td>
                <td className="ui-px-4 ui-py-3 ui-text-sm">
                  {variant.test_qty ?? '0'}
                </td>
                <td className="ui-px-4 ui-py-3 ui-text-sm ui-capitalize">
                  {variant.unit_of_consumption_name ?? variant.unit_name ?? '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

const fields = (
  t: TFunction<['common', 'masterBmhp']>,
  year_id: number
): UseFormBuilderSchema => {
  return [
    {
      type: 'text',
      name: 'name',
      label: t('masterBmhp:label.name'),
      placeholder: t('masterBmhp:placeholder.name'),
      required: true,
      id: 'input-name',
      className: 'ui-mb-4',
    },
    {
      type: 'select-async-paginate',
      name: 'material_details',
      label: t('masterBmhp:label.materials'),
      placeholder: t('masterBmhp:placeholder.materials'),
      required: true,
      isMulti: true,
      clearOnChangeFields: [],
      loadOptions: async (
        search: string,
        _: unknown,
        additional: { page: number }
      ) => {
        const paramsFilter = {
          page: additional?.page || 1,
          paginate: 100,
          keyword: search || '',
          program_plan_id: year_id,
        }

        const result = await listMasterMaterial(paramsFilter)
        return {
          options: result.data.map((x: { id: number; name: string }) => ({
            value: x.id,
            label: x.name,
          })),
          hasMore: result.data.length >= 100,
          additional: {
            page: (additional?.page || 1) + 1,
          },
        }
      },
      additional: {
        page: 1,
      },
    },
    {
      type: 'component',
      name: 'material_variant_table',
      component: <MaterialVariantTable />,
    },
    {
      type: 'textarea',
      name: 'description',
      label: t('masterBmhp:label.description'),
      placeholder: t('masterBmhp:placeholder.description'),
      required: false,
      id: 'input-description',
      className: 'ui-mb-4',
      rows: 4,
    },
    // {
    //   type: 'radio',
    //   name: 'is_active',
    //   label: t('masterBmhp:common.active'),
    //   required: false,
    //   className: 'ui-mb-4',
    //   options: [
    //     { label: t('masterBmhp:common.active'), value: '1' },
    //     { label: t('masterBmhp:common.inactive'), value: '0' },
    //   ],
    // },
  ]
}

const BMHPMaterialFormPage = () => {
  const { t } = useTranslation(['common', 'masterBmhp'])
  const router = useSmileRouter()
  const { year_id } = router.query

  const handleSubmit = async (data: BMHPMaterialForm, id?: string) => {
    const variantQty = data.material_variant_qty || {}
    const newdata: CreateBmhpMaterialBody = {
      ...data,
      is_active: true,
      // is_active: data.is_active === '1',
      material_details:
        data.material_details?.map((item) => ({
          material_id: Number(item.value),
          material_level_id: item.material_level_id,
          qty: Number(variantQty[item.value]) || 0,
        })) || [],
      program_plan_id: Number(year_id),
    }
    // Call your API here
    try {
      if (id) {
        await updateBmhpMaterial({ id, ...newdata })
        toast.success({
          title: t('common:message.success.update', {
            type: t('masterBmhp:title.bmhp_material'),
          }),
        })
      } else {
        await createBmhpMaterial(newdata)
        toast.success({
          title: t('common:message.success.add', {
            type: t('masterBmhp:title.bmhp_material'),
          }),
        })
      }
      router.push(`/v5/bmhp-planning/${year_id}/material`)
    } catch (error) {
      console.error('Error submitting form:', error)
      if (isAxiosError(error)) {
        toast.danger({
          description:
            (error?.response?.data as ErrorResponse).message ??
            t(
              id
                ? 'common:message.failed.update'
                : 'common:message.failed.create',
              {
                type: t('masterBmhp:title.bmhp_material'),
              }
            ),
        })
      }
    }
  }

  const fetchData = async (id: string): Promise<BMHPMaterialForm> => {
    const data = await getBmhpMaterialDetail(id)

    const variantQtyMap: Record<string, number> = {}
    data.material_variant_details?.forEach((item) => {
      variantQtyMap[item.material_variant_id] = item.test_qty
    })

    // Prepare material_variant_details with proper structure
    const variantDetails: MaterialOption[] =
      data.material_variant_details?.map((item) => ({
        value: item.material_id,
        label: item.name,
        material_level_id: 3,
        test_qty: item.test_qty,
        unit_name: item.unit_name,
      })) || []

    return {
      name: data.name,
      description: data.description,
      is_active: data.is_active === 1 ? '1' : '0',
      material_details: data.material_details?.map((item) => ({
        value: item.material_id,
        label: item.name,
        material_level_id: 2,
      })),
      material_variant_details: variantDetails,
      material_variant_qty: variantQtyMap,
    } as BMHPMaterialForm
  }

  return (
    <MasterFormPage<BMHPMaterialForm>
      permission="master-bmhp-view"
      title={t('masterBmhp:title.bmhp_material')}
      validation={BMHPMaterialValidationSchema(t)}
      initialValues={{
        name: '',
        description: '',
        is_active: '',
        material_details: [],
        material_variant_qty: {},
      }}
      fields={fields(t, Number(year_id))}
      onSubmit={handleSubmit}
      fetchData={fetchData}
    />
  )
}

export default BMHPMaterialFormPage
