-- dashboard_delivery_time definition

CREATE TABLE dashboard_delivery_time
(

    `program_id` Int32,

    `customer_province_id` Int64,

    `customer_province_name` String,

    `customer_regency_id` Int64,

    `customer_regency_name` String,

    `customer_id` Int64,

    `global_customer_id` Int64,

    `customer_name` Nullable(String),

    `period` String,

    `avg_entity_duration` Nullable(Float64),

    `avg_regency_duration` Nullable(Float64),

    `avg_province_duration` Nullable(Float64),

    `median_avg_entity_duration_by_province` Nullable(Float64),

    `status` String
)
ENGINE = ReplicatedReplacingMergeTree('/clickhouse/tables/{uuid}/{shard}',
 '{replica}')
ORDER BY (period,
 customer_province_id,
 customer_province_name,
 customer_regency_id,
 customer_regency_name,
 customer_id,
 customer_name,
 program_id)
SETTINGS allow_nullable_key = 1,
 replicated_deduplication_window = 0,
 index_granularity = 8192;