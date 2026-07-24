-- dashboard_active_rate definition

CREATE TABLE dashboard_active_rate
(

    `program_id` Int32,

    `period` Nullable(String),

    `entity_province_id` Nullable(String),

    `province` String,

    `entity_regency_id` Nullable(String),

    `regency` String,

    `total_entities` UInt64,

    `active_entities` UInt64,

    `active_rate` Float64
)
ENGINE = ReplicatedReplacingMergeTree('/clickhouse/tables/{uuid}/{shard}',
 '{replica}')
ORDER BY (program_id,
 period,
 province,
 regency)
SETTINGS allow_nullable_key = 1,
 replicated_deduplication_window = 0,
 index_granularity = 8192;