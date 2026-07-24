-- dashboard_stockmax_rate definition

CREATE TABLE dashboard_stockmax_rate
(

    `program_id` Int8,

    `period` Date,

    `province_id` Nullable(Int64),

    `province_name` LowCardinality(Nullable(String)),

    `regency_id` Nullable(Int64),

    `regency_name` LowCardinality(Nullable(String)),

    `parent_material_id` Nullable(Int32),

    `parent_material_name` String,

    `global_parent_material_id` Int64,

    `jumlah_entity` UInt64,

    `jumlah_frekuensi` UInt64
)
ENGINE = ReplicatedReplacingMergeTree('/clickhouse/tables/{uuid}/{shard}',
 '{replica}')
ORDER BY (period,
 province_id,
 parent_material_name,
 program_id)
SETTINGS allow_nullable_key = 1,
 replicated_deduplication_window = 0,
 index_granularity = 8192;