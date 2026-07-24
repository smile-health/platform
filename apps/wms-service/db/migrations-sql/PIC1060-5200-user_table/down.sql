START TRANSACTION;

ALTER TABLE `user`
  ADD COLUMN `head_name` VARCHAR(50) NOT NULL AFTER `last_name`,
  ADD COLUMN `entity_tags` VARCHAR(255) NULL DEFAULT '' AFTER `is_active`,
  ADD COLUMN `entity_name` VARCHAR(64) NOT NULL AFTER `entity_tags`,
  CHANGE COLUMN `gender` `head_gender` ENUM('MALE','FEMALE','OTHER') NOT NULL AFTER `head_name`,
  CHANGE COLUMN `email` `head_email` VARCHAR(255) NOT NULL AFTER `head_gender`,
  CHANGE COLUMN `phone` `head_phone` VARCHAR(16) NOT NULL AFTER `head_email`,
  CHANGE COLUMN `address` `address` VARCHAR(255) NOT NULL AFTER `head_phone`,
  DROP COLUMN `entity_id`;

ALTER TABLE `user`
  CHANGE COLUMN `id` `entity_id` INT UNSIGNED NOT NULL FIRST,
  DROP PRIMARY KEY,
  ADD PRIMARY KEY (`entity_id`) USING BTREE;

ALTER TABLE `user`
  DROP INDEX `username`;

COMMIT;