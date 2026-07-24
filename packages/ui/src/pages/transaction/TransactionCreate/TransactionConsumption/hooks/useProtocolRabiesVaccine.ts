import { useMemo } from "react"
import { UseFormReturn } from "react-hook-form"
import { FormDataPatient, HistoryVaccination, PatienVaccineSequence } from "../transaction-consumption.type"
import { defaultDataIdentity, VACCINE_METHOD } from "../transaction-consumption.constant"
import { useTranslation } from "react-i18next"
import { OptionType } from "#components/react-select"
import { clearField } from "#utils/form"
import { useProtocolVaccine } from "./useProtocolVaccine"
import { toast } from "#components/toast"

type Props = {
  index: number
  methods: UseFormReturn<FormDataPatient>
  historyVaccination?: HistoryVaccination
}

export const useProtocolRabiesVaccine = (props: Props) => {
  const { index, methods, historyVaccination } = props
  const { t } = useTranslation('transactionCreateConsumption')
  const { watch, setValue, clearErrors, trigger } = methods
  const dataVaccination = watch(`data.${index}.vaccination`)
  const dataFirstPatientVaccination = watch('data.0.vaccination')
  const { vaccine_type, vaccine_method, options_sequence = [] } = dataVaccination || {}

  const resetData = () => {
    const data = watch('data')
    if (data.length > 1 && index === 0) {

      setValue('data', [data[0]])
      clearErrors('data')
    }
  }

  const setDataVaccinationSameAsFirstPatient = async () => {
    if (dataFirstPatientVaccination.vaccine_method && dataFirstPatientVaccination.vaccine_type) {
      setValue(`data.${index}.vaccination.vaccine_type`, {
        value: dataFirstPatientVaccination.vaccine_type.value,
        label: dataFirstPatientVaccination.vaccine_type.label
      })
      await trigger(`data.${index}.vaccination.vaccine_type`)
      setValue(`data.${index}.vaccination.vaccine_method`, {
        value: dataFirstPatientVaccination.vaccine_method.value,
        label: dataFirstPatientVaccination.vaccine_method.label
      })
      await trigger(`data.${index}.vaccination.vaccine_method`)
    }
  }

  const handleChangeType = () => {
    clearField({
      setValue,
      name: [
        `data.${index}.vaccination.vaccine_method`,
        `data.${index}.vaccination.vaccine_sequence`,
      ]
    })
    resetData()
  }

  const handleChangeMethod = () => {
    clearField({
      setValue,
      name: [
        `data.${index}.vaccination.vaccine_sequence`,
      ],
      resetValue: null,
      clearErrors,
    })
    resetData()
  }

  const setTextVacinationDataHistory = (): string[] => {
    if (!historyVaccination) return []

    const result: string[] = []

    const { vaccine_type, vaccine_method, previous_sequence, entity } = historyVaccination
    const dose = t('patient_identity.dose', { returnObjects: true })[1]

    result.push(`${vaccine_type?.name} ${vaccine_method?.name} ${previous_sequence?.name} on ${entity?.name}. ${previous_sequence?.qty ?? 0} ${dose})`.trim())

    return result
  }

  const isNeedToHideField = () => {
    if (index > 0) return true

    return false
  }

  const isNeedToHideSequence = useMemo(() =>
    !dataVaccination?.is_valid_patient
    , [dataVaccination?.is_valid_patient]
  )

  const validationUnmatchMethod = () => {
    return index > 0 && historyVaccination?.vaccine_method?.id === VACCINE_METHOD.INTRA_MUSCULAR
  }

  const setDataHistory = async (dataPatienHistory: PatienVaccineSequence | null) => {
    const setPatientSequence = async () => {
      setValue(`data.${index}.vaccination.vaccine_sequence`, {
        value: dataPatienHistory?.next_sequence?.id,
        label: dataPatienHistory?.next_sequence?.name || '',
        min: dataPatienHistory?.next_sequence?.min,
        max: dataPatienHistory?.next_sequence?.max,
      })
      await trigger(`data.${index}.vaccination.vaccine_sequence`)
    }

    if (dataPatienHistory?.next_sequence) {
      setValue(`data.${index}.history_vaccination`, dataPatienHistory)
      if (index === 0) {
        if (dataPatienHistory?.next_vaccine_type && dataPatienHistory?.next_vaccine_method) {
          setValue(`data.${index}.vaccination.vaccine_type`, {
            value: dataPatienHistory?.next_vaccine_type.id,
            label: dataPatienHistory?.next_vaccine_type.name
          })
          await trigger(`data.${index}.vaccination.vaccine_type`)
          setValue(`data.${index}.vaccination.vaccine_method`, {
            value: dataPatienHistory?.next_vaccine_method.id,
            label: dataPatienHistory?.next_vaccine_method.name
          })
          await trigger(`data.${index}.vaccination.vaccine_method`)
        }
        setPatientSequence()
      } else if (
        index > 0 &&
        dataFirstPatientVaccination.vaccine_method?.value === dataPatienHistory.vaccine_method?.id &&
        dataFirstPatientVaccination.vaccine_type?.value === dataPatienHistory.vaccine_type?.id
      ) {
        setDataVaccinationSameAsFirstPatient()
        setPatientSequence()
      } else {
        setValue(`data.${index}.vaccination.is_valid_patient`, 0)
        toast.danger({ description: t('patient_identity.warning_unmatch_method_new_patient') })
      }
    } else {
      setValue(`data.${index}.history_vaccination`, null)

      if (index > 0) setDataVaccinationSameAsFirstPatient()
    }
  }

  const {
    handleSearchPatient,
    warningSkipSequence,
    setWarningSkipSequence,
  } = useProtocolVaccine({
    setDataHistory,
    firstPatient: dataFirstPatientVaccination,
  })

  const handleChangePatientId = () => {
    const historyData = watch(`data.${index}.history_vaccination`)

    if (historyData !== undefined) {
      setValue(`data.${index}.history_vaccination`, undefined)
      clearField({
        setValue,
        name: [
          `data.${index}.vaccination.vaccine_type`,
          `data.${index}.vaccination.vaccine_method`,
          `data.${index}.vaccination.vaccine_sequence`,
          `data.${index}.identity`,
          `data.${index}.vaccination.is_valid_patient`
        ],
        resetValue: [null, null, null, defaultDataIdentity, 1],
        clearErrors,
      })
      resetData()
    }
  }

  const optionsType: OptionType[] = useMemo(() => {
    return options_sequence.map((i) => ({
      label: i.title,
      value: i.id,
    }))
  }, [options_sequence])

  const optionsMethod: OptionType[] = useMemo(() => {
    return options_sequence.find((i) => i?.id === vaccine_type?.value)
      ?.methods.map((i) => ({
        label: i?.title || '-',
        value: i?.id || '-',
      })) || []
  }, [options_sequence, vaccine_type])

  const optionsSequence: OptionType[] = useMemo(() => {
    return options_sequence.find((i) => i?.id === vaccine_type?.value)
      ?.methods.find(j => j?.id === vaccine_method?.value)?.sequences.map(x => ({
        label: x?.title,
        value: x?.id,
        min: x.min,
        max: x.max
      })) || []
  }, [options_sequence, vaccine_type, vaccine_method])

  const vaccineTypeFirstPatient = useMemo(() =>
    dataFirstPatientVaccination.vaccine_type?.label || '-',
    [dataFirstPatientVaccination.vaccine_type?.label]
  )

  const handleChangeSequence = (option: OptionType, callback: () => void) => {
    if (
      historyVaccination?.next_sequence?.id === option.value ||
      (!historyVaccination && optionsSequence[0].value === option.value)
    ) {
      return callback()
    }
  }

  return {
    t,
    setValue,
    handleChangeType,
    handleChangeMethod,
    setTextVacinationDataHistory,
    isNeedToHideField,
    validationUnmatchMethod,
    handleSearchPatient,
    handleChangePatientId,
    setDataHistory,
    optionsType,
    optionsMethod,
    optionsSequence,
    vaccineTypeFirstPatient,
    isNeedToHideSequence,
    dataVaccination,
    handleChangeSequence,
    warningSkipSequence,
    setWarningSkipSequence,
  }
}