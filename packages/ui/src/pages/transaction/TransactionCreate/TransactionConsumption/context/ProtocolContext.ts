import { createContext } from "react";
import { FormDataPatient, HistoryVaccination } from "../transaction-consumption.type";
import { UseFormReturn } from "react-hook-form";

type ProtocolContextProps = {
  isNeedSequence: boolean
  isVaccine: boolean
  historyVaccination?: HistoryVaccination
  isMultiPatient: boolean
  methods: UseFormReturn<FormDataPatient>
  protocolId: number
  index: number
  indexItem: number
}

const dataefaultValue: ProtocolContextProps = {
  isNeedSequence: true,
  isVaccine: true,
  isMultiPatient: false,
  methods: undefined as unknown as UseFormReturn<FormDataPatient>,
  protocolId: 0,
  index: 0,
  indexItem: 0,
}

export const ProtocolContext = createContext<ProtocolContextProps>(dataefaultValue)