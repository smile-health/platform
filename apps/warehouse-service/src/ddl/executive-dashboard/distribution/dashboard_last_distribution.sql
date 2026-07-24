-- dashboard_last_distribution definition

CREATE TABLE dashboard_last_distribution
(

    `program_id` Int8,

    `period` String,

    `entities_province_id` Nullable(Int64),

    `entities_province_name` LowCardinality(Nullable(String)),

    `entities_regency_id` Nullable(Int64),

    `entities_regency_name` LowCardinality(Nullable(String)),

    `material_type_id` Nullable(Int32),

    `material_type_name` LowCardinality(Nullable(String)),

    `parent_material_id` Nullable(Int32),

    `parent_material_name` String,

    `received` Float64,

    `distribution_last_mile` Float64
)
ENGINE = ReplicatedReplacingMergeTree('/clickhouse/tables/{uuid}/{shard}',
 '{replica}')
ORDER BY (period,
 program_id,
 entities_province_id,
 entities_regency_id,
 material_type_id,
 parent_material_id)
SETTINGS allow_nullable_key = 1,
 replicated_deduplication_window = 0,
 index_granularity = 8192;