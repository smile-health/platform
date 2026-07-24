export interface WasteGeneratedFilters {
  provinceId?: string
  wasteGroupId?: number
  wasteTypeId?: number
  wasteCharacteristicsId?: number
}

export class WasteGeneratedQuery {
  private readonly TABLE_NAME = "dashboard_wms_waste_generated"

  private buildFilterConditions(filters: WasteGeneratedFilters): string {
    const conditions: string[] = []

    if (filters.provinceId) {
      conditions.push(`hf_province_id = '${filters.provinceId}'`)
    }

    if (filters.wasteGroupId) {
      conditions.push(`waste_group_id = ${filters.wasteGroupId}`)
    }

    if (filters.wasteTypeId) {
      conditions.push(`waste_type_id = ${filters.wasteTypeId}`)
    }

    if (filters.wasteCharacteristicsId) {
      conditions.push(
        `waste_characteristics_id = ${filters.wasteCharacteristicsId}`
      )
    }

    return conditions.length > 0 ? `AND ${conditions.join(" AND ")}` : ""
  }

  // Query untuk mendapatkan data inventory berdasarkan province_id (optional)
  getInventoryDataQuery(filters: WasteGeneratedFilters = {}): string {
    const filterConditions = this.buildFilterConditions(filters)

    return `
      SELECT
        day,
        month,
        hf_province_id,
        hf_province_name,
        hf_city_id,
        hf_city_name,
        max(total_hf_puskesmas) AS total_hf_puskesmas,
        max(total_hf_rumah_sakit) AS total_hf_rumah_sakit,
        SUM(waste_bag_count) AS total_bags,
        SUM(ifNull(total_waste_weight, 0)) AS total_weight,
        sumIf(ifNull(total_waste_weight, 0), waste_group_name = 'Infeksius') AS clinical_infectious_weight_kg,
        sumIf(waste_bag_count, waste_group_name = 'Infeksius') AS clinical_infectious_bag_count,
        sumIf(ifNull(total_waste_weight, 0), waste_group_name = 'Non Infeksius') AS clinical_non_infectious_weight_kg,
        sumIf(waste_bag_count, waste_group_name = 'Non Infeksius') AS clinical_non_infectious_bag_count,
        sumIf(ifNull(total_waste_weight, 0), waste_group_name = 'Anorganik') AS domestic_anorganik_weight_kg,
        sumIf(waste_bag_count, waste_group_name = 'Anorganik') AS domestic_anorganik_bag_count,
        sumIf(ifNull(total_waste_weight, 0), waste_group_name = 'Organik') AS domestic_organik_weight_kg,
        sumIf(waste_bag_count, waste_group_name = 'Organik') AS domestic_organik_bag_count,
        sumIf(ifNull(total_waste_weight, 0), waste_type_name = 'Limbah B3') AS hazard_toxic_weight_kg,
        sumIf(waste_bag_count, waste_type_name = 'Limbah B3') AS hazard_toxic_bag_count
      FROM ${this.TABLE_NAME} FINAL
      WHERE 1=1
        ${filterConditions}
      GROUP BY
        day,
        month,
        hf_province_id,
        hf_province_name,
        hf_city_id,
        hf_city_name
      ORDER BY
        day,
        hf_province_id
    `
  }

  // Query untuk mendapatkan health facility count per province/city
  getHealthFacilityCountQuery(filters: WasteGeneratedFilters = {}): string {
    const filterConditions = this.buildFilterConditions(filters)

    if (filters.provinceId) {
      // Jika ada province_id, group by city
      return `
        SELECT 
          hf_province_name,
          hf_city_name,
          MAX(total_hf_puskesmas) AS total_puskesmas,
          MAX(total_hf_rumah_sakit) AS total_rumah_sakit
        FROM ${this.TABLE_NAME} FINAL
        WHERE hf_city_id IS NOT NULL
          ${filterConditions}
        GROUP BY 
          hf_province_id,
          hf_province_name,
          hf_city_id,
          hf_city_name
        ORDER BY 
          hf_province_name ASC,
          hf_city_name ASC
      `
    } else {
      // Jika tidak ada province_id, group by province
      return `
        WITH latest_city_totals AS (
          SELECT 
            hf_province_id,
            hf_province_name,
            hf_city_id,
            MAX(total_hf_puskesmas) AS city_total_puskesmas,
            MAX(total_hf_rumah_sakit) AS city_total_rs
          FROM ${this.TABLE_NAME} FINAL
          WHERE 1=1
            ${filterConditions}
          GROUP BY 
            hf_province_id,
            hf_province_name,
            hf_city_id
        )
        SELECT 
          hf_province_name,
          SUM(city_total_puskesmas) AS total_puskesmas,
          SUM(city_total_rs) AS total_rumah_sakit
        FROM latest_city_totals
        GROUP BY 
          hf_province_id,
          hf_province_name
        ORDER BY 
          hf_province_name ASC
      `
    }
  }

  // Query untuk mendapatkan data kemarin (untuk perbandingan)
  getYesterdayDataQuery(filters: WasteGeneratedFilters = {}): string {
    const filterConditions = this.buildFilterConditions(filters)

    return `
      SELECT 
        SUM(waste_bag_count) as waste_bag_count,
        SUM(total_waste_weight) as total_waste_weight
      FROM ${this.TABLE_NAME} FINAL
      WHERE day = today() - INTERVAL 1 DAY
        ${filterConditions}
    `
  }

