START TRANSACTION;

CREATE TABLE IF NOT EXISTS `asset_data` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `timestamp` timestamp(3) NOT NULL DEFAULT (now()),
  `asset_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `value` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `status` enum('OPERATIONAL','UNDER_MAINTAINENCE','OUT_OF_SERVICE','IDLE','RETIRED') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'IDLE',
  PRIMARY KEY (`id`),
  UNIQUE KEY `asset_id_UNIQUE` (`asset_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Stores the historical data for asset status sensors. This data is usually collection via Firebase.';

CREATE TABLE IF NOT EXISTS `asset_manufacturer` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  `created_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `updated_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `asset_model` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  `created_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `updated_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `asset_type` enum('SCALE','INCINERATOR','AUTOCLAVE','COLD_STORAGE') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `manufacturer_id` int unsigned NOT NULL,
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;


CREATE TABLE IF NOT EXISTS `healthcare_facility` (
  `entity_id` int unsigned NOT NULL,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  `created_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `updated_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `entity_tags` varchar(255) DEFAULT '',
  `entity_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `registration_code` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `region_id` int unsigned NOT NULL,
  `head_name` varchar(50) NOT NULL,
  `head_gender` enum('MALE','FEMALE','OTHER') NOT NULL,
  `head_email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `head_phone` varchar(16) NOT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `is_active` bit(1) NOT NULL DEFAULT (0),
  PRIMARY KEY (`entity_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;


CREATE TABLE IF NOT EXISTS `healthcare_facility_asset` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  `created_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `updated_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `healthcare_facility_id` int NOT NULL,
  `model_id` int NOT NULL,
  `is_iot_enabled` bit(1) NOT NULL DEFAULT (0),
  `asset_id` varchar(32) DEFAULT NULL,
  `asset_status` enum('OPERATIONAL','UNDER_MAINTAINENCE','OUT_OF_SERVICE','IDLE','RETIRED') DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

CREATE TABLE IF NOT EXISTS `healthcare_facility_settings` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  `created_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `updated_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `healthcare_facility_id` int NOT NULL,
  `setting_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `setting_value` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `healthcare_facility_setting_unique` (`healthcare_facility_id`,`setting_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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

CREATE TABLE IF NOT EXISTS `partnership` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  `created_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `updated_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `healthcare_facility_id` int NOT NULL,
  `partner_id` int NOT NULL,
  `contract_start_date` date NOT NULL,
  `contract_end_date` date NOT NULL,
  `contract_id` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `partnership_status` enum('PENDING','ACTIVE','SUSPENDED','TERMINATED','EXPIRED') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'PENDING',
  `provider_type` enum('RECYCLER','TRANSPORTER','TRANSPORTER_SPECIALIZED','TRANSPORTER_LANDFILL','TRANSPORTER_TREATMENT','TRANSPORTER_GOVERNMENT','LANDFILLER','TREATMENT_PROVIDER') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `can_landfill` bit(1) NOT NULL DEFAULT (0),
  `landfilling_provider` enum('SELF','THIRD_PARTY') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `can_recycle` bit(1) NOT NULL DEFAULT (0),
  `recyling_provider` enum('SELF','THIRD_PARTY') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `has_incinerator` bit(1) NOT NULL DEFAULT (0),
  `incinerator_provider` enum('SELF','THIRD_PARTY') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `has_autoclave` bit(1) NOT NULL DEFAULT (0),
  `autoclave_provider` enum('SELF','THIRD_PARTY') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

CREATE TABLE IF NOT EXISTS `partner_vehicle` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  `created_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `updated_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `vehicle_type` enum('BOX','VAN') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `vehicle_number` varchar(16) NOT NULL,
  `capacity_in_kgs` int NOT NULL DEFAULT '1',
  `is_approved` bit(1) NOT NULL DEFAULT (0),
  `approved_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `approved_on` datetime DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `Unique Vehicle Number` (`vehicle_number`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;


CREATE TABLE IF NOT EXISTS `region` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  `created_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `updated_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `region_type` enum('COUNTRY','PROVINCE/STATE','CITY','DISTRICT','SUB-DISTRICT','VILLAGE') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'COUNTRY',
  `parent_id` int unsigned DEFAULT NULL,
  `code` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Hold the region ID. This data is used to enable diffirent configurations in different regions.';


CREATE TABLE IF NOT EXISTS `scale_data` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `timestamp` timestamp(3) NOT NULL DEFAULT (now()),
  `asset_id` varchar(32) NOT NULL,
  `value` float unsigned zerofill NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `asset_id_UNIQUE` (`asset_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Stores the historical data for scale sensors. This data is usually collection via Firebase.';


CREATE TABLE IF NOT EXISTS `system_feature` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  `created_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `updated_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;


CREATE TABLE IF NOT EXISTS `transporter_operator_coodinates` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `timestamp` timestamp(3) NOT NULL DEFAULT (now()),
  `user_id` int NOT NULL,
  `lattitude` float(10,6) NOT NULL,
  `longitude` float(10,6) NOT NULL,
  `ttl_in_seconds` int NOT NULL DEFAULT '300',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC COMMENT='Stores the historical data for asset status sensors. This data is usually collection via Firebase.';


CREATE TABLE IF NOT EXISTS `user` (
  `entity_id` int unsigned NOT NULL,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  `created_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `updated_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `is_active` bit(1) NOT NULL DEFAULT (0),
  `entity_tags` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT '',
  `entity_name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `username` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `first_name` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `last_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `head_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `head_gender` enum('MALE','FEMALE','OTHER') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `head_email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `head_phone` varchar(16) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`entity_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;


CREATE TABLE IF NOT EXISTS `user_role` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  `created_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `updated_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `region_id` int NOT NULL,
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `region_id_name` (`region_id`,`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;


CREATE TABLE IF NOT EXISTS `user_role_system_feature_access` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  `created_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `updated_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `user_role_id` int NOT NULL,
  `system_feature_id` int NOT NULL,
  `access_type` enum('ALL','NONE','READ-ONLY','WRITE','DELETE') NOT NULL DEFAULT 'NONE',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `user_role_id_system_feature_id` (`user_role_id`,`system_feature_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;


CREATE TABLE IF NOT EXISTS `user_to_user_role_map` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `created_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `user_id` int NOT NULL,
  `role_id` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE KEY `user_id_role_id` (`user_id`,`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;


CREATE TABLE IF NOT EXISTS `waste_audit_log` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `created_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `audit_type` enum('TRANSACTION','TREATMENT_GROUP','TRANSPORTATION_GROUP') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `action_type` enum('CREATE','UPDATE','DELETE') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `from_status` enum('GENERATED','CLASSIFIED','SCALED','STORED_FOR_TREATMENT','STORED_FOR_TRANSPORT','TREATED','RESIDUE_CLASSIFIED','RESIDUE_SCALED','RESIDUE_STORED_FOR_TRANSPORT','IN_TRANSIT','DISPOSED') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `to_status` enum('GENERATED','CLASSIFIED','SCALED','STORED_FOR_TREATMENT','STORED_FOR_TRANSPORT','TREATED','RESIDUE_CLASSIFIED','RESIDUE_SCALED','RESIDUE_STORED_FOR_TRANSPORT','IN_TRANSIT','DISPOSED') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `data` json DEFAULT NULL,
  `workflow_engine_command` varchar(64) DEFAULT NULL,
  `reference_table_id` bigint NOT NULL DEFAULT (0),
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;


CREATE TABLE IF NOT EXISTS `waste_bag_collection` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  `created_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `updated_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `healthcare_facility_id` int NOT NULL,
  `waste_source_id` int NOT NULL,
  `waste_classification_id` int NOT NULL,
  `source_treatment_group_id` int DEFAULT NULL,
  `scale_method` enum('IOT','MANUAL') NOT NULL DEFAULT 'IOT',
  `asset_id` int NOT NULL,
  `waste_in_kgs` int DEFAULT NULL,
  `storage_start_timestamp` timestamp NULL DEFAULT NULL,
  `scheduled_storage_end_datetime` datetime DEFAULT NULL,
  `actual_storage_end_timestamp` timestamp NULL DEFAULT NULL,
  `max_storage_hours` int DEFAULT NULL,
  `min_storage_hours` int DEFAULT NULL,
  `waste_treatment_group_id` bigint DEFAULT NULL,
  `waste_transportation_group_id` bigint DEFAULT NULL,
  `waste_status` enum('GENERATED','CLASSIFIED','SCALED','STORED_FOR_TREATMENT','STORED_FOR_TRANSPORT','TREATED','RESIDUE_CLASSIFIED','RESIDUE_SCALED','RESIDUE_STORED_FOR_TRANSPORT','IN_TRANSIT','DISPOSED') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'GENERATED',
  `waste_status_updated_at` datetime DEFAULT (now()),
  `waste_status_updated_by` varchar(32) DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;


CREATE TABLE IF NOT EXISTS `waste_bag_label` (
  `id` bigint unsigned NOT NULL DEFAULT (0),
  `created_at` datetime NOT NULL DEFAULT (now()),
  `created_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `waste_bag_collection_id` bigint NOT NULL,
  `qr_code` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `waste_label_purpose` enum('TRANSPORTATION','TREATMENT') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `waste_label_count` int NOT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;


CREATE TABLE IF NOT EXISTS `waste_classification` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  `created_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `updated_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `region_id` int NOT NULL,
  `effective_from` datetime NOT NULL DEFAULT (now()),
  `effective_to` datetime NOT NULL DEFAULT (now()),
  `waste_type_id` int NOT NULL,
  `waste_group_id` int NOT NULL,
  `waste_characteristics_id` int NOT NULL,
  `waste_code` int NOT NULL,
  `waste_bag_color_code` enum('BLACK','GRAY','YELLOW','PURPLE','BROWN','RED') NOT NULL,
  `storage_rule_type` enum('STATIC','RULE_BASED') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `use_cold_storage` bit(1) NOT NULL DEFAULT (0),
  `cold_storage_min_hours` int DEFAULT NULL,
  `cold_storage_max_hours` int DEFAULT NULL,
  `temp_storage_min_hours` int DEFAULT NULL,
  `temp_storage_max_hours` int DEFAULT NULL,
  `storage_rule` json DEFAULT NULL,
  `allow_healthcare_facility_treatment` bit(1) NOT NULL DEFAULT (1),
  `treatment_method` enum('PYROLYSIS','DISINFECTION') DEFAULT NULL,
  `post_treatment_waste_characteristics_id` int DEFAULT (0),
  `disposal_method` enum('LANDFILL','RECYCLE','TRANSPORTATION') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `allowed_vehicle_types` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;


CREATE TABLE IF NOT EXISTS `waste_hierarchy` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  `created_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `updated_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `region_id` int NOT NULL,
  `parent_hierarchy_id` int DEFAULT NULL,
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;


CREATE TABLE IF NOT EXISTS `waste_source` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  `created_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `updated_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `waste_source_group_id` int NOT NULL,
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `is_active` bit(1) NOT NULL DEFAULT (1),
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;


CREATE TABLE IF NOT EXISTS `waste_source_group` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  `created_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `updated_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `name` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `healthcare_facility_id` int NOT NULL,
  `is_active` bit(1) NOT NULL DEFAULT (1),
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;


CREATE TABLE IF NOT EXISTS `waste_transportation_group` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  `created_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `updated_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `total_bags_count` int NOT NULL DEFAULT (1),
  `total_weight_in_kgs` int NOT NULL,
  `transporter_vehicle_id` int DEFAULT NULL,
  `transporter_operator_id` int DEFAULT NULL,
  `handover_lattitude` float(10,6) DEFAULT NULL,
  `handover_longitude` float(10,6) DEFAULT NULL,
  `transportation_status` enum('GENERATED','CLASSIFIED','SCALED','STORED_FOR_TREATMENT','STORED_FOR_TRANSPORT','TREATED','RESIDUE_CLASSIFIED','RESIDUE_SCALED','RESIDUE_STORED_FOR_TRANSPORT','IN_TRANSIT','DISPOSED') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'STORED_FOR_TRANSPORT',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;


CREATE TABLE IF NOT EXISTS `waste_transportation_request` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  `created_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `updated_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `request_status` enum('PENDING','ACCEPTED','REJECTED') DEFAULT NULL,
  `transportation_group_id` bigint NOT NULL,
  `request_creator_id` int DEFAULT NULL,
  `request_approver_id` int DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;


CREATE TABLE IF NOT EXISTS `waste_treatment_group` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL DEFAULT (now()),
  `updated_at` datetime NOT NULL DEFAULT (now()),
  `created_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `updated_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `total_bags_count` int NOT NULL DEFAULT '1',
  `total_weight_in_kgs` int NOT NULL,
  `treatment_asset_id` int DEFAULT NULL,
  `treatment_operator_id` int DEFAULT NULL,
  `handover_lattitude` float(10,6) DEFAULT NULL,
  `handover_longitude` float(10,6) DEFAULT NULL,
  `treatment_status` enum('GENERATED','CLASSIFIED','SCALED','STORED_FOR_TREATMENT','STORED_FOR_TRANSPORT','TREATED','RESIDUE_CLASSIFIED','RESIDUE_SCALED','RESIDUE_STORED_FOR_TRANSPORT','IN_TRANSIT','DISPOSED') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'STORED_FOR_TREATMENT',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;


CREATE TABLE IF NOT EXISTS `waste_treatment_request` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `created_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `updated_by` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `request_status` enum('PENDING','ACCEPTED','REJECTED') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `treatment_group_id` bigint NOT NULL,
  `request_creator_id` int DEFAULT NULL,
  `request_approver_id` int DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci ROW_FORMAT=DYNAMIC;

COMMIT;