import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { toast } from '#components/toast'
import { useSetLoadingPopupStore } from '#hooks/useSetLoading'
import useSmileRouter from '#hooks/useSmileRouter'
import { ErrorResponse } from '#types/common'
import { parseDateTime } from '#utils/date'
import { isNonEmptyObject } from '#utils/object'
import { AxiosError } from 'axios'
import { UseFormSetError } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  useOpenCompletedSequenceStore,
  useSetErrorDataRabies,
  useSetPayloadRabies,
} from '../store/completed-sequence.store'
import { useOpenDrawerStore } from '../store/consumption-detail.store'
import { createConsumption, createConsumptionV2 } from '../transaction-consumption.service'
import {
  BodyMaterial,
  BodyMaterialPatient,
  CreateTransactionBatch,
  CreateTransactionConsumption,
  CreateTransactionConsumptionBody,
  CreateTransactionConsumptionItems,
  CreateTransactionConsumptionPatient,
} from '../transaction-consumption.type'

const PRIORITY_KEYS_ERROR = ['transactions'] // add more keys if needed

export const useTransactionCreateConsumptionSubmit = ({
  setError,
}: {
  setError?: UseFormSetError<CreateTransactionConsumption>
}) => {
  const { t } = useTranslation('transactionCreateConsumption')
  const router = useSmileRouter()
  const [dataTransaction, setDataTransaction] =
    useState<CreateTransactionConsumption>()
  const { setIsOpenDrawer } = useOpenDrawerStore()
  const { setIsOpenCompletedSequence, isOpenCompletedSequence } = useOpenCompletedSequenceStore()

  const getIndexBatchByStockId = (batchId: number | null | undefined) => {
    if (!batchId || !dataTransaction?.items)
      return { outerIndex: -1, innerIndex: -1 }

    for (let i = 0; i < dataTransaction.items.length; i++) {
      const batches = dataTransaction.items[i].batches
      if (!batches) continue

      const j = batches.findIndex((batch) => batch.batch_id === batchId)
      if (j !== -1) return { outerIndex: i, innerIndex: j }
    }

    return { outerIndex: -1, innerIndex: -1 }
  }

  const extractPatientErrors = (payload: ErrorResponse) => {
    const patients = payload.errors?.patients;
    if (!patients) return [];

    return Object.values(patients).flat()
  }

  function getErrorMessageFlexible(error: ErrorResponse): string {
    for (const key of PRIORITY_KEYS_ERROR) {
      const msg = error?.errors?.[key]?.[0];
      if (msg) return msg;
    }

    return error?.message ?? '';
  }

  const handleErrorField = (
    ErrorResponse: ErrorResponse & { need_confirmation?: boolean },
    payload: CreateTransactionConsumptionBody
  ) => {
    // const errors = ErrorResponse?.errors
    const errorFields = ErrorResponse?.errors?.materials
    if (!errorFields || typeof errorFields !== 'object') return

    Object.entries(errorFields).forEach(([key, error]) => {
      if (key === 'actual_transaction_date' && Array.isArray(error)) {
        setError?.('actual_date' as keyof CreateTransactionConsumption, {
          message: error[0] as string,
        })
        return
      }

      if (
        !error ||
        typeof error !== 'object' ||
        !('qty' in error) ||
        !Array.isArray(error.qty)
      )
        return

      const stockId = payload.materials?.[Number(key)]?.stock_id
      const { outerIndex, innerIndex } = getIndexBatchByStockId(stockId)

      if (outerIndex >= 0 && innerIndex >= 0) {
        setError?.(
          `items.${outerIndex}.batches.${innerIndex}.change_qty` as keyof CreateTransactionConsumption,
          {
            message: error.qty.join(', '),
          }
        )
      }
    })
  }

  const { mutate, isPending } = useMutation({
    mutationFn: (data: CreateTransactionConsumptionBody) => {
      let isRabies = false
      try {
        const programStorage = sessionStorage.getItem('SMILEWEB_PROGRAM')
        if (programStorage) {
          const parsed = JSON.parse(programStorage)
          if (parsed?.key === 'rabies') {
            isRabies = true
          }
        }
      } catch (e) {
        if (sessionStorage.getItem('SMILEWEB_PROGRAM') === 'rabies') {
          isRabies = true
        }
      }
      return isRabies ? createConsumptionV2(data) : createConsumption(data)
    },
    onSuccess: () => {
      toast.success({
        description: t('toast.success.create'),
      })
      if (isOpenCompletedSequence) setIsOpenCompletedSequence(false)
      router.push('/v5/transaction')
    },
    onError: (error, variables) => {
      if (error instanceof AxiosError) {
        const response = error.response?.data as ErrorResponse
        handleErrorField(response, variables)
      }
    },
  })

  const mapPatients = (
    patients: CreateTransactionConsumptionPatient[] = []
  ): BodyMaterialPatient[] =>
    patients.map((p) => ({
      identity_type: p.vaccination.identity_type?.value,
      identity_number: p.vaccination.patient_id,
      ...p.identity.phone_number && {
        phone_number: p.identity.phone_number,
      },
      name: p.identity.full_name,
      vaccine_sequence: p.vaccination.vaccine_sequence?.value,
      patient_id: p.vaccination.patient_id,
      gender: p.identity.gender?.value,
      birth_date: p.identity.birth_date,
      education_id: p.identity.last_education?.value,
      occupation_id: p.identity.occupation?.value,
      marital_status: p.identity.marital_status?.value,
      religion_id: p.identity.religion?.value,
      ethnic_id: p.identity.ethnic?.value,
      ...p.identity.residential_address && {
        residential_address: p.identity.residential_address,
      },
      residential_province_id: p.identity.province_residential?.value,
      residential_regency_id: p.identity.regency_residential?.value,
      residential_subdistrict_id: p.identity.sub_district_residential?.value,
      residential_village_id: p.identity.village_residential?.value,
      ...p.identity.registered_address && {
        address: p.identity.registered_address,
      },
      province_id: p.identity.province?.value,
      regency_id: p.identity.regency?.value,
      subdistrict_id: p.identity.sub_district?.value,
      village_id: p.identity.village?.value,
      reaction_id: p.vaccination.reaction_id?.value,
      ...p.vaccination.other_reaction && {
        other_reaction: p.vaccination.other_reaction,
      },
      is_diagnose_before: p.history_medical?.is_dengue_before,
      ...p.history_medical?.last_dengue_diagnosis_month && {
        month_before: Number(p.history_medical?.last_dengue_diagnosis_month),
      },
      ...p.history_medical?.last_dengue_diagnosis_year && {
        year_before: Number(p.history_medical?.last_dengue_diagnosis_year),
      },
      received_vaccine: p.history_medical?.dengue_received_vaccine,
    }))

  const createMaterial = (
    item: CreateTransactionConsumptionItems,
    batch: CreateTransactionBatch
  ): BodyMaterial => {
    const firstPatient = batch?.patients?.[0]

    const baseMaterial: BodyMaterial = {
      material_id: item.material_id,
      stock_id: batch.batch_id,
      ...(batch?.is_open_vial
        ? {
          open_vial: batch.open_vial,
          close_vial: batch.close_vial,
        } : {
          qty: batch.change_qty,
        }),
    }

    const vaccineData = {
      vaccine_type: firstPatient?.vaccination.vaccine_type?.value,
      vaccine_method: firstPatient?.vaccination.vaccine_method?.value,
    }

    let patientData: Record<string, any> = {}
    if (!batch.is_need_sequence && firstPatient) {
      patientData = {
        patients: [{
          identity_type: firstPatient.vaccination.identity_type?.value,
          identity_number: firstPatient.vaccination.patient_id,
          name: firstPatient.identity.full_name,
          phone_number: firstPatient.identity.phone_number,
          patient_id: firstPatient.vaccination.patient_id,
          gender: firstPatient.identity.gender?.value,
          birth_date: firstPatient.identity.birth_date,
          education_id: firstPatient.identity.last_education?.value,
          occupation_id: firstPatient.identity.occupation?.value,
          marital_status: firstPatient.identity.marital_status?.value,
          religion_id: firstPatient.identity.religion?.value,
          ethnic_id: firstPatient.identity.ethnic?.value,
          residential_address: firstPatient.identity.residential_address,
          residential_province_id: firstPatient.identity.province_residential?.value,
          residential_regency_id: firstPatient.identity.regency_residential?.value,
          residential_subdistrict_id: firstPatient.identity.sub_district_residential?.value,
          residential_village_id: firstPatient.identity.village_residential?.value,
          address: firstPatient.identity.registered_address,
          province_id: firstPatient.identity.province?.value,
          regency_id: firstPatient.identity.regency?.value,
          subdistrict_id: firstPatient.identity.sub_district?.value,
          village_id: firstPatient.identity.village?.value,
          ...firstPatient.vaccination.reaction_id?.value && {
            reaction_id: firstPatient.vaccination.reaction_id?.value,
          },
          ...firstPatient.vaccination.other_reaction && {
            other_reaction: firstPatient.vaccination.other_reaction,
          },
          ...firstPatient.history_medical?.is_dengue_before && {
            is_diagnose_before: firstPatient.history_medical?.is_dengue_before,
          },
          ...firstPatient.history_medical?.last_dengue_diagnosis_month && {
            month_before: Number(firstPatient.history_medical?.last_dengue_diagnosis_month),
          },
          ...firstPatient.history_medical?.last_dengue_diagnosis_year && {
            year_before: Number(firstPatient.history_medical?.last_dengue_diagnosis_year),
          },
          ...firstPatient.history_medical?.dengue_received_vaccine && {
            received_vaccine: firstPatient.history_medical?.dengue_received_vaccine,
          },
        }]
      }
    } else {
      patientData = { patients: mapPatients(batch.patients ?? []) }
    }

    let allowPatientData = false
    if (!batch.is_need_sequence && firstPatient) {
      allowPatientData = isNonEmptyObject(patientData)
    } else {
      allowPatientData =
        Array.isArray((patientData as { patients?: BodyMaterialPatient[] }).patients) &&
        ((patientData as { patients?: BodyMaterialPatient[] }).patients?.length ?? 0) > 0
    }

    return {
      ...baseMaterial,
      ...vaccineData,
      ...(allowPatientData ? patientData : null),
    }
  }

  const { setPayloadRabies } = useSetPayloadRabies()
  const { setErrorData } = useSetErrorDataRabies()

  const submitConsumption = ({
    formData,
  }: {
    formData: CreateTransactionConsumption
  }) => {
    setDataTransaction(formData)
    const {
      items,
      entity,
      activity,
      customer,
      actual_date,
      entity_activity_id,
    } = formData

    const materials: BodyMaterial[] = items?.flatMap((item) => {
      const validBatches =
        item.batches?.filter(
          (batch) =>
            !batch?.batch_id ||
            batch?.change_qty ||
            (batch?.is_open_vial && (batch?.open_vial || batch?.close_vial))
        ) || []

      return validBatches.map((batch) => createMaterial(item, batch))
    })
    const data: CreateTransactionConsumptionBody = {
      entity_id: entity?.value,
      activity_id: activity?.value,
      entity_activity_id: entity_activity_id,
      actual_transaction_date: actual_date
        ? parseDateTime(actual_date, 'YYYY-MM-DD')
        : null,
      customer_id: customer?.value,
      materials: materials || [],
    }

    setPayloadRabies(data)
    mutate(data)
  }

  useSetLoadingPopupStore(isPending)

  return {
    submitConsumption,
    mutateConsumption: (data: CreateTransactionConsumptionBody) => mutate(data),
  }
}
