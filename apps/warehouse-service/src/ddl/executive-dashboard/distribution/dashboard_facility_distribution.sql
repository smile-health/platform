-- dashboard_facility_distribution definition

CREATE TABLE dashboard_facility_distribution
(

    `program_id` Int32,

    `year` UInt32,

    `entity_province_id` Nullable(String),

    `entity_province_name` String,

    `entity_regency_id` Nullable(String),

    `entity_regency_name` String,

    `total_entities` UInt64,

    `total_active_entities` UInt64,

    `persentase_entity_aktif` Float64
)
ENGINE = ReplicatedReplacingMergeTree('/clickhouse/tables/{uuid}/{shard}',
 '{replica}')
ORDER BY (program_id,
 year,
 entity_province_id,
 entity_province_name,
 entity_regency_id,
 entity_regency_name)
SETTINGS allow_nullable_key = 1,
 replicated_deduplication_window = 0,
 index_granularity = 8192;