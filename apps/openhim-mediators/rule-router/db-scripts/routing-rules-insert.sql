-- Seed routing rules for program_id = 4 (TB Program) order topics.

-- order.created
INSERT INTO integration_routing_rules
  (topic, filter_key, filter_operator, filter_value, target_url, target_name, is_default, priority, enabled)
VALUES
  (
    'order.created',
    'program_id', 'eq', '4',
    '/adapter/sitb/orders',
    'Program 4 (TB) - Order Created',
    FALSE, 1, TRUE
  );

-- order.status.order.confirm
INSERT INTO integration_routing_rules
  (topic, filter_key, filter_operator, filter_value, target_url, target_name, is_default, priority, enabled)
VALUES
  (
    'order.status.order.confirm',
    'program_id', 'eq', '4',
    '/adapter/sitb/orders',
    'Program 4 (TB) - Order Confirmed',
    FALSE, 1, TRUE
  );

-- order.status.order.cancel
INSERT INTO integration_routing_rules
  (topic, filter_key, filter_operator, filter_value, target_url, target_name, is_default, priority, enabled)
VALUES
  (
    'order.status.order.cancel',
    'program_id', 'eq', '4',
    '/adapter/sitb/orders',
    'Program 4 (TB) - Order Cancelled',
    FALSE, 1, TRUE
  );

-- order.status.order.allocate
INSERT INTO integration_routing_rules
  (topic, filter_key, filter_operator, filter_value, target_url, target_name, is_default, priority, enabled)
VALUES
  (
    'order.status.order.allocate',
    'program_id', 'eq', '4',
    '/adapter/sitb/orders',
    'Program 4 (TB) - Order Allocated',
    FALSE, 1, TRUE
  );

-- order.status.order.shipped
INSERT INTO integration_routing_rules
  (topic, filter_key, filter_operator, filter_value, target_url, target_name, is_default, priority, enabled)
VALUES
  (
    'order.status.order.shipped',
    'program_id', 'eq', '4',
    '/adapter/sitb/orders',
    'Program 4 (TB) - Order Shipped',
    FALSE, 1, TRUE
  );

-- order.status.order.fullfilled  (note: typo kept to match actual topic name)
INSERT INTO integration_routing_rules
  (topic, filter_key, filter_operator, filter_value, target_url, target_name, is_default, priority, enabled)
VALUES
  (
    'order.status.order.fullfilled',
    'program_id', 'eq', '4',
    '/adapter/sitb/orders',
    'Program 4 (TB) - Order Fulfilled',
    FALSE, 1, TRUE
  );

-- order.status.order.validated
INSERT INTO integration_routing_rules
  (topic, filter_key, filter_operator, filter_value, target_url, target_name, is_default, priority, enabled)
VALUES
  (
    'order.status.order.validated',
    'program_id', 'eq', '4',
    '/adapter/sitb/orders',
    'Program 4 (TB) - Order Validated',
    FALSE, 1, TRUE
  );
