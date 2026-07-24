import { parseDateTime } from '#utils/date'
import { numberFormatter } from '#utils/formatter'
import { TFunction } from 'i18next'
import dayjs from 'dayjs'

import { setBatches } from '../../TransactionAddStock/transaction-add-stock.type'
import {
  CreateTransactionBatch,
  CreateTransactionConsumptionBody,
  ListRabiesSequenceResponse,
} from '../transaction-consumption.type'
import { getDataPatientLocation, getDataPatientNIK, getDataPatientSequence } from '../transaction-consumption.service'
import { toast } from '#components/toast'
import { AxiosError } from 'axios'
import { VACCINE_PROTOCOL } from '../transaction-consumption.constant'
import { OptionType } from '#components/react-select'

export const setIntialBatch = ({
  obj,
  materialItemList,
  selectedItem,
  isOpenVialCustomer = false,
  isKipi,
}: setBatches) => {
  if (materialItemList && materialItemList.length > 0) {
    return materialItemList.map((itm) => {
      const batchTemp: CreateTransactionBatch = {
        batch_id: itm.id ?? null,
        activity_id: itm?.activity.id ?? null,
        activity_name: itm?.activity.name ?? null,
        change_qty: null,
        open_vial: null,
        close_vial: null,
        code: itm?.batch?.code ?? null,
        production_date: itm?.batch?.production_date ?? null,
        expired_date: itm?.batch?.expired_date ?? null,
        manufacturer: itm.batch?.manufacture?.id
          ? {
            value: itm?.batch?.manufacture.id,
            label: itm?.batch?.manufacture?.name ?? '',
          }
          : null,
        available_qty: itm?.available_qty ?? 0,
        open_vial_qty: itm?.open_vial_qty ?? 0,
        allocated_qty: itm?.allocated_qty ?? 0,
        on_hand_stock: itm?.qty ?? 0,
        min: obj?.min ?? 0,
        max: obj?.max ?? 0,
        temperature_sensitive:
          selectedItem?.material?.is_temperature_sensitive ?? null,
        pieces_per_unit:
          selectedItem?.material?.consumption_unit_per_distribution_unit ??
          null,
        status_material: null,
        managed_in_batch: selectedItem?.material?.is_managed_in_batch ?? null,
        vaccine_max_qty: null,
        vaccine_min_qty: null,
        vaccine_method: null,
        vaccine_type: null,
        patients: null,
        is_vaccine: selectedItem?.protocol?.is_patient_needed,
        is_need_sequence: selectedItem?.protocol?.protocol_id ? 1 : 0,
        is_open_vial: isOpenVialCustomer,
        protocol_id: selectedItem?.protocol?.protocol_id,
        is_kipi: isKipi,
      }

      return batchTemp
    })
  }
  return []
}

export const checkIsHaveQty = (
  item: CreateTransactionBatch[] | null | undefined
) => {
  const checkQty = item?.find((i) => !!i.change_qty)
  const checkOpenVialQty = item?.find(
    (i) => i.is_open_vial && (!!i.open_vial || !!i.close_vial)
  )
  return !!checkQty || !!checkOpenVialQty
}

export const SummaryListBatch = ({
  key,
  t,
  lang,
  batchName,
  expiredDate,
  qty,
  protocolId,
  isOpenVial = false,
  openVial = null,
  closeVial = null,
  item,
}: {
  key: string
  t: TFunction<['transactionCreateConsumption']>
  lang: string
  batchName: string
  expiredDate: string
  qty: number | null | undefined
  protocolId?: number | null
  isOpenVial?: boolean
  openVial?: number | null
  closeVial?: number | null
  item: CreateTransactionBatch
}) => {
  const additionalSection: Record<number, OptionType> = {
    [VACCINE_PROTOCOL.DENGUE]: {
      label: t('patient_identity.vaccination_sequence.label'),
      value: item.patients?.[0].vaccination?.vaccine_sequence?.label
    },
    [VACCINE_PROTOCOL.RABIES]: {
      label: t('table.column.vaccine_type.label'),
      value: item.patients?.[0].vaccination?.vaccine_type?.label
    },
  }

  return (
    <div key={key} className="ui-flex ui-flex-col ui-gap-1">
      <div>
        {t('table.column.batch_code')}: {batchName}
      </div>
      <div>
        {t('table.column.expired_date')}:{' '}
        {parseDateTime(expiredDate, 'DD MMM YYYY')}
      </div>
      {protocolId && additionalSection[protocolId] ? (
        <div>
          {additionalSection[protocolId].label}: {additionalSection[protocolId].value}
        </div>
      ) : null}
      {!isOpenVial ? (
        <div className="ui-font-bold">Qty: {numberFormatter(qty, lang)}</div>
      ) : (
        <div className="ui-font-bold">
          Qty: {numberFormatter(openVial, lang)} {`(${t('open_vial')})`}{' '}
          {numberFormatter(closeVial, lang)} {`(${t('close_vial')})`}
        </div>
      )}
    </div>
  )
}

export const findMethod = (
  method_id: number,
  sequence_id: number,
  rabiesVaccineSequence: ListRabiesSequenceResponse
) => {
  let result: {
    method?: { id: number; title: string }
    sequence?: { id: number; title: string }
  } = {}

  rabiesVaccineSequence.forEach((item) => {
    item.methods.forEach((method) => {
      if (method?.id === method_id) {
        const sequence = method.sequences.find((seq) => seq.id === sequence_id)
        if (sequence) {
          result = { method, sequence }
        }
      }
    })
  })

  return result
}

// Submitter
export const cleanObjectValuesOfConsumption = (
  data: CreateTransactionConsumptionBody
) => {
  const process = {
    ...data,
    materials:
      data?.materials?.map((obj) =>
        Object.fromEntries(
          Object.entries(obj!).filter(
            ([_, value]) => value !== null && value !== undefined
          )
        )
      ) ?? [],
  }
  return process
}

export function parseNIK(nik: string, language: string, t: TFunction<'transactionCreateConsumption'>) {
  if (!/^\d{16}$/.test(nik)) {
    return { valid: false, message: "NIK must be 16 digits" }
  }

  const birthPart = nik.substring(6, 12)
  let day = parseInt(birthPart.substring(0, 2), 10)
  const month = parseInt(birthPart.substring(2, 4), 10)
  const year = parseInt(birthPart.substring(4, 6), 10)

  let gender: "male" | "female" = "male"
  if (day > 40) {
    gender = "female"
    day -= 40
  }

  if (month < 1 || month > 12) {
    return { valid: false, message: t('validation.generate_nik.month_not_valid') }
  }

  if (day < 1 || day > 31) {
    return { valid: false, message: t('validation.generate_nik.date_not_valid') }
  }

  const currentYearTwoDigits = new Date().getFullYear() % 100
  const fullYear = year <= currentYearTwoDigits ? 2000 + year : 1900 + year

  // create a Local Date (avoid toISOString())
  const birthDate = new Date(fullYear, month - 1, day)

  // verify constructed date matches parts (guards against invalid dates like 31 Feb)
  if (
    birthDate.getFullYear() !== fullYear ||
    birthDate.getMonth() + 1 !== month ||
    birthDate.getDate() !== day
  ) {
    return { valid: false, message: t('validation.generate_nik.birth_date_not_valid') }
  }

  // age
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  const parseDateTimeFromDate = (dateObj: Date, format = 'DD/MM/YYYY HH:mm', lang = 'en') => {
    if (!dateObj) return '-'
    return dayjs(dateObj).locale(lang).format(format)
  }

  const pad = (n: number) => {
    return n.toString().padStart(2, '0')
  }

  // Format using dayjs directly from the Date object (keeps local date)
  const formatted = parseDateTimeFromDate(birthDate, "DD MMM YYYY", language).toUpperCase()
  const rawBirthDate = `${birthDate.getFullYear()}-${pad(birthDate.getMonth() + 1)}-${pad(birthDate.getDate())}`

  return {
    valid: true,
    gender,
    birth_date: formatted,
    raw_birth_date: rawBirthDate,
    age,
  }
}

export async function fetchDataPatientNIK(nik: string) {
  try {
    const response = await getDataPatientNIK(nik);
    if (!response.data) {
      return null;
    }

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.danger({ description: error.message })
    }
    return null;
  }
}

export async function fetchDataPatientLocation(nik: string) {
  try {
    const response = await getDataPatientLocation(nik);
    if (!response.data) {
      return null;
    }

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.danger({ description: error.message })
    }
    return null;
  }
}

export async function fetchDataPatientSequence(nik: string, protocolId: number | null) {
  if (!protocolId) return null;

  try {
    const response = await getDataPatientSequence(nik, protocolId);
    if (!response.data) {
      return null;
    }

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      toast.danger({ description: error.message })
    }
    return null;
  }
}

// Helper to validate vaccine sequence dates
export const validateOrderedDates = (
  data: any[],
  actualDate: Date,
  path: string,
  t: TFunction<['common', 'transactionCreateConsumption']>
) => {
  let previousDate: Date | null = null

  if (data.some(d => d.date)) return { valid: true }
  // uncomment when validation is needed in a future (at least one date filled)
  // if (data.every(d => !d.date)) return {
  //   valid: false,
  //   path: `${path}[0].date`,
  //   message: t('transactionCreateConsumption:completed_sequence.error.date_sequence_empty'),
  // }

  for (let i = 0; i < data.length; i++) {
    const currDate = new Date(data[i].date)
    const errorPath = `${path}[${i}].date`

    // Invalid format
    if (isNaN(currDate.getTime())) {
      return {
        valid: false,
        path: errorPath,
        message: t(
          'transactionCreateConsumption:completed_sequence.validation.date_not_valid'
        ),
      }
    }

    // Future date
    if (currDate > actualDate) {
      return {
        valid: false,
        path: errorPath,
        message: t(
          'transactionCreateConsumption:completed_sequence.validation.more_than_actual_date'
        ),
      }
    }

    // Not in order
    if (previousDate && currDate < previousDate) {
      return {
        valid: false,
        path: errorPath,
        message: t(
          'transactionCreateConsumption:completed_sequence.validation.less_then_previous_date'
        ),
      }
    }

    previousDate = currDate
  }

  return { valid: true }
}
