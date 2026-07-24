-- dashboard_overdue_calibration definition

CREATE TABLE dashboard_overdue_calibration
(

    `province_id` Nullable(Int64),

    `province_name` Nullable(String),

    `regency_id` Nullable(Int64),

    `regency_name` Nullable(String),

    `asset_overdue` UInt64,

    `total_asset` UInt64
)
ENGINE = ReplicatedReplacingMergeTree('/clickhouse/tables/{uuid}/{shard}',
 '{replica}')
ORDER BY (province_id,
 province_name,
 regency_id,
 regency_name)
SETTINGS allow_nullable_key = 1,
 replicated_deduplication_window = 0,
 index_granularity = 8192;