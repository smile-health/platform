import { create } from 'zustand'

import {
  CreateTransactionConsumptionBody,
  ValidationErrorsRabies,
} from '../transaction-consumption.type'

interface State {
  isOpenCompletedSequence: boolean
  setIsOpenCompletedSequence: (flag: boolean) => void
}

interface ErrorState {
  errorData: ValidationErrorsRabies | undefined
  setErrorData: (errorData: ValidationErrorsRabies) => void
}

interface PayloadRabies {
  payloadRabies: CreateTransactionConsumptionBody | undefined
  setPayloadRabies: (payloadRabies: CreateTransactionConsumptionBody) => void
}

export const useOpenCompletedSequenceStore = create<State>((set) => ({
  isOpenCompletedSequence: false,
  setIsOpenCompletedSequence: (isOpenCompletedSequence) =>
    set(() => ({ isOpenCompletedSequence })),
}))

export const useSetErrorDataRabies = create<ErrorState>((set) => ({
  errorData: undefined,
  setErrorData: (errorData) => set(() => ({ errorData })),
}))

export const useSetPayloadRabies = create<PayloadRabies>((set) => ({
  payloadRabies: undefined,
  setPayloadRabies: (payloadRabies) => set(() => ({ payloadRabies })),
}))
