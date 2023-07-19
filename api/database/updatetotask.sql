
CREATE TABLE `tasks`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `short_name` VARCHAR(100) NOT NULL,
    `prompt` TEXT NOT NULL,
    `investigator` BIGINT UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `tags`(
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name` TEXT NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `task_tags`(
    `index` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `task_id` BIGINT UNSIGNED NOT NULL,
    `tag_id` BIGINT UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `image_tags`(
    `index` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `image_id` BIGINT UNSIGNED NOT NULL,
    `tag_id` BIGINT UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `observers`(
    `index` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `task_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL
);

CREATE TABLE `tag_relations`(
    `tag_id` BIGINT UNSIGNED NOT NULL,
    `parent_tag_id` BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (tag_id, parent_tag_id)
);

CREATE INDEX tag_id_index ON tag_relations(tag_id);
CREATE INDEX parent_tag_id_index ON tag_relations(parent_tag_id);

CREATE TABLE `task_relations`(
    `task_id` BIGINT UNSIGNED NOT NULL,
    `parent_task_id` BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (task_id, parent_task_id)
);

CREATE INDEX task_id_index ON task_relations(task_id);
CREATE INDEX parent_task_id_index ON task_relations(parent_task_id);

ALTER TABLE hotornot ADD COLUMN (task_id BIGINT UNSIGNED);

ALTER TABLE
    `task_relations` ADD CONSTRAINT `task_relations_task_id_foreign` FOREIGN KEY(`task_id`) REFERENCES `tasks`(`id`);
ALTER TABLE
    `task_relations` ADD CONSTRAINT `task_relations_parent_task_id_foreign` FOREIGN KEY(`parent_task_id`) REFERENCES `tasks`(`id`);
ALTER TABLE
    `tag_relations` ADD CONSTRAINT `tag_relations_tag_id_foreign` FOREIGN KEY(`tag_id`) REFERENCES `tags`(`id`);
ALTER TABLE
    `tag_relations` ADD CONSTRAINT `tag_relations_parent_tag_id_foreign` FOREIGN KEY(`parent_tag_id`) REFERENCES `tags`(`id`);
ALTER TABLE
    `observers` ADD CONSTRAINT `observers_task_id_foreign` FOREIGN KEY(`task_id`) REFERENCES `tasks`(`id`);
ALTER TABLE
    `observers` ADD CONSTRAINT `observers_user_id_foreign` FOREIGN KEY(`user_id`) REFERENCES `users`(`id`);
ALTER TABLE
    `image_tags` ADD CONSTRAINT `image_tag_image_id_foreign` FOREIGN KEY(`image_id`) REFERENCES `images`(`id`);
ALTER TABLE
    `image_tags` ADD CONSTRAINT `image_tag_tag_id_foreign` FOREIGN KEY(`tag_id`) REFERENCES `tags`(`id`);
ALTER TABLE
    `task_tags` ADD CONSTRAINT `task_tag_task_id_foreign` FOREIGN KEY(`task_id`) REFERENCES `tasks`(`id`);
ALTER TABLE
    `task_tags` ADD CONSTRAINT `task_tag_tag_id_foreign` FOREIGN KEY(`tag_id`) REFERENCES `tags`(`id`);
ALTER TABLE
    `tags` ADD CONSTRAINT `tags_user_id_foreign` FOREIGN KEY(`user_id`) REFERENCES `users`(`id`);
ALTER TABLE
    `tasks` ADD CONSTRAINT `tasks_investigator_foreign` FOREIGN KEY(`investigator`) REFERENCES `users`(`id`);