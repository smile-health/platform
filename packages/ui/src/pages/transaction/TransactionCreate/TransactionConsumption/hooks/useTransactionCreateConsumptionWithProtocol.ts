import { useState } from 'react'
import { PHONE_REGEX, STATUS } from '#constants/common'

import {
  CreateTransactionConsumptionPatient,
  FormDataPatient,
  PatientIdentityProps,
} from '../transaction-consumption.type'
import { FieldErrors } from 'react-hook-form'
import {
  defaultDataFormVaccine,
  MAX_LIMIT_PATIENT_INTRA_DERMAL,
  REACTION_AFTER_DENGUE,
  VACCINE_PROTOCOL
} from '../transaction-consumption.constant'
import { useTranslation } from 'react-i18next'

type Props = {
  data: CreateTransactionConsumptionPatient[]
  errors: FieldErrors<FormDataPatient>
  protocol: number
}

export const useTransactionCreateConsumptionWithProtocol = ({
  item: parentItem, data, errors, protocol
}: PatientIdentityProps & Props) => {
  const { t } = useTranslation('transactionCreateConsumption')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const addNewPatient = (item: CreateTransactionConsumptionPatient[]) => {
    if (item && item?.length < MAX_LIMIT_PATIENT_INTRA_DERMAL) {
      const currentPatients = item ?? []
      currentPatients.push(defaultDataFormVaccine({
        isVaccine: parentItem.is_vaccine,
        isNeedSequence: STATUS.ACTIVE,
        protocol: parentItem.protocol_id,
        t,
        isKipi: parentItem.is_kipi,
        isMedicalHistory: parentItem.is_medical_history,
      }))
      setSelectedIndex((prev) => prev + 1)
      return currentPatients
    }
    return []
  }

  const removePatient = (
    index: number,
    item: CreateTransactionConsumptionPatient[]
  ) => {
    if (item && item?.length > 1 && index > -1) {
      const currentPatients = item
      currentPatients.splice(index, 1)
      setSelectedIndex(index - 1)
      return currentPatients
    }
    return []
  }

  const isDisabledAddPatient = (
    item: CreateTransactionConsumptionPatient[]
  ) => {
    let check: boolean = true

    const validatePhoneNumber = (text?: string | null) => {
      if (!text) return true

      return PHONE_REGEX.test(text)
    }

    check = item.some(
      (i) =>
        !i.vaccination?.identity_type?.value ||
        !i.vaccination?.patient_id ||
        !i.vaccination?.vaccine_sequence?.value ||
        !i.identity?.full_name ||
        !validatePhoneNumber(i.identity?.phone_number)
    )

    return check
  }

  const validateFormVaccine = () => {
    if (protocol === VACCINE_PROTOCOL.RABIES) {
      if (!data[selectedIndex]?.vaccination.is_need_sequence) {
        return !!data[selectedIndex]?.vaccination.patient_id
      }

      return !!(
        !!data[selectedIndex]?.vaccination.vaccine_sequence &&
        !errors.data?.[selectedIndex]?.vaccination
      )
    }

    if (protocol === VACCINE_PROTOCOL.DENGUE) {
      const otherReaction = data[selectedIndex]?.vaccination.reaction_id?.value === REACTION_AFTER_DENGUE.OTHERS
        ? !!data[selectedIndex]?.vaccination.other_reaction
        : true

      return !!(
        !!data[selectedIndex]?.vaccination.vaccine_sequence &&
        !errors.data?.[selectedIndex]?.vaccination &&
        !!data[selectedIndex]?.vaccination.reaction_id &&
        otherReaction
      )
    }

    if (!protocol) {
      return !!data[selectedIndex]?.vaccination.patient_id &&
        !errors.data?.[selectedIndex]?.vaccination
    }

    return false
  }

  const validateFormIdentity = () => {
    const dataIdentity = data[selectedIndex]?.identity

    const validatePhoneNumber = () => {
      if (!dataIdentity?.phone_number) return false

      return PHONE_REGEX.test(dataIdentity.phone_number)
    }

    return !!(
      dataIdentity?.full_name &&
      dataIdentity?.birth_date &&
      dataIdentity?.gender &&
      validatePhoneNumber()
    )
  }

  const isNotNullOrUndefined = <T>(value: T | null | undefined): value is T =>
    value !== null && value !== undefined;

  const validateFormDiseasesHistory = () => {
    const dataIdentity = data[selectedIndex]?.history_medical

    const dengueReceivedVaccine = dataIdentity?.is_dengue_before === 1 ?
      !!(!!dataIdentity?.last_dengue_diagnosis_month && !!dataIdentity?.last_dengue_diagnosis_year) :
      true

    return !!(
      isNotNullOrUndefined(dataIdentity?.is_dengue_before) !== null &&
      dengueReceivedVaccine &&
      isNotNullOrUndefined(dataIdentity?.dengue_received_vaccine)
    )
  }

  return {
    t,
    selectedIndex,
    setSelectedIndex,
    addNewPatient,
    removePatient,
    isDisabledAddPatient,
    validateFormVaccine,
    validateFormIdentity,
    validateFormDiseasesHistory,
  }
}
