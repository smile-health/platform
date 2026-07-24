ALTER TABLE `waste_classification`
	CHANGE COLUMN `waste_code` `waste_code` INT NOT NULL DEFAULT (0) AFTER `waste_characteristics_id`;