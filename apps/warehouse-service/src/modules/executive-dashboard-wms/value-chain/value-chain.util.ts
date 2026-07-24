import { Context } from "hono"
import { SortingDataDTO, WeighingDataDTO, StorageDataDTO, TransportationDataDTO, ThirdPartyTreatmentDataDTO, InternalTreatmentDataDTO, TreatmentResultDataDTO, TransportationResultDataDTO, RecyclingBeneficialUseDataDTO, FinalDisposalDataDTO, PhaseDataItem, Phase } from "./value-chain.schema.js"

// Mapping waste type dari database ke key yang digunakan di response
const WASTE_TYPE_MAPPING: Record<string, string> = {
  "Infeksius": "Infectious",
  "Non Infeksius": "Non-Infectious",
  "Limbah B3": "B3 waste",
  "Organik": "Organic",
  "Anorganik": "Inorganic",
  "Klinis/Medis": "Clinical/Medical",
  "Domestic": "Domestic",
}

// Mapping storage type dari database ke key yang digunakan di response
const STORAGE_TYPE_MAPPING: Record<string, string> = {
  "Cold Storage": "Cold Storage",
  "Temporary Stored": "Temporary Stored",
}

// Mapping waste group untuk treatment
const TREATMENT_GROUP_MAPPING: Record<string, string> = {
  "Infeksius": "Infectious",
  "Non Infeksius": "Non-Infectious",
  "Limbah B3": "B3 waste",
  "Organik": "Organic",
  "Anorganik": "Inorganic",
}

// Default categories untuk setiap tipe
const DEFAULT_WASTE_TYPES = ["Infectious", "Non-Infectious", "B3 waste", "Organic", "Inorganic"]
const DEFAULT_STORAGE_TYPES = ["Cold Storage", "Temporary Stored"]
const DEFAULT_TREATMENT_TYPES = ["Infectious", "Non-Infectious", "B3 waste", "Organic", "Inorganic"]
const DEFAULT_THIRD_PARTY_CATEGORIES = ["Infectious", "Non-Infectious", "B3 waste", "Organic", "Inorganic"]

// Helper function untuk ensure semua kategori ada
function ensureAllCategories(c: Context, data: PhaseDataItem[], expectedCategories: string[]): PhaseDataItem[] {
  const dataMap = new Map(data.map(item => [item.key, item.value]))
  
  return expectedCategories.map(category => ({
    key: c.var.t(`value_chain.category.${category}`),
    value: dataMap.get(c.var.t(`value_chain.category.${category}`)) || 0
  }))
}

export function buildSortingPhase(c: Context, data: SortingDataDTO[]): Phase {
  // Transform data ke format yang diminta
  const transformedData: PhaseDataItem[] = data.map((item) => {
    const key = WASTE_TYPE_MAPPING[item.waste_type_name] || item.waste_type_name
    return {
      key: c.var.t(`value_chain.category.${key}`),
      value: item.total_bags,
    }
  })

  // Ensure semua waste types ada
  const phaseData = ensureAllCategories(c, transformedData, DEFAULT_WASTE_TYPES)

  // Hitung total
  const total = phaseData.reduce((sum, item) => sum + item.value, 0)

  return {
    label: c.var.t("value_chain.phase.Sorting"),
    sequence: "01",
    total,
    data: phaseData,
  }
}

export function buildWeighingPhase(c: Context, data: WeighingDataDTO[]): Phase {
  // Transform data ke format yang diminta
  const transformedData: PhaseDataItem[] = data.map((item) => {
    const key = WASTE_TYPE_MAPPING[item.waste_type_name] || item.waste_type_name
    return {
      key: c.var.t(`value_chain.category.${key}`),
      value: parseFloat(item.total_weight_kg.toFixed(2)), // Round to 2 decimal places
    }
  })

  // Ensure semua waste types ada
  const phaseData = ensureAllCategories(c, transformedData, DEFAULT_WASTE_TYPES)

  // Hitung total
  const total = parseFloat(
    phaseData.reduce((sum, item) => sum + item.value, 0).toFixed(2)
  )

  return {
    label: c.var.t("value_chain.phase.Weighing"),
    sequence: "02",
    total,
    data: phaseData,
  }
}

export function buildStoragePhase(c: Context, data: StorageDataDTO[]): Phase {
  // Transform data ke format yang diminta
  const transformedData: PhaseDataItem[] = data.map((item) => {
    const key = STORAGE_TYPE_MAPPING[item.storage_type] || item.storage_type
    return {
      key: c.var.t(`value_chain.storage.${key}`),
      value: parseFloat(item.total_weight_kg.toFixed(2)), // Round to 2 decimal places
    }
  })

  // Ensure semua storage types ada dengan translation
  const dataMap = new Map(transformedData.map(item => [item.key, item.value]))
  const phaseData = DEFAULT_STORAGE_TYPES.map(category => ({
    key: c.var.t(`value_chain.storage.${category}`),
    value: dataMap.get(c.var.t(`value_chain.storage.${category}`)) || 0
  }))

  // Hitung total
  const total = parseFloat(
    phaseData.reduce((sum, item) => sum + item.value, 0).toFixed(2)
  )

  return {
    label: c.var.t("value_chain.phase.Storage"),
    sequence: "03",
    total,
    data: phaseData,
  }
}

