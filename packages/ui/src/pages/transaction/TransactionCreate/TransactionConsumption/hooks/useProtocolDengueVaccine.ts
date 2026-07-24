import { useMemo, useCallback } from "react"
import { useTranslation } from "react-i18next"
import { UseFormReturn } from "react-hook-form"
import { FormDataPatient, HistoryVaccination, PatienVaccineSequence } from "../transaction-consumption.type"
import { clearField } from "#utils/form"
import { useProtocolVaccine } from "./useProtocolVaccine"
import { OptionType } from "#components/react-select"

type Props = {
  index: number
  methods: UseFormReturn<FormDataPatient>
  historyVaccination?: HistoryVaccination
}

export const useProtocolDengueVaccine = (props: Props) => {
  const { index, methods, historyVaccination } = props
  const { t } = useTranslation('transactionCreateConsumption')
  const { control, watch, setValue, clearErrors, trigger } = methods
  const dataVaccination = watch(`data.${index}.vaccination`)
  const { options_sequence = [] } = dataVaccination || {}

  const setDataHistory = async (dataPatienHistory: PatienVaccineSequence | null) => {
    if (dataPatienHistory?.next_sequence) {
      setValue(`data.${index}.history_vaccination`, dataPatienHistory)
      setValue(`data.${index}.vaccination.vaccine_sequence`, {
        value: dataPatienHistory?.next_sequence?.id,
        label: dataPatienHistory?.next_sequence?.name || '',
        min: dataPatienHistory?.next_sequence?.min,
        max: dataPatienHistory?.next_sequence?.max,
      })
      await trigger(`data.${index}.vaccination.vaccine_sequence`)
    } else {
      setValue(`data.${index}.history_vaccination`, null)
    }
  }

  const setDisabledOption = useCallback((id?: number) => {
    if (!id || !historyVaccination) return false

    if (historyVaccination?.previous_sequence?.id === id) return false

    return true
  }, [historyVaccination])

  const setTextVacinationDataHistory = (): string[] => {
    if (!historyVaccination) return []

    const result: string[] = []

    const { previous_sequence, entity } = historyVaccination

    result.push(`${previous_sequence?.name} ${t('patient_identity.at')} ${entity?.name}.`.trim())

    return result
  }

  const {
    handleSearchPatient,
    resetDataPatient,
    warningSkipSequence,
    setWarningSkipSequence,
  } = useProtocolVaccine({
    setDataHistory,
  })

  const handleChangePatientId = () => {
    const historyData = watch(`data.${index}.history_vaccination`)

    if (historyData !== undefined) {
      setValue(`data.${index}.history_vaccination`, undefined)
      resetDataPatient({ gender: null, birthDate: null, isDengue: true })
      clearField({
        setValue,
        name: [
          `data.${index}.vaccination.vaccine_sequence`,
          `data.${index}.vaccination.reaction_id`,
          `data.${index}.vaccination.other_reaction`,
        ],
        resetValue: null,
        clearErrors,
      })
    }
  }

  const memoizedOptionsDengueSequence = useMemo<OptionType[]>(() => {
    if (!options_sequence) return []

    return options_sequence
      .flatMap(group => group?.methods ?? [])
      .flatMap(method => method?.sequences ?? [])
      .map(seq => ({ label: seq.title, value: seq.id, min: seq.min, max: seq.max }))
  }, [options_sequence])

  const handleChangeSequence = (option: OptionType, callback: () => void) => {
    if (
      historyVaccination?.next_sequence?.id === option.value ||
      (!historyVaccination && memoizedOptionsDengueSequence[0].value === option.value)
    ) {
      return callback()
    }

    if (historyVaccination?.next_sequence?.id !== option.value) {
      setWarningSkipSequence({
        open: true,
        description: t('patient_identity.warning_skip_sequence.description', {
          identity_type: dataVaccination.identity_type?.label,
          patient_id: dataVaccination.patient_id,
          next_sequence: historyVaccination?.next_sequence?.name ?? memoizedOptionsDengueSequence[0].label,
          skip_sequence: option.label,
        }),
        callback,
      })
    }
  }

  return {
    t,
    control,
    watch,
    setValue,
    handleSearchPatient,
    handleChangePatientId,
    setTextVacinationDataHistory,
    setDisabledOption,
    memoizedOptionsDengueSequence,
    handleChangeSequence,
    warningSkipSequence,
    setWarningSkipSequence,
  }
}