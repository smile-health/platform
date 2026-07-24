import { UseFormReturn } from "react-hook-form"
import { FormDataPatient } from "../transaction-consumption.type"
import { defaultDataIdentity } from "../transaction-consumption.constant"
import { useTranslation } from "react-i18next"
import { clearField } from "#utils/form"
import { useProtocolVaccine } from "./useProtocolVaccine"

type Props = {
  index: number
  methods: UseFormReturn<FormDataPatient>
}

export const useNonProtocolVaccine = (props: Props) => {
  const { index, methods } = props
  const { t } = useTranslation('transactionCreateConsumption')
  const { watch, setValue, clearErrors, trigger } = methods
  const dataVaccination = watch(`data.${index}.vaccination`)
  const dataFirstPatientVaccination = watch('data.0.vaccination')

  const setDataHistory = async () => {
    setValue(`data.${index}.history_vaccination`, null)
    await trigger(`data.${index}.vaccination`)
  }

  const {
    handleSearchPatient,
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
          `data.${index}.identity`,
        ],
        resetValue: [defaultDataIdentity],
        clearErrors,
      })
    }
  }

  return {
    t,
    setValue,
    handleSearchPatient,
    handleChangePatientId,
    dataVaccination,
  }
}