import { useDataPatientIds } from '../store/consumption-detail.store'
import { IDENTITY_TYPE_VALUE } from '../transaction-consumption.constant'
import {
  CreateTransactionBatch,
  CreateTransactionConsumptionItems,
  CreateTransactionConsumptionPatient,
} from '../transaction-consumption.type'

export const useTransactionCreateConsumptionSetDataPatientId = () => {
  const { setPatientIds } = useDataPatientIds()

  const extractPatientIds = (
    patients: CreateTransactionConsumptionPatient[] | null | undefined = []
  ) => {
    const nik: string[] = []
    const non_nik: string[] = []

    patients?.forEach((patient) => {
      const patientId = patient?.vaccination?.patient_id ?? ''
      if (patient.vaccination?.identity_type?.value === IDENTITY_TYPE_VALUE.NIK) {
        nik.push(patientId)
      } else {
        non_nik.push(patientId)
      }
    })

    return { nik, non_nik }
  }

  const groupBatchPatientIds = (batches: CreateTransactionBatch[] = []) => {
    return batches.map((batch) => extractPatientIds(batch.patients))
  }

  const groupPatientIdByNik = (data: CreateTransactionConsumptionItems[]) => {
    const result = data.map((item) => ({
      batches: groupBatchPatientIds(item.batches ?? []),
    }))

    setPatientIds(result)
  }

  return {
    groupPatientIdByNik,
  }
}
