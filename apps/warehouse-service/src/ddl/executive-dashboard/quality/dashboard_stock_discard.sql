-- dashboard_stock_discard definition

CREATE TABLE dashboard_stock_discard
(

    `program_id` Int8,

    `period` String,

    `entities_province_id` Nullable(Int64),

    `entities_province_name` LowCardinality(Nullable(String)),

    `entities_regency_id` Nullable(Int64),

    `entities_regency_name` LowCardinality(Nullable(String)),

    `parent_material_id` Nullable(Int32),

    `global_parent_material_id` Int64,

    `parent_material_name` String,

    `reason_category` String,

    `discard` Float64
)
ENGINE = ReplicatedReplacingMergeTree('/clickhouse/tables/{uuid}/{shard}',
 '{replica}')
ORDER BY (program_id,
 period,
 entities_province_id,
 entities_regency_id,
 parent_material_id,
 global_parent_material_id)
SETTINGS allow_nullable_key = 1,
 replicated_deduplication_window = 0,
 index_granularity = 8192;