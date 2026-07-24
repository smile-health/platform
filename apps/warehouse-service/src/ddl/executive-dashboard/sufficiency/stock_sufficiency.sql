-- dashboard_stock_sufficiency definition

CREATE TABLE dashboard_stock_sufficiency
(

    `period` String,

    `program_id` Int32,

    `material_type_id` Int64,

    `material_type_name` String,

    `entity_tags_id` Nullable(Int64),

    `entity_tags_title` Nullable(String),

    `entities_id` Nullable(Int64),

    `global_entities_id` Int64,

    `parent_material_id` Nullable(Int64),

    `parent_material_name` String,

    `global_parent_material_id` Int64,

    `entities_province_id` Nullable(Int64),

    `entities_province_name` String,

    `entities_regency_id` Nullable(Int64),

    `entities_regency_name` String,

    `entities_name` Nullable(String),

    `entities_type` Nullable(Int64),

    `balance_per_entity_parent_materials` Float64,

    `monthly_consumption_qty` Float64,

    `regency_rollup_qty` Float64,

    `province_rollup_qty` Float64,

    `monthly_consumption_qty_calculated` Float64,

    `avg_12_month` Float64,

    `kebutuhan_1_tahun` Float64,

    `nilai_minimum` Nullable(Float64),

    `consumption_value` Float64,

    `status` String,

    `version` UInt32,

    `last_updated` DateTime
)
ENGINE = ReplicatedReplacingMergeTree('/clickhouse/tables/{uuid}/{shard}',
 '{replica}')
ORDER BY (period,
 entities_id,
 parent_material_id,
 program_id)
SETTINGS allow_nullable_key = 1,
 replicated_deduplication_window = '0',
 index_granularity = 8192;