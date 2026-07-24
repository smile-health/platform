START TRANSACTION;

CREATE TABLE IF NOT EXISTS `partner` (
  `entity_id` int unsigned NOT NULL,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  `created_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `updated_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `entity_tags` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '',
  `entity_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `registration_code` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `region_id` int unsigned NOT NULL,
  `head_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `head_gender` enum('MALE','FEMALE','OTHER') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `head_email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `head_phone` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `is_active` bit(1) NOT NULL DEFAULT (0),
  PRIMARY KEY (`entity_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

RENAME TABLE `entity` TO `healthcare_facility`;

ALTER TABLE `healthcare_facility`
  DROP COLUMN `entity_type`,
  DROP INDEX `registration_code`;

ALTER TABLE `healthcare_facility`
  CHANGE COLUMN `id` `entity_id` INT UNSIGNED NOT NULL FIRST,
  DROP PRIMARY KEY,
  ADD PRIMARY KEY (`entity_id`) USING BTREE;

COMMIT;