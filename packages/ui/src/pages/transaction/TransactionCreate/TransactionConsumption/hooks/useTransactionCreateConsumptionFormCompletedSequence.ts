import { useEffect } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { parseDateTime } from '#utils/date'
import { SubmitHandler, useForm, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { schemaFormCompletedSequence } from '../schema/TransactionCreateConsumptionSchemaCompletedSequence'
import {
  useSetErrorDataRabies,
  useSetPayloadRabies,
} from '../store/completed-sequence.store'
import { useDataVaccineSequenceByProtocol } from '../store/consumption-detail.store'
import {
  BodyMaterial,
  BodyMaterialPatient,
  CompletedSequenceForm,
  CreateTransactionConsumption,
  CreateTransactionConsumptionBody,
  ValidationErrorsRabies,
} from '../transaction-consumption.type'
import { findMethod } from '../utils/helpers'
import { useTransactionCreateConsumptionSubmit } from './useTransactionCreateConsumptionSubmit'
import { toast } from '#components/toast'

export const useTransactionCreateConsumptionFormCompletedSequence = () => {
  const { t } = useTranslation(['common', 'transactionCreateConsumption'])
  const { dataSequence } = useDataVaccineSequenceByProtocol()
  const { mutateConsumption } = useTransactionCreateConsumptionSubmit({})
  const methods = useForm<CompletedSequenceForm>({
    resolver: yupResolver(schemaFormCompletedSequence(t)),
    mode: 'onChange',
    defaultValues: {},
  })
  const {
    watch: watchForm,
  } = useFormContext<CreateTransactionConsumption>()

  const formatPatientData = (
    patient: BodyMaterialPatient,
    indexMaterial: number,
    indexPatient: number,
    dataCompletedSequence?: CompletedSequenceForm
  ) => {
    const completedData =
      dataCompletedSequence?.materials?.[indexMaterial]?.patients?.[
        indexPatient
      ]?.data

    if (!completedData) return patient

    const formattedData = completedData.filter(x => x.date).map((item: any) => ({
      entity_id: item.entity?.value,
      reaction_id: item.reaction?.value,
      other_reaction: item.other_reaction,
      vaccine_sequence: item.vaccine_sequence,
      actual_transaction_date: item.date
        ? parseDateTime(item.date, 'YYYY-MM-DD')
        : null,
    }))

    return {
      ...patient,
      other_sequences: formattedData,
    }
  }

  const formatMaterial = (
    material: BodyMaterial,
    indexMaterial: number,
    dataCompletedSequence?: CompletedSequenceForm
  ) => {
    return {
      ...material,
      patients: material?.patients?.map(
        (patient: BodyMaterialPatient, indexPatient: number) =>
          formatPatientData(
            patient,
            indexMaterial,
            indexPatient,
            dataCompletedSequence
          )
      ),
    }
  }

  const addOtherSequences = (
    dataConsumption?: CreateTransactionConsumptionBody,
    dataCompletedSequence?: CompletedSequenceForm
  ) => {
    if (!dataConsumption) return undefined

    return {
      ...dataConsumption,
      materials: dataConsumption.materials.map((material, indexMaterial) =>
        formatMaterial(material, indexMaterial, dataCompletedSequence)
      ),
    }
  }

  const hasAtLeastOneDateFilled = (payload: CompletedSequenceForm) => {
    let valid = false

    for (const material of payload.materials) {
      for (const patient of material?.patients ?? []) {
        if (!patient) continue
        valid = false
        for (const item of patient.data) {
          if (item.date !== null && item.date !== "") {
            valid = true
          }
        }
      }
    }

    return {
      valid
    }
  }

  const onSubmit: SubmitHandler<CompletedSequenceForm> = (payload) => {
    const result = hasAtLeastOneDateFilled(payload)
    if (!result.valid) {
      return toast.danger({ description: t('transactionCreateConsumption:completed_sequence.error.date_sequence_empty') })
    }

    const data = addOtherSequences(payloadRabies, payload)
    mutateConsumption(data)
  }

  const { setValue } = methods

  const { errorData } = useSetErrorDataRabies()
  const { payloadRabies } = useSetPayloadRabies()

  function extractNumbers(str: string): string[] {
    return str.match(/\d+/g)?.map(String) || []
  }

  function convertValidationErrors(errors: ValidationErrorsRabies) {
    const result: CompletedSequenceForm = { materials: [] }
    const materialForm = watchForm('items')

    for (const key in errors) {
      const match = extractNumbers(key)
      if (match.length === 0) continue

      const materialIndex = parseInt(match[0], 10)
      const patientIndex = parseInt(match[1], 10)

      if (!result.materials[materialIndex]) {
        result.materials[materialIndex] = { patients: [] }
      }
      const payloadMaterial = payloadRabies?.materials[materialIndex]
      const sequenceData = findMethod(
        payloadMaterial?.vaccine_method ?? 0,
        payloadMaterial?.patients?.[patientIndex]?.vaccine_sequence ?? 0,
        dataSequence
      )

      const original = errors[key][0]
      result.materials[materialIndex].patients[patientIndex] = {
        actual_date: payloadRabies?.actual_transaction_date ?? null,
        identity_type:
          payloadMaterial?.patients?.[patientIndex]?.identity_type ?? null,
        patient_id:
          payloadMaterial?.patients?.[patientIndex]?.identity_number ?? null,
        selected_vaccine_sequence_title: sequenceData?.sequence?.title ?? null,
        selected_vaccine_method_title: sequenceData?.method?.title ?? null,
        data: original.data,
        protocol_id: materialForm?.[materialIndex].protocol_id,
      }
    }

    return result
  }

  useEffect(() => {
    if (errorData && payloadRabies) {
      const converted = convertValidationErrors(errorData)
      setValue('materials', converted.materials)
    }
  }, [errorData, payloadRabies])

  return {
    methods,
    setValue,
    handleSave: () => methods.handleSubmit(onSubmit)(),
  }
}
