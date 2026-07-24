export class ValueChainQuery {
  private readonly tableName = "dashboard_wms_value_chain"

  // Query untuk data Sorting - semua bags dianggap sudah melalui sorting, grouped by waste_group
  getSortingDataQuery(): string {
    return `
      SELECT 
        CASE 
          WHEN waste_group_name = 'Infeksius' THEN 'Infectious'
          WHEN waste_group_name = 'Non Infeksius' THEN 'Non-Infectious'
          WHEN waste_group_name = 'Limbah B3' THEN 'B3 waste'
          WHEN waste_group_name = 'Organik' THEN 'Organic'
          WHEN waste_group_name = 'Anorganik' THEN 'Inorganic'
          ELSE waste_group_name
        END as waste_type_name,
        sum(sorting) as total_bags
      FROM ${this.tableName}
      GROUP BY waste_type_name
      ORDER BY total_bags DESC
    `
  }

  // Query untuk data Weighing - bags yang memiliki data berat, grouped by waste_group
  getWeighingDataQuery(): string {
    return `
      SELECT 
        CASE 
          WHEN waste_group_name = 'Infeksius' THEN 'Infectious'
          WHEN waste_group_name = 'Non Infeksius' THEN 'Non-Infectious'
          WHEN waste_group_name = 'Limbah B3' THEN 'B3 waste'
          WHEN waste_group_name = 'Organik' THEN 'Organic'
          WHEN waste_group_name = 'Anorganik' THEN 'Inorganic'
          ELSE waste_group_name
        END as waste_type_name,
        sum(weighing) as total_weight_kg
      FROM ${this.tableName}
      WHERE weighing IS NOT NULL
      GROUP BY waste_type_name
      ORDER BY total_weight_kg DESC
    `
  }

  // Query untuk data Storage - berdasarkan jenis tempat penyimpanan (cold storage vs temporary)
  getStorageDataQuery(): string {
    return `
      SELECT 
        storage_type,
        sum(total_weight_kg) as total_weight_kg
      FROM (
        SELECT
          'Cold Storage' as storage_type,
          storage_cold_storage as total_weight_kg
        FROM ${this.tableName}
        WHERE storage_cold_storage IS NOT NULL AND storage_cold_storage > 0
        UNION ALL
        SELECT
          'Temporary Stored' as storage_type,
          storage_temporary_storage as total_weight_kg
        FROM ${this.tableName}
        WHERE storage_temporary_storage IS NOT NULL AND storage_temporary_storage > 0
      )
      GROUP BY storage_type
      ORDER BY total_weight_kg DESC
    `
  }

  // Query untuk data Transportation - bags yang pernah/sudah di-transport ke external, grouped by waste_group
  getTransportationDataQuery(): string {
    return `
      SELECT 
        CASE 
          WHEN waste_group_name = 'Infeksius' THEN 'Infectious'
          WHEN waste_group_name = 'Non Infeksius' THEN 'Non-Infectious'
          WHEN waste_group_name = 'Limbah B3' THEN 'B3 waste'
          WHEN waste_group_name = 'Organik' THEN 'Organic'
          WHEN waste_group_name = 'Anorganik' THEN 'Inorganic'
          ELSE waste_group_name
        END as waste_type_name,
        sum(transportation_4a) as total_weight_kg
      FROM ${this.tableName}
      WHERE transportation_4a IS NOT NULL AND transportation_4a > 0
      GROUP BY waste_type_name
      ORDER BY total_weight_kg DESC
    `
  }

  // Query untuk data Third Party Treatment - bags yang sudah di-treatment pihak ketiga, grouped by waste_group
  getThirdPartyTreatmentDataQuery(): string {
    return `
      SELECT 
        CASE 
          WHEN waste_group_name = 'Infeksius' THEN 'Infectious'
          WHEN waste_group_name = 'Non Infeksius' THEN 'Non-Infectious'
          WHEN waste_group_name = 'Limbah B3' THEN 'B3 waste'
          WHEN waste_group_name = 'Organik' THEN 'Organic'
          WHEN waste_group_name = 'Anorganik' THEN 'Inorganic'
          ELSE waste_group_name
        END as waste_type_name,
        sum(third_party_treatment) as total_weight_kg
      FROM ${this.tableName}
      WHERE third_party_treatment IS NOT NULL AND third_party_treatment > 0
      GROUP BY waste_type_name
      ORDER BY total_weight_kg DESC
    `
  }

  // Query untuk data Internal Treatment - bags yang sedang/sudah di-treatment by method
  getInternalTreatmentDataQuery(): string {
    return `
      SELECT 
        'Autoclave' as treatment_method,
        COALESCE(sum(internal_treatment_autoclave), 0) as total_weight_kg
      FROM ${this.tableName}
      UNION ALL
      SELECT 
        'Incineration' as treatment_method,
        COALESCE(sum(internal_treatment_incineration), 0) as total_weight_kg
      FROM ${this.tableName}
      ORDER BY total_weight_kg DESC
    `
  }

  // Query untuk data Treatment Result - bags yang sudah selesai di-treatment (hasil akhir) by method
  getTreatmentResultDataQuery(): string {
    return `
      SELECT 
        'Autoclave' as treatment_method,
        COALESCE(sum(treatment_result_autoclave), 0) as total_weight_kg
      FROM ${this.tableName}
      UNION ALL
      SELECT 
        'Incineration' as treatment_method,
        COALESCE(sum(treatment_result_incineration), 0) as total_weight_kg
      FROM ${this.tableName}
      ORDER BY total_weight_kg DESC
    `
  }

  // Query untuk data Transportation Result - waste yang sudah di-treated dan kemudian di-transport by method
  getTransportationResultDataQuery(): string {
    return `
      SELECT 
        'Autoclave' as treatment_method,
        COALESCE(sum(transportation_6_autoclave), 0) as total_weight_kg
      FROM ${this.tableName}
      UNION ALL
      SELECT 
        'Incineration' as treatment_method,
        COALESCE(sum(transportation_6_incineration), 0) as total_weight_kg
      FROM ${this.tableName}
      ORDER BY total_weight_kg DESC
    `
  }

  // Query untuk data Recycling/Beneficial Use - waste yang di-recycle dari hasil treatment (Autoclave only)
  getRecyclingBeneficialUseDataQuery(): string {
    return `
      SELECT 
        'Autoclave' as treatment_method,
        COALESCE(sum(recycling_autoclave), 0) as total_weight_kg
      FROM ${this.tableName}
      ORDER BY total_weight_kg DESC
    `
  }

  // Query untuk data Final Disposal - waste yang di-dispose final (Incineration only)
  getFinalDisposalDataQuery(): string {
    return `
      SELECT 
        'Incineration' as treatment_method,
        COALESCE(sum(final_disposal_incineration), 0) as total_weight_kg
      FROM ${this.tableName}
      ORDER BY total_weight_kg DESC
    `
  }

  getLastUpdateQuery(): string {
    return `
      SELECT 
        formatDateTime(max(last_updated), '%Y-%m-%d %H:%i:%S') as last_updated
      FROM ${this.tableName}
    `
  }
}
