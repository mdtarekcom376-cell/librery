-- Migration: Add page_count and price columns to books table
-- Run this manually via phpMyAdmin on the live database
-- Generated: 2026-07-17

ALTER TABLE books ADD COLUMN page_count INT DEFAULT NULL COMMENT 'পৃষ্ঠা সংখ্যা';
ALTER TABLE books ADD COLUMN price DECIMAL(10,2) DEFAULT NULL COMMENT 'বইয়ের মূল্য (৳)';
