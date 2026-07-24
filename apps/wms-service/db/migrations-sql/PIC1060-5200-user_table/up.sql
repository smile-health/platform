START TRANSACTION;

ALTER TABLE `user`
  CHANGE COLUMN `head_gender` `gender` ENUM('MALE','FEMALE','OTHER') NOT NULL AFTER `last_name`,
  CHANGE COLUMN `head_email` `email` VARCHAR(255) NOT NULL AFTER `gender`,
  CHANGE COLUMN `head_phone` `phone` VARCHAR(16) NOT NULL AFTER `email`,
  CHANGE COLUMN `address` `address` VARCHAR(255) NULL AFTER `phone`,
  DROP COLUMN `head_name`,
  DROP COLUMN `entity_tags`,
  DROP COLUMN `entity_name`;

ALTER TABLE `user`
  CHANGE COLUMN `entity_id` `id` INT UNSIGNED NOT NULL AUTO_INCREMENT FIRST,
  DROP PRIMARY KEY,
  ADD PRIMARY KEY (`id`) USING BTREE;

ALTER TABLE `user`
  ADD COLUMN `entity_id` INT UNSIGNED NOT NULL AFTER `is_active`;


ALTER TABLE `user`
  ADD UNIQUE INDEX `username` (`username`);

COMMIT;