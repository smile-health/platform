-- This maps RabbitMQ events to OpenHIM channel

-- Insert route mapping for order.created -> SMILE Order Created Channel
INSERT INTO openhim_route_mappings (
  rabbitmq_topic,
  enabled,
  openhim_channel_id,
  openhim_channel_name,
  http_method,
  request_path,
  headers_json,
  include_context,
  auth_type,
  max_retries,
  retry_backoff_ms,
  retry_backoff_multiplier,
  expected_status_codes,
  created_by
) VALUES (
  'order.created',                      -- RabbitMQ topic to listen for
  1,                                    -- Enabled
  'smile-order-created-channel',        -- Channel ID (identifier)
  'SMILE Order Created Channel',        -- Channel Name (human-readable)
  'POST',                               -- HTTP method
  '/pub/smile/orders/order-created',    -- Request path (from channel urlPattern)
  JSON_OBJECT(
    'Content-Type', 'application/json',
    'Accept', 'application/json'
  ),                                    -- Request headers
  1,                                    -- Include CloudEvent context
  'basic',                              -- Basic auth (credentials from env vars)
  3,                                    -- Max retries
  1000,                                 -- Initial backoff (1 second)
  2,                                    -- Backoff multiplier
  '200,201,202,204',                    -- Expected successful status codes
  'system'                              -- Created by
);

-- Insert route mapping for order.status.order.confirm -> SMILE Order Confirmed Channel
INSERT INTO openhim_route_mappings (
  rabbitmq_topic,
  enabled,
  openhim_channel_id,
  openhim_channel_name,
  http_method,
  request_path,
  headers_json,
  include_context,
  auth_type,
  max_retries,
  retry_backoff_ms,
  retry_backoff_multiplier,
  expected_status_codes,
  created_by
) VALUES (
  'order.status.order.confirm',           -- RabbitMQ topic to listen for
  1,                                      -- Enabled
  'smile-order-confirmed-channel',        -- Channel ID (identifier)
  'SMILE Order Confirmed Channel',        -- Channel Name (human-readable)
  'POST',                                 -- HTTP method
  '/pub/smile/orders/order-confirmed',    -- Request path (from channel urlPattern)
  JSON_OBJECT(
    'Content-Type', 'application/json',
    'Accept', 'application/json'
  ),                                    -- Request headers
  1,                                    -- Include CloudEvent context
  'basic',                              -- Basic auth (credentials from env vars)
  3,                                    -- Max retries
  1000,                                 -- Initial backoff (1 second)
  2,                                    -- Backoff multiplier
  '200,201,202,204',                    -- Expected successful status codes
  'system'                              -- Created by
);

-- Insert route mapping for order.status.order.cancel -> SMILE Order Cancelled Channel
INSERT INTO openhim_route_mappings (
  rabbitmq_topic,
  enabled,
  openhim_channel_id,
  openhim_channel_name,
  http_method,
  request_path,
  headers_json,
  include_context,
  auth_type,
  max_retries,
  retry_backoff_ms,
  retry_backoff_multiplier,
  expected_status_codes,
  created_by
) VALUES (
  'order.status.order.cancel',            -- RabbitMQ topic to listen for
  1,                                      -- Enabled
  'smile-order-cancelled-channel',        -- Channel ID (identifier)
  'SMILE Order Cancelled Channel',        -- Channel Name (human-readable)
  'POST',                                 -- HTTP method
  '/pub/smile/orders/order-cancelled',    -- Request path (from channel urlPattern)
  JSON_OBJECT(
    'Content-Type', 'application/json',
    'Accept', 'application/json'
  ),                                    -- Request headers
  1,                                    -- Include CloudEvent context
  'basic',                              -- Basic auth (credentials from env vars)
  3,                                    -- Max retries
  1000,                                 -- Initial backoff (1 second)
  2,                                    -- Backoff multiplier
  '200,201,202,204',                    -- Expected successful status codes
  'system'                              -- Created by
);

-- Insert route mapping for order.status.order.allocate -> SMILE Order Allocated Channel
INSERT INTO openhim_route_mappings (
  rabbitmq_topic,
  enabled,
  openhim_channel_id,
  openhim_channel_name,
  http_method,
  request_path,
  headers_json,
  include_context,
  auth_type,
  max_retries,
  retry_backoff_ms,
  retry_backoff_multiplier,
  expected_status_codes,
  created_by
) VALUES (
  'order.status.order.allocate',          -- RabbitMQ topic to listen for
  1,                                      -- Enabled
  'smile-order-allocated-channel',        -- Channel ID (identifier)
  'SMILE Order Allocated Channel',        -- Channel Name (human-readable)
  'POST',                                 -- HTTP method
  '/pub/smile/orders/order-allocated',    -- Request path (from channel urlPattern)
  JSON_OBJECT(
    'Content-Type', 'application/json',
    'Accept', 'application/json'
  ),                                    -- Request headers
  1,                                    -- Include CloudEvent context
  'basic',                              -- Basic auth (credentials from env vars)
  3,                                    -- Max retries
  1000,                                 -- Initial backoff (1 second)
  2,                                    -- Backoff multiplier
  '200,201,202,204',                    -- Expected successful status codes
  'system'                              -- Created by
);

-- Insert route mapping for order.status.order.shipped -> SMILE Order Shipped Channel
INSERT INTO openhim_route_mappings (
  rabbitmq_topic,
  enabled,
  openhim_channel_id,
  openhim_channel_name,
  http_method,
  request_path,
  headers_json,
  include_context,
  auth_type,
  max_retries,
  retry_backoff_ms,
  retry_backoff_multiplier,
  expected_status_codes,
  created_by
) VALUES (
  'order.status.order.shipped',          -- RabbitMQ topic to listen for
  1,                                      -- Enabled
  'smile-order-shipped-channel',        -- Channel ID (identifier)
  'SMILE Order Shipped Channel',        -- Channel Name (human-readable)
  'POST',                                 -- HTTP method
  '/pub/smile/orders/order-shipped',    -- Request path (from channel urlPattern)
  JSON_OBJECT(
    'Content-Type', 'application/json',
    'Accept', 'application/json'
  ),                                    -- Request headers
  1,                                    -- Include CloudEvent context
  'basic',                              -- Basic auth (credentials from env vars)
  3,                                    -- Max retries
  1000,                                 -- Initial backoff (1 second)
  2,                                    -- Backoff multiplier
  '200,201,202,204',                    -- Expected successful status codes
  'system'                              -- Created by
);

-- Insert route mapping for order.status.order.fullfilled -> SMILE Order Fulfilled Channel
INSERT INTO openhim_route_mappings (
  rabbitmq_topic,
  enabled,
  openhim_channel_id,
  openhim_channel_name,
  http_method,
  request_path,
  headers_json,
  include_context,
  auth_type,
  max_retries,
  retry_backoff_ms,
  retry_backoff_multiplier,
  expected_status_codes,
  created_by
) VALUES (
  'order.status.order.fullfilled',        -- RabbitMQ topic to listen for, keep the typo "fullfilled" to match the actual topic
  1,                                      -- Enabled
  'smile-order-fulfilled-channel',        -- Channel ID (identifier)
  'SMILE Order Fulfilled Channel',        -- Channel Name (human-readable)
  'POST',                                 -- HTTP method
  '/pub/smile/orders/order-fulfilled',    -- Request path (from channel urlPattern)
  JSON_OBJECT(
    'Content-Type', 'application/json',
    'Accept', 'application/json'
  ),                                    -- Request headers
  1,                                    -- Include CloudEvent context
  'basic',                              -- Basic auth (credentials from env vars)
  3,                                    -- Max retries
  1000,                                 -- Initial backoff (1 second)
  2,                                    -- Backoff multiplier
  '200,201,202,204',                    -- Expected successful status codes
  'system'                              -- Created by
);

-- Insert route mapping for order.status.order.validated -> SMILE Order Validated Channel
INSERT INTO openhim_route_mappings (
  rabbitmq_topic,
  enabled,
  openhim_channel_id,
  openhim_channel_name,
  http_method,
  request_path,
  headers_json,
  include_context,
  auth_type,
  max_retries,
  retry_backoff_ms,
  retry_backoff_multiplier,
  expected_status_codes,
  created_by
) VALUES (
  'order.status.order.validated',         -- RabbitMQ topic to listen for
  1,                                      -- Enabled
  'smile-order-validated-channel',        -- Channel ID (identifier)
  'SMILE Order Validated Channel',        -- Channel Name (human-readable)
  'POST',                                 -- HTTP method
  '/pub/smile/orders/order-validated',    -- Request path (from channel urlPattern)
  JSON_OBJECT(
    'Content-Type', 'application/json',
    'Accept', 'application/json'
  ),                                    -- Request headers
  1,                                    -- Include CloudEvent context
  'basic',                              -- Basic auth (credentials from env vars)
  3,                                    -- Max retries
  1000,                                 -- Initial backoff (1 second)
  2,                                    -- Backoff multiplier
  '200,201,202,204',                    -- Expected successful status codes
  'system'                              -- Created by
);
