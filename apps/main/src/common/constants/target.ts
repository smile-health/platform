export const TARGET_GROUP_NAME_TRANSFORM = {
  1: "Bayi Baru Lahir",
  2: "Surviving Infant",
  3: "Bawah Dua Tahun",
  4: "Murid Kelas 1 SD",
  4.1: "Usia 7 Tahun",
  5: "Murid Kelas 2 SD",
  5.1: "Usia 8 Tahun",
  7: "Murid Wanita Kelas 5 SD",
  7.1: "Wanita Usia 11 Tahun",
  13: "Murid Laki-Laki Kelas 5 SD",
  13.1: "Laki-laki Usia 11 Tahun",
  9: "Wanita Usia Subur",
}

export const TARGET_GROUP_ORDER = [1, 2, 3, 4, 5, 7, 13, 9]
export const OUT_OF_SCHOOL_TARGET_GROUPS = [4.1, 5.1, 7.1, 13.1]

export const VILLAGE_TARGET_GROUPS = [1, 2, 3, 9]

export const VILLAGE_TARGET_LABELS = {
  1: "Bayi Baru Lahir",
  2: "Surviving Infant",
  3: "Bawah Dua Tahun",
  9: "Wanita Usia Subur",
}

export const SCHOOL_TARGET_GROUPS = [4, 5, 7, 10]

export const SCHOOL_TARGET_LABELS = {
  4: "Murid Kelas 1 SD (Setara Usia 7 Tahun)",
  5: "Murid Kelas 2 SD (Setara Usia 8 Tahun)",
  7: "Murid Kelas 5 SD (Setara Usia 11 Tahun)",
}

export const BIAS_TARGET_LABELS = {
  4: "Murid Kelas 1 SD (Setara Usia 7 Tahun)",
  5: "Murid Kelas 2 SD (Setara Usia 8 Tahun)",
  7: "Murid Wanita Kelas 5 SD (Setara Usia 11 Tahun)",
  11: "Murid Laki Laki Kelas 5 SD (Setara Usia 11 Tahun)",
}

export const BIAS_TARGET_LABELS_V2 = {
  4: "Murid Kelas 1 SD (Setara Usia 7 Tahun)",
  5: "Murid Kelas 2 SD (Setara Usia 8 Tahun)",
  12: "Murid Kelas 5 SD (Setara Usia 11 Tahun)",
  13: "Murid Kelas Wanita 5 SD (Setara Usia 11 Tahun)",
}

export const BIAS_COMBINED_TARGET_LABELS: Record<number, string> = {
  4: "Murid Kelas 1 SD/Usia 7 Tahun",
  5: "Murid Kelas 2 SD/Usia 8 Tahun",
  7: "Murid Wanita Kelas 5 SD/Wanita Usia 11 Tahun",
  13: "Murid Laki-Laki Kelas 5 SD/Laki-laki Usia 11 Tahun",
}

export const GENDER_MALE = 1
export const GENDER_FEMALE = 2

/**
 * Target groups that are restricted to female only.
 * Group 7 = Murid Wanita Kelas 5 SD, Group 8 & 9 = WUS/perempuan.
 */
export const FEMALE_ONLY_TARGET_GROUPS = [7, 8, 9]

/**
 * Target groups that are restricted to male only.
 * Group 10 = Murid Laki-laki Kelas 5 SD.
 */
export const MALE_ONLY_TARGET_GROUPS = [10]

export const SCHOOL_ENTITY_TAG_ID = 14

export const WUS_COVERAGE_PERCENTAGE = 10 // original = 10
export const OUTREACH_SERVICE_CAPACITY = 40
export const FACILITY_SERVICE_CAPACITY = 70 // original = 70
export const WORKERS_PER_SERVICE_POINT = 5 // original = 5

export const VILLAGE_LABEL = "DESA"

export const TARGET_GROUP = {
  MALE: [1, 2, 3, 4, 5, 11],
  FEMALE: [1, 2, 3, 4, 5, 7, 9],
}

export const NON_BIAS_ACTIVITY = "Rutin"
export const BIAS_ACTIVITY = "Bias"

export const BBL_INJECTION_DOSE = 2
export const SI_INJECTION_DOSE = 8
export const BADUTA_INJECTION_DOSE = 3
export const PERCENTAGE_50 = 50
export const PERCENTAGE_100 = 100
export const TOTAL_MONTH = 12
