import { FormDataPatient, ListVaccineSequenceByProtocolResponse, PatientIdentityNIK, PatientLocation, PatienVaccineSequence } from "../transaction-consumption.type"
import { OptionType } from "#components/react-select"
import { defaultDataHistoryMedical, defaultDataIdentity, VACCINE_PROTOCOL } from "../transaction-consumption.constant"
import { toast } from "#components/toast"
import { useTranslation } from "react-i18next"
import { useLoadingPopupStore } from "#store/loading.store"
import { fetchDataPatientLocation, fetchDataPatientNIK, fetchDataPatientSequence, parseNIK } from "../utils/helpers"
import { handleSetDataHistoryMedical, handleSetDataIdentity } from "../utils/form"
import { useContext, useState } from "react"
import { ProtocolContext } from "../context/ProtocolContext"
import { getListVaccineSequenceByProtocol } from "../transaction-consumption.service"

type Props = {
  setDataHistory: (dataPatienHistory: PatienVaccineSequence | null, dataSequence?: ListVaccineSequenceByProtocolResponse['data'] | null) => Promise<void> | void
  firstPatient?: FormDataPatient['data'][0]['vaccination']
}

type ResetDataPatientParams = {
  gender: OptionType | null,
  birthDate: string | null,
  isDengue?: boolean,
  patientLocation?: PatientLocation | null
}

export const useProtocolVaccine = (props: Props) => {
  const { methods, index, protocolId } = useContext(ProtocolContext)
  const { setDataHistory, firstPatient } = props
  const { watch, setValue, clearErrors, formState: { errors } } = methods
  const { t, i18n: { language } } = useTranslation('transactionCreateConsumption')
  const { setLoadingPopup } = useLoadingPopupStore()
  const [warningSkipSequence, setWarningSkipSequence] = useState<{
    open: boolean, description: string, callback: () => void
  }>({ open: false, description: '', callback: () => { } })

  const handleFetchVaccineSequence = async (patientId: string) => {
    if (!protocolId) return null

    try {
      const response = await getListVaccineSequenceByProtocol(protocolId, patientId)

      setValue(`data.${index}.vaccination.options_sequence`, response.data)

      return response.data
    } catch (error) {
      console.error(error)

      return null
    }
  }

  const resetDataPatient = ({
    gender,
    birthDate,
    isDengue,
    patientLocation,
  }: ResetDataPatientParams) => {
    const newDataPatient = {
      ...defaultDataIdentity,
      gender,
      birth_date: birthDate,
      ...patientLocation?.province?.id && {
        province: { value: patientLocation?.province?.id, label: patientLocation?.province?.name },
      },
      ...patientLocation?.regency?.id && {
        regency: { value: patientLocation?.regency?.id, label: patientLocation?.regency?.name },
      },
      ...patientLocation?.subdistrict?.id && {
        sub_district: { value: patientLocation?.subdistrict?.id, label: patientLocation?.subdistrict?.name },
      },
    }

    setValue(`data.${index}.identity`, newDataPatient)
    clearErrors(`data.${index}.identity`)

    setValue(`data.${index}.patient`, undefined)

    if (isDengue) {
      setValue(`data.${index}.history_medical`, defaultDataHistoryMedical)
      clearErrors(`data.${index}.history_medical`)
    }
  }

  const setDataIdentity = async (dataPatientNIK: PatientIdentityNIK | null, patientId: string, isDengue?: boolean) => {
    if (dataPatientNIK) {
      handleSetDataIdentity({ index, setValue, clearErrors, t, data: dataPatientNIK })
      if (isDengue && dataPatientNIK.medical_history) {
        handleSetDataHistoryMedical({ index, setValue, clearErrors, data: dataPatientNIK.medical_history })
      }
    } else {
      const dataFromNik = parseNIK(patientId, language, t)

      if (dataFromNik.valid) {
        const genderLabel = t('patient_identity.identity.gender.options', { returnObjects: true })

        const generateFromNik = {
          gender: dataFromNik.gender === 'male' ? { value: 1, label: genderLabel[0] } : { value: 2, label: genderLabel[1] },
          birth_date: dataFromNik.birth_date,
        }

        const patientLocation = await fetchDataPatientLocation(patientId)

        setValue(`data.${index}.generate_from_nik`, generateFromNik)
        resetDataPatient({
          gender: generateFromNik.gender,
          birthDate: dataFromNik.raw_birth_date ?? null,
          isDengue,
          patientLocation,
        })
      } else {
        setValue(`data.${index}.generate_from_nik`, { gender: null, birth_date: null })
        resetDataPatient({
          gender: null,
          birthDate: null,
          isDengue,
        })
      }
    }
  }

  const handleSearchPatient = async (isDengue?: boolean) => {

    if (errors.data?.[index]?.vaccination?.patient_id) return

    const data = watch('data')
    const patientId = data[index].vaccination.patient_id

    if (data.some((x, i) => (String(x.vaccination.patient_id) === patientId && i !== index))) {
      return toast.warning({ description: t('patient_identity.warning_exist') })
    }

    if (patientId) {
      setLoadingPopup(true)
      const [dataPatientNIK, dataPatientSequence, dataSequence] = await Promise.all([
        fetchDataPatientNIK(patientId),
        fetchDataPatientSequence(patientId, protocolId),
        handleFetchVaccineSequence(patientId),
      ])

      if (
        protocolId === VACCINE_PROTOCOL.RABIES &&
        index > 0 &&
        dataPatientSequence &&
        (firstPatient?.vaccine_type?.value !== dataPatientSequence.vaccine_type?.id ||
          firstPatient?.vaccine_method?.value !== dataPatientSequence.vaccine_method?.id)
      ) {
        setDataHistory(dataPatientSequence, dataSequence)
      } else {
        await setDataIdentity(dataPatientNIK, patientId, isDengue)
        setDataHistory(dataPatientSequence, dataSequence)
      }

      setLoadingPopup(false)
    }
  }

  return {
    resetDataPatient,
    handleSearchPatient,
    warningSkipSequence,
    setWarningSkipSequence,
  }
}