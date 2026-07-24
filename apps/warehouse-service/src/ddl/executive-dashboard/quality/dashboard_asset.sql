-- dashboard_asset definition

CREATE TABLE dashboard_asset
(

    `period` Nullable(String),

    `province_id` Nullable(Int64),

    `province_name` String,

    `regency_id` Nullable(Int64),

    `regency_name` String,

    `entities_with_urecorded_asset` Int64,

    `total_entities` UInt64,

    `total_asset_cce_excursion` UInt64,

    `avg_duration_excursion_regency` Float64,

    `avg_duration_excursion_province` Float64,

    `asset_type_id` Nullable(Int64),

    `asset_type_name` Nullable(String),

    `asset_classifications_id` Array(Int64),

    `asset_classifications_name` Array(String),

    `total_asset_cce_rtmd` UInt64,

    `damaged_asset` UInt64,

    `total_asset_recorded` UInt64,

    `last_updated` String
)
ENGINE = ReplicatedReplacingMergeTree('/clickhouse/tables/{uuid}/{shard}',
 '{replica}')
ORDER BY (period,
 province_id,
 province_name,
 regency_id,
 regency_name,
 asset_type_id,
 asset_classifications_id)
SETTINGS allow_nullable_key = 1,
 replicated_deduplication_window = 0,
 index_granularity = 8192;