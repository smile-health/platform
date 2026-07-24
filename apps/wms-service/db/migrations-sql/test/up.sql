SHOW STATUS LIKE 'Uptime';

CREATE TABLE IF NOT EXISTS `asset_data` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `timestamp` timestamp(3) NOT NULL DEFAULT (now()),
  `asset_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `value` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `status` enum('OPERATIONAL','UNDER_MAINTAINENCE','OUT_OF_SERVICE','IDLE','RETIRED') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'IDLE',
  PRIMARY KEY (`id`),
  UNIQUE KEY `asset_id_UNIQUE` (`asset_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Stores the historical data for asset status sensors. This data is usually collection via Firebase.';
