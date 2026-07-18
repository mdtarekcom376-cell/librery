-- Migration: Create site_traffic table for visitor analytics
-- Run this manually: mysql -u <user> -p <database> < migrate_site_traffic.sql

CREATE TABLE IF NOT EXISTS site_traffic (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  view_count INT NOT NULL DEFAULT 0
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
