import { create } from 'zustand'

import {
  DataPatientId,
  ListRabiesSequenceResponse,
  ListVaccineSequenceByProtocolResponse,
} from '../transaction-consumption.type'

interface State {
  isOpenDrawer: boolean
  setIsOpenDrawer: (flag: boolean) => void
}

interface DataPatientIds {
  patientIds: DataPatientId
  setPatientIds: (patientIds: DataPatientId) => void
}

interface DataRabiesSequence {
  dataRabies: ListRabiesSequenceResponse | []
  setDataRabies: (dataRabies: ListRabiesSequenceResponse) => void
}

interface DataVaccineSequenceByProtocol {
  id: number | null
  dataSequence: ListVaccineSequenceByProtocolResponse['data']
  protocol: ListVaccineSequenceByProtocolResponse['protocol'] | null,
  is_vaccine_type: boolean,
  is_vaccine_method: boolean,
  is_kipi: number,
  is_medical_history: number,
  setDataSequence: (dataRabies: ListVaccineSequenceByProtocolResponse, id: number) => void
}

export const useOpenDrawerStore = create<State>((set) => ({
  isOpenDrawer: false,
  setIsOpenDrawer: (isOpenDrawer) => set(() => ({ isOpenDrawer })),
}))

export const useDataPatientIds = create<DataPatientIds>((set) => ({
  patientIds: [],
  setPatientIds: (patientIds: DataPatientId) => set(() => ({ patientIds })),
}))

export const useDataRabiesSequence = create<DataRabiesSequence>((set) => ({
  dataRabies: [],
  setDataRabies: (dataRabies) => set(() => ({ dataRabies })),
}))

export const useDataVaccineSequenceByProtocol = create<DataVaccineSequenceByProtocol>((set) => ({
  id: null,
  dataSequence: [],
  protocol: null,
  is_vaccine_type: false,
  is_vaccine_method: false,
  is_kipi: 0,
  is_medical_history: 0,
  setDataSequence: ({
    data,
    is_vaccine_method,
    is_vaccine_type,
    protocol,
    is_kipi,
    is_medical_history,
  }, id) => set(() => ({
    id,
    dataSequence: data,
    is_vaccine_method,
    is_vaccine_type,
    is_kipi,
    is_medical_history,
    protocol,
  })),
}))
