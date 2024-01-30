-- Add roi information columns to the task table
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS chip_size INT UNSIGNED,
ADD COLUMN IF NOT EXISTS zoom_scale FLOAT,
ADD COLUMN IF NOT EXISTS fov_size INT UNSIGNED;