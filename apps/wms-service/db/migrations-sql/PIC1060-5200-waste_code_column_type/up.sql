ALTER TABLE `waste_classification`
	CHANGE COLUMN `waste_code` `waste_code` VARCHAR(32) NOT NULL AFTER `waste_characteristics_id`;