import { useEffect, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import dayjs from 'dayjs'
import { STATUS } from '#constants/common'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { formSchemaInputPatient } from '../schema/TransactionCreateConsumptionSchemaForm'
import { useDataVaccineSequenceByProtocol } from '../store/consumption-detail.store'
import { defaultDataFormVaccine, IDENTITY_TYPE_VALUE, VACCINE_PROTOCOL } from '../transaction-consumption.constant'
import {
  CreateTransactionConsumptionPatient,
  FormDataPatient,
  PatientIdentityProps,
} from '../transaction-consumption.type'
import { toast } from '#components/toast'

export const useTransactionCreateConsumptionPatientIdentity = ({
  item: parentItem,
  setValueBatch,
  indexItem,
  indexParent,
  currentAllPatientId,
}: PatientIdentityProps) => {
  const { t } = useTranslation(['common', 'transactionCreateConsumption'])
  const { t: trx } = useTranslation('transactionCreateConsumption')
  const [openModal, setOpenModal] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const { dataSequence } = useDataVaccineSequenceByProtocol()

  const defaultData = [
    defaultDataFormVaccine({
      isVaccine: parentItem.is_vaccine,
      isNeedSequence: parentItem.is_need_sequence,
      protocol: parentItem.protocol_id,
      t: trx,
      isKipi: parentItem.is_kipi,
      isMedicalHistory: parentItem.is_medical_history,
    })
  ]

  const methods = useForm<FormDataPatient>({
    resolver: yupResolver(formSchemaInputPatient(t)),
    mode: 'onChange',
    defaultValues: {
      data: defaultData,
      all_patient_id: {},
    }
  })

  const { setValue } = methods

  useEffect(() => {
    setValue('data', parentItem?.patients ?? defaultData)

    const result = {
      nik: [] as (string | null | undefined)[],
      non_nik: [] as (string | null | undefined)[],
    }

    currentAllPatientId?.forEach((parentItem, parentIndex) => {
      if (parentIndex !== indexParent) {
        parentItem.batches.forEach((batch) => {
          result.nik.push(...batch.nik)
          result.non_nik.push(...batch.non_nik)
        })
      } else {
        parentItem.batches.forEach((batch, batchIndex) => {
          if (batchIndex !== indexItem) {
            result.nik.push(...batch.nik)
            result.non_nik.push(...batch.non_nik)
          }
        })
      }
    })
    setValue('all_patient_id', result)
  }, [openModal])

  const vaccineMethod = (dataSequence || [])
    .find((i) => i?.id === parentItem?.patients?.[0].vaccination?.vaccine_type?.value)
    ?.methods?.find((i) => i?.id === parentItem?.patients?.[0].vaccination?.vaccine_method?.value)

  const addNewPatient = (item: CreateTransactionConsumptionPatient[]) => {
    if (item && item?.length < 5) {
      const currentPatients = item ?? []
      currentPatients.push(defaultDataFormVaccine({
        isVaccine: parentItem.is_vaccine,
        isNeedSequence: STATUS.ACTIVE,
        protocol: parentItem.protocol_id,
        t: trx,
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

  const setAllPatientId = (payload: FormDataPatient) => {
    const data = [...payload.data]
    const dataPatientIds = currentAllPatientId ? [...currentAllPatientId] : []
    if (!dataPatientIds[indexParent]) {
      dataPatientIds[indexParent] = { batches: [] }
    }
    if (!dataPatientIds[indexParent].batches) {
      dataPatientIds[indexParent].batches = []
    }
    const nikList = data
      .filter((item) => item?.vaccination?.identity_type?.value === IDENTITY_TYPE_VALUE.NIK)
      .map((item) => item?.vaccination?.patient_id)

    const nonNikList = data
      .filter((item) => item?.vaccination?.identity_type?.value !== IDENTITY_TYPE_VALUE.NIK)
      .map((item) => item?.vaccination?.patient_id)
    dataPatientIds[indexParent].batches[indexItem] = {
      nik: nikList,
      non_nik: nonNikList,
    }

    setValueBatch('all_patient_id', dataPatientIds)
  }

  const checkHistoryMedicalAfter = (payload: FormDataPatient): boolean => {
    let result = false

    if (payload.data?.[0]?.protocol_id === VACCINE_PROTOCOL.DENGUE) {
      const {
        last_dengue_diagnosis_month,
        last_dengue_diagnosis_year
      } = payload.data[0].history_medical || {}

      result = dayjs(`${last_dengue_diagnosis_year}-${last_dengue_diagnosis_month}-01`).isAfter(dayjs(), 'month')
    }

    return result
  }

  const onSubmit: SubmitHandler<FormDataPatient> = (payload) => {
    if (payload.data) {
      const checkHistoryMedical = checkHistoryMedicalAfter(payload)
      if (checkHistoryMedical) {
        toast.danger({ description: trx('validation.history_medical') })
        return
      }
      const { vaccine_sequence } = payload.data[0].vaccination

      setValueBatch(`batches.${indexItem}.patients`, payload.data)
      setValueBatch(`batches.${indexItem}.vaccine_max_qty`, vaccine_sequence?.max ?? 1)
      setValueBatch(`batches.${indexItem}.vaccine_min_qty`, vaccine_sequence?.min ?? 1)
      setAllPatientId(payload)
      setOpenModal(false)
    }
  }

  const isDisabledAddPatient = (
    item: CreateTransactionConsumptionPatient[]
  ) => {
    let check: boolean = true
    check = item.some(
      (i) =>
        !i.vaccination?.identity_type?.value || !i.vaccination?.patient_id || !i.vaccination?.vaccine_sequence?.value
    )
    return check
  }

  return {
    methods,
    openModal,
    setOpenModal,
    selectedIndex,
    setSelectedIndex,
    vaccineMethod,
    addNewPatient,
    removePatient,
    handleSave: () => methods.handleSubmit(onSubmit)(),
    isDisabledAddPatient,
  }
}