  // Query untuk mendapatkan data hari ini (untuk perbandingan)
  getTodayDataQuery(filters: WasteGeneratedFilters = {}): string {
    const filterConditions = this.buildFilterConditions(filters)

    return `
      SELECT 
        SUM(waste_bag_count) as waste_bag_count,
        SUM(total_waste_weight) as total_waste_weight
      FROM ${this.TABLE_NAME} FINAL
      WHERE day = today()
        ${filterConditions}
    `
  }

  // Query untuk mendapatkan last update timestamp
  getLastUpdateQuery(): string {
    return `
      SELECT 
        formatDateTime(max(last_updated), '%Y-%m-%d %H:%i:%S') as last_updated
      FROM ${this.TABLE_NAME} FINAL
    `
  }

  // Query untuk mendapatkan data 12 bulan terakhir dengan breakdown waste type
  getLast12MonthsDataQuery(filters: WasteGeneratedFilters = {}): string {
    const filterConditions = this.buildFilterConditions(filters)

    return `
      SELECT 
        toYYYYMM(day) AS month_id,
        formatDateTime(toStartOfMonth(day), '%b %y') AS month_label,
        waste_group_name AS waste_type_name,
        SUM(waste_bag_count) AS waste_bag_count,
        SUM(total_waste_weight) AS total_waste_weight
      FROM ${this.TABLE_NAME} FINAL
      WHERE day >= toStartOfMonth(today()) - INTERVAL 12 MONTH
        AND day < toStartOfMonth(today())
        ${filterConditions}
      GROUP BY month_id, month_label, waste_group_name
      ORDER BY month_id, waste_group_name
    `
  }

  // Query untuk mendapatkan last available month
  getLastAvailableMonthQuery(): string {
    return `
      SELECT 
        toYYYYMM(max(day)) as last_month,
        formatDateTime(toStartOfMonth(max(day)), '%b %Y') as last_month_label
      FROM ${this.TABLE_NAME} FINAL
      WHERE day < toStartOfMonth(today())
    `
  }

  // Query untuk mendapatkan provinces/cities dengan waste TERBANYAK (last month)
  getMostWasteQuery(filters: WasteGeneratedFilters = {}): string {
    const filterConditions = this.buildFilterConditions(filters)

    if (filters.provinceId) {
      // Jika ada province_id, tampilkan ranking per city
      return `
        SELECT 
          hf_city_id as area_id,
          hf_city_name as area_name,
          SUM(total_waste_weight) as total_waste
        FROM ${this.TABLE_NAME} FINAL
        WHERE toYYYYMM(day) = (
          SELECT toYYYYMM(max(day)) 
          FROM ${this.TABLE_NAME} FINAL
          WHERE day < toStartOfMonth(today())
        )
          AND hf_city_id IS NOT NULL
          AND hf_city_name IS NOT NULL
          ${filterConditions}
        GROUP BY hf_city_id, hf_city_name
        ORDER BY total_waste DESC
        LIMIT 10
      `
    } else {
      // Jika tidak ada province_id, tampilkan ranking per province
      return `
        SELECT 
          hf_province_id as area_id,
          hf_province_name as area_name,
          SUM(total_waste_weight) as total_waste
        FROM ${this.TABLE_NAME} FINAL
        WHERE toYYYYMM(day) = (
          SELECT toYYYYMM(max(day)) 
          FROM ${this.TABLE_NAME} FINAL
          WHERE day < toStartOfMonth(today())
        )
          AND hf_province_id IS NOT NULL
          AND hf_province_name IS NOT NULL
          ${filterConditions}
        GROUP BY hf_province_id, hf_province_name
        ORDER BY total_waste DESC
        LIMIT 10
      `
    }
  }

  // Query untuk mendapatkan provinces/cities dengan waste PALING SEDIKIT (last month)
  getLowestWasteQuery(filters: WasteGeneratedFilters = {}): string {
    const filterConditions = this.buildFilterConditions(filters)

    if (filters.provinceId) {
      // Jika ada province_id, tampilkan ranking per city
      return `
        SELECT 
          hf_city_id as area_id,
          hf_city_name as area_name,
          SUM(total_waste_weight) as total_waste
        FROM ${this.TABLE_NAME} FINAL
        WHERE toYYYYMM(day) = (
          SELECT toYYYYMM(max(day)) 
          FROM ${this.TABLE_NAME} FINAL
          WHERE day < toStartOfMonth(today())
        )
          AND hf_city_id IS NOT NULL
          AND hf_city_name IS NOT NULL
          ${filterConditions}
        GROUP BY hf_city_id, hf_city_name
        ORDER BY total_waste ASC
        LIMIT 10
      `
    } else {
      // Jika tidak ada province_id, tampilkan ranking per province
      return `
        SELECT 
          hf_province_id as area_id,
          hf_province_name as area_name,
          SUM(total_waste_weight) as total_waste
        FROM ${this.TABLE_NAME} FINAL
        WHERE toYYYYMM(day) = (
          SELECT toYYYYMM(max(day)) 
          FROM ${this.TABLE_NAME} FINAL
          WHERE day < toStartOfMonth(today())
        )
          AND hf_province_id IS NOT NULL
          AND hf_province_name IS NOT NULL
          ${filterConditions}
        GROUP BY hf_province_id, hf_province_name
        ORDER BY total_waste ASC
        LIMIT 10
      `
    }
  }
}
