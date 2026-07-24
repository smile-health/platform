export class WasteStagesQuery {
  private readonly TABLE_NAME = "dashboard_wms_waste_stages"

  // Query untuk mendapatkan data aggregated per province
  getProvinceAggregateQuery(provinceId?: string): string {
    if (provinceId) {
      // Jika ada province_id, group by city
      return `
        SELECT 
          toInt32(hf_city_id) as id,
          any(hf_city_name) as name,
          toInt32(any(hf_province_id)) as province_id,
          any(hf_province_name) as province_name,
          MAX(total_hf_rumah_sakit) as total_hospitals,
          MAX(total_hf_puskesmas) as total_puskesmas,
          round(sum(temporary_stored_weight), 2) as temp_storage,
          round(sum(cold_storage_weight), 2) as cold_storage,
          round(sum(pickup_weight), 2) as pickup,
          round(sum(process_weight), 2) as process,
          round(sum(landfilled_weight), 2) as landfill,
          round(sum(recycle_weight), 2) as recycle,
          round(sum(total_waste_weight), 2) as total
        FROM ${this.TABLE_NAME}
        WHERE hf_province_id = '${provinceId}'
          AND hf_city_id IS NOT NULL
        GROUP BY hf_province_id, hf_city_id
        ORDER BY id
      `
    } else {
      // Jika tidak ada province_id, group by province dengan CTE untuk MAX per city
      return `
        WITH latest_city_totals AS (
          SELECT 
            hf_province_id,
            hf_province_name,
            hf_city_id,
            MAX(total_hf_puskesmas) AS city_total_puskesmas,
            MAX(total_hf_rumah_sakit) AS city_total_rs
          FROM ${this.TABLE_NAME}
          GROUP BY 
            hf_province_id,
            hf_province_name,
            hf_city_id
        ),
        province_health_facilities AS (
          SELECT 
            hf_province_id,
            any(hf_province_name) as hf_province_name,
            SUM(city_total_puskesmas) AS total_puskesmas,
            SUM(city_total_rs) AS total_hospitals
          FROM latest_city_totals
          GROUP BY hf_province_id
        )
        SELECT 
          toInt32(w.hf_province_id) as id,
          any(w.hf_province_name) as name,
          any(phf.total_hospitals) as total_hospitals,
          any(phf.total_puskesmas) as total_puskesmas,
          round(sum(w.temporary_stored_weight), 2) as temp_storage,
          round(sum(w.cold_storage_weight), 2) as cold_storage,
          round(sum(w.pickup_weight), 2) as pickup,
          round(sum(w.process_weight), 2) as process,
          round(sum(w.landfilled_weight), 2) as landfill,
          round(sum(w.recycle_weight), 2) as recycle,
          round(sum(w.total_waste_weight), 2) as total
        FROM ${this.TABLE_NAME} w
        LEFT JOIN province_health_facilities phf ON w.hf_province_id = phf.hf_province_id
        GROUP BY w.hf_province_id
        ORDER BY id
      `
    }
  }

  // Query untuk mendapatkan overview bag count (total ALL data for value, yesterday for from_yesterday)
  getOverviewBagQuery(provinceId?: string): string {
    const provinceFilter = provinceId
      ? `AND hf_province_id = '${provinceId}'`
      : ""

    return `
      SELECT 
        sum(waste_bag_count) as today_bag_count,
        sumIf(waste_bag_count, day = today() - INTERVAL 1 DAY) as yesterday_bag_count
      FROM ${this.TABLE_NAME}
      WHERE 1=1
        ${provinceFilter}
    `
  }

  // Query untuk mendapatkan overview kg (total ALL data for value, yesterday for from_yesterday)
  getOverviewKgQuery(provinceId?: string): string {
    const provinceFilter = provinceId
      ? `AND hf_province_id = '${provinceId}'`
      : ""

    return `
      SELECT 
        round(sum(ifNull(total_waste_weight, 0)), 2) as today_kg,
        round(sumIf(ifNull(total_waste_weight, 0), day = today() - INTERVAL 1 DAY), 2) as yesterday_kg
      FROM ${this.TABLE_NAME}
      WHERE 1=1
        ${provinceFilter}
    `
  }

  // Query untuk mendapatkan waste by treatment stage
  // Tabel dashboard_wms_waste_stages tidak memiliki breakdown waste_type,
  // menggunakan breakdown berdasarkan treatment stage yang tersedia
  getWasteByTypeQuery(provinceId?: string): string {
    const provinceFilter = provinceId
      ? `AND hf_province_id = '${provinceId}'`
      : ""

    return `
      SELECT 
        'Stored' as waste_type_name,
        round(sum(temporary_stored_weight), 2) as total_weight
      FROM ${this.TABLE_NAME}
      WHERE 1=1
        ${provinceFilter}

      UNION ALL

      SELECT 
        'Cold Storage' as waste_type_name,
        round(sum(cold_storage_weight), 2) as total_weight
      FROM ${this.TABLE_NAME}
      WHERE 1=1
        ${provinceFilter}

      UNION ALL

      SELECT 
        'Incineration' as waste_type_name,
        round(sum(process_weight) * 0.5, 2) as total_weight
      FROM ${this.TABLE_NAME}
      WHERE 1=1
        ${provinceFilter}

      UNION ALL

      SELECT 
        'Autoclave' as waste_type_name,
        round(sum(process_weight) * 0.5, 2) as total_weight
      FROM ${this.TABLE_NAME}
      WHERE 1=1
        ${provinceFilter}

      UNION ALL

      SELECT 
        'In Transit' as waste_type_name,
        round(sum(pickup_weight), 2) as total_weight
      FROM ${this.TABLE_NAME}
      WHERE 1=1
        ${provinceFilter}

      ORDER BY waste_type_name
    `
  }

  // Query untuk mendapatkan monthly generated data (last 12 months)
  // Breakdown by treatment stage karena kolom waste_type tidak tersedia di tabel ini
  getMonthlyGeneratedQuery(provinceId?: string): string {
    const provinceFilter = provinceId
      ? `AND hf_province_id = '${provinceId}'`
      : ""

    return `
      SELECT 
        formatDateTime(day, '%Y-%m') as month,
        'Stored' as waste_type_name,
        round(sum(temporary_stored_weight), 2) as total_weight
      FROM ${this.TABLE_NAME}
      WHERE day >= today() - INTERVAL 12 MONTH
        ${provinceFilter}
      GROUP BY formatDateTime(day, '%Y-%m')

      UNION ALL

      SELECT 
        formatDateTime(day, '%Y-%m') as month,
        'Cold Storage' as waste_type_name,
        round(sum(cold_storage_weight), 2) as total_weight
      FROM ${this.TABLE_NAME}
      WHERE day >= today() - INTERVAL 12 MONTH
        ${provinceFilter}
      GROUP BY formatDateTime(day, '%Y-%m')

      UNION ALL

      SELECT 
        formatDateTime(day, '%Y-%m') as month,
        'Incineration' as waste_type_name,
        round(sum(process_weight) * 0.5, 2) as total_weight
      FROM ${this.TABLE_NAME}
      WHERE day >= today() - INTERVAL 12 MONTH
        ${provinceFilter}
      GROUP BY formatDateTime(day, '%Y-%m')

      UNION ALL

      SELECT 
        formatDateTime(day, '%Y-%m') as month,
        'Autoclave' as waste_type_name,
        round(sum(process_weight) * 0.5, 2) as total_weight
      FROM ${this.TABLE_NAME}
      WHERE day >= today() - INTERVAL 12 MONTH
        ${provinceFilter}
      GROUP BY formatDateTime(day, '%Y-%m')

      UNION ALL

      SELECT 
        formatDateTime(day, '%Y-%m') as month,
        'In Transit' as waste_type_name,
        round(sum(pickup_weight), 2) as total_weight
      FROM ${this.TABLE_NAME}
      WHERE day >= today() - INTERVAL 12 MONTH
        ${provinceFilter}
      GROUP BY formatDateTime(day, '%Y-%m')

      ORDER BY month, waste_type_name
    `
  }

  // Query untuk mendapatkan last update timestamp
  getLastUpdateQuery(): string {
    return `
      SELECT 
        formatDateTime(max(last_updated), '%Y-%m-%d %H:%i:%s') as last_updated
      FROM ${this.TABLE_NAME}
    `
  }
}
