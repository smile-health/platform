-- dashboard_stockout_rate definition

CREATE TABLE dashboard_stockout_rate
(

    `period` Date,

    `program_id` Int8,

    `province_id` Nullable(Int64),

    `province_name` LowCardinality(Nullable(String)),

    `regency_id` Nullable(Int64),

    `regency_name` LowCardinality(Nullable(String)),

    `parent_material_id` Nullable(Int32),

    `global_parent_material_id` Int64,

    `parent_material_name` String,

    `jumlah_entity` UInt64,

    `jumlah_frekuensi` UInt64,

    `average_stockout_frekuensi` Float64
)
ENGINE = ReplicatedReplacingMergeTree('/clickhouse/tables/{uuid}/{shard}',
 '{replica}')
ORDER BY (period,
 parent_material_id,
 regency_id,
 program_id)
SETTINGS allow_nullable_key = 1,
 replicated_deduplication_window = 0,
 index_granularity = 8192;