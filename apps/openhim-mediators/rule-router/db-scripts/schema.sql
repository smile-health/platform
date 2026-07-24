-- Routing rules table for the SMILE Rule Router Mediator
--
-- Each row defines a filter rule: if the incoming CloudEvent field
-- (filter_key) matches the filter_value via filter_operator, the event
-- is forwarded to target_url.

CREATE TABLE IF NOT EXISTS integration_routing_rules (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  topic           VARCHAR(100) NOT NULL,           -- e.g. 'order.created'
  filter_key      VARCHAR(100) NOT NULL,           -- e.g. 'client_key', 'program_id', 'header:X-Integration-Client', 'data.order_id'
  filter_operator VARCHAR(20)  NOT NULL DEFAULT 'eq',  -- 'eq' | 'neq' | 'contains' | 'starts_with' | 'regex'
  filter_value    VARCHAR(500) NOT NULL,           -- e.g. 'siha', '4', '^[0-9]+'
  target_url      VARCHAR(500) NOT NULL,           -- e.g. 'http://openhim:5001/siha/orders'
  target_name     VARCHAR(255) NOT NULL,           -- Human label: 'SIHA Order Created Channel'
  is_default      BOOLEAN      NOT NULL DEFAULT FALSE, -- TRUE = used when NO specific rules match
  priority        INT          NOT NULL DEFAULT 10,
  enabled         BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_topic   (topic),
  KEY idx_enabled (enabled)
);