export function buildTransportationPhase(c: Context, data: TransportationDataDTO[]): Phase {
  // Transform data ke format yang diminta
  const transformedData: PhaseDataItem[] = data.map((item) => {
    const key = WASTE_TYPE_MAPPING[item.waste_type_name] || item.waste_type_name
    return {
      key: c.var.t(`value_chain.category.${key}`),
      value: parseFloat(item.total_weight_kg.toFixed(2)), // Round to 2 decimal places
    }
  })

  // Ensure semua waste types ada
  const phaseData = ensureAllCategories(c, transformedData, DEFAULT_WASTE_TYPES)

  // Hitung total
  const total = parseFloat(
    phaseData.reduce((sum, item) => sum + item.value, 0).toFixed(2)
  )

  return {
    label: c.var.t("value_chain.phase.Transportation"),
    sequence: "04A",
    total,
    data: phaseData,
  }
}

export function buildThirdPartyTreatmentPhase(c: Context, data: ThirdPartyTreatmentDataDTO[]): Phase {
  // Data sudah dalam format yang benar dari query (Infectious, Non-Infectious, B3 waste, dst)
  const transformedData: PhaseDataItem[] = data
    .filter(item => DEFAULT_THIRD_PARTY_CATEGORIES.includes(item.waste_type_name))
    .map((item) => ({
      key: c.var.t(`value_chain.category.${item.waste_type_name}`),
      value: parseFloat(item.total_weight_kg.toFixed(2)),
    }))

  // Ensure semua categories ada
  const phaseData = ensureAllCategories(c, transformedData, DEFAULT_THIRD_PARTY_CATEGORIES)

  // Hitung total
  const total = parseFloat(
    phaseData.reduce((sum, item) => sum + item.value, 0).toFixed(2)
  )

  return {
    label: c.var.t("value_chain.phase.Third Party Treatment"),
    sequence: "05",
    total,
    data: phaseData,
  }
}

export function buildInternalTreatmentPhase(c: Context, data: InternalTreatmentDataDTO[]): Phase {
  // Transform data ke format yang diminta - use treatment_method directly (Autoclave, Incineration)
  // Filter out only null values, keep 0 values
  const transformedData: PhaseDataItem[] = data
    .filter((item) => item.total_weight_kg != null)
    .map((item) => ({
      key: c.var.t(`value_chain.treatment_method.${item.treatment_method}`),
      value: parseFloat((item.total_weight_kg || 0).toFixed(2)),
    }))

  // Hitung total
  const total = parseFloat(
    transformedData.reduce((sum, item) => sum + item.value, 0).toFixed(2)
  )

  return {
    label: c.var.t("value_chain.phase.Internal Treatment"),
    sequence: "04 B",
    total,
    data: transformedData,
  }
}

export function buildTreatmentResultPhase(c: Context, data: TreatmentResultDataDTO[]): Phase {
  // Transform data ke format yang diminta - use treatment_method directly (Autoclave, Incineration)
  // Filter out only null values, keep 0 values
  const transformedData: PhaseDataItem[] = data
    .filter((item) => item.total_weight_kg != null)
    .map((item) => ({
      key: c.var.t(`value_chain.treatment_method.${item.treatment_method}`),
      value: parseFloat((item.total_weight_kg || 0).toFixed(2)),
    }))

  // Hitung total
  const total = parseFloat(
    transformedData.reduce((sum, item) => sum + item.value, 0).toFixed(2)
  )

  return {
    label: c.var.t("value_chain.phase.Treatment Result"),
    sequence: "05",
    total,
    data: transformedData,
  }
}

export function buildTransportationResultPhase(c: Context, data: TransportationResultDataDTO[]): Phase {
  // Transform data ke format yang diminta - use treatment_method directly (Autoclave, Incineration)
  // Filter out only null values, keep 0 values
  const transformedData: PhaseDataItem[] = data
    .filter((item) => item.total_weight_kg != null)
    .map((item) => ({
      key: c.var.t(`value_chain.treatment_method.${item.treatment_method}`),
      value: parseFloat((item.total_weight_kg || 0).toFixed(2)),
    }))

  // Hitung total
  const total = parseFloat(
    transformedData.reduce((sum, item) => sum + item.value, 0).toFixed(2)
  )

  return {
    label: c.var.t("value_chain.phase.Transportation"),
    sequence: "06",
    total,
    data: transformedData,
  }
}

export function buildRecyclingBeneficialUsePhase(c: Context, data: RecyclingBeneficialUseDataDTO[]): Phase {
  // Transform data ke format yang diminta - use treatment_method directly (Autoclave only)
  // Filter out only null values, keep 0 values
  const transformedData: PhaseDataItem[] = data
    .filter((item) => item.total_weight_kg != null)
    .map((item) => ({
      key: c.var.t(`value_chain.treatment_method.${item.treatment_method}`),
      value: parseFloat((item.total_weight_kg || 0).toFixed(2)),
    }))

  // Hitung total
  const total = parseFloat(
    transformedData.reduce((sum, item) => sum + item.value, 0).toFixed(2)
  )

  return {
    label: c.var.t("value_chain.phase.Recycling/Beneficial Use"),
    sequence: "07 A",
    total,
    data: transformedData,
  }
}

export function buildFinalDisposalPhase(c: Context, data: FinalDisposalDataDTO[]): Phase {
  // Transform data ke format yang diminta - use treatment_method directly (Incineration only)
  // Filter out only null values, keep 0 values
  const transformedData: PhaseDataItem[] = data
    .filter((item) => item.total_weight_kg != null)
    .map((item) => ({
      key: c.var.t(`value_chain.treatment_method.${item.treatment_method}`),
      value: parseFloat((item.total_weight_kg || 0).toFixed(2)),
    }))

  // Hitung total
  const total = parseFloat(
    transformedData.reduce((sum, item) => sum + item.value, 0).toFixed(2)
  )

  return {
    label: c.var.t("value_chain.phase.Final Disposal"),
    sequence: "07 B",
    total,
    data: transformedData,
  }
}
