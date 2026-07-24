-- dashboard_stock_taking definition

CREATE TABLE dashboard_stock_taking
(

    `period` Nullable(String),

    `stock_opname_program_id` Int32,

    `province_id` Int64,

    `province_name` String,

    `regency_id` Int64,

    `regency_name` String,

    `stock` Float64,

    `exp_stock` Float64,

    `stock_in_transit` Float64,

    `real_stock` Float64,

    `difference` Float64,

    `discrepancy_percentage` Float64,

    `accuracy_percentage` Float64,

    `avg_discrepancy_percentage` Float64,

    `avg_accuracy_percentage` Float64
)
ENGINE = ReplicatedReplacingMergeTree('/clickhouse/tables/{uuid}/{shard}',
 '{replica}')
ORDER BY (period,
 stock_opname_program_id,
 province_id,
 regency_id)
SETTINGS allow_nullable_key = 1,
 replicated_deduplication_window = 0,
 index_granularity = 8192;