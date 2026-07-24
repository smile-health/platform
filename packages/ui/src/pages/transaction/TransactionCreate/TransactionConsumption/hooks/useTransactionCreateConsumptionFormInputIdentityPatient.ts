import { useMemo } from 'react'
import { UseFormReturn } from "react-hook-form"
import { FormDataPatient } from "../transaction-consumption.type"
import { OptionType } from "#components/react-select"
import { clearField } from "#components/filter"
import { IDENTITY_TYPE_VALUE } from "../transaction-consumption.constant"

type Props = {
  methods: UseFormReturn<FormDataPatient>
  index: number
}
type RegisteredLocation =
  | 'province_residential'
  | 'regency_residential'
  | 'sub_district_residential'
  | 'village_residential'
  | 'residential_address'

export const useTransactionCreateConsumptionFormInputIdentityPatient = (props: Props) => {
  const {
    methods: { watch, setValue },
    index,
  } = props

  const disabledResidentialFields = !!watch(`data.${index}.identity.is_matched_address`)
  const dataIdentity = watch(`data.${index}.identity`)
  const identityType = watch(`data.${index}.vaccination.identity_type`)

  const handleCheckMathedAddress = (matched: boolean) => {
    if (matched) {
      setValue(`data.${index}.identity.province_residential`, dataIdentity.province)
      setValue(`data.${index}.identity.regency_residential`, dataIdentity.regency)
      setValue(`data.${index}.identity.sub_district_residential`, dataIdentity.sub_district)
      setValue(`data.${index}.identity.village_residential`, dataIdentity.village)
      setValue(`data.${index}.identity.residential_address`, dataIdentity.registered_address)
    }
  }

  const handleChangeLocation = (value: OptionType | string, type: RegisteredLocation) => {
    if (!dataIdentity.is_matched_address) return

    setValue(`data.${index}.identity.${type}`, value)

    const keyFieldReset: string[] = []
    if (type === 'province_residential') {
      keyFieldReset.push(
        `data.${index}.identity.regency_residential`,
        `data.${index}.identity.sub_district_residential`,
        `data.${index}.identity.village_residential`,
      )
    } else if (type === 'regency_residential') {
      keyFieldReset.push(
        `data.${index}.identity.sub_district_residential`,
        `data.${index}.identity.village_residential`,
      )
    } else if (type === 'sub_district_residential') {
      keyFieldReset.push(
        `data.${index}.identity.village_residential`,
      )
    } else if (type === 'village_residential') {
      // nothing to reset
    }

    if (keyFieldReset.length > 0) clearField({
      setValue,
      name: keyFieldReset,
    })
  }

  const setKeyField = (keys: string[]) => keys.join('-')

  const hideFieldRelatedIdentityNIK = useMemo(() =>
    identityType?.value === IDENTITY_TYPE_VALUE.NIK,
    [identityType?.value]
  )

  return {
    disabledResidentialFields,
    dataIdentity,
    handleCheckMathedAddress,
    setKeyField,
    handleChangeLocation,
    hideFieldRelatedIdentityNIK,
  }
}