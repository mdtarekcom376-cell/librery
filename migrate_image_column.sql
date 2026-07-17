-- Migration: Change image_url columns from TEXT to LONGTEXT
-- Run this command in your database (XAMPP phpMyAdmin / MySQL CLI) to prevent high-res Base64 images from truncating or failing to save.

ALTER TABLE books MODIFY COLUMN image_url LONGTEXT;
ALTER TABLE shop_items MODIFY COLUMN image_url LONGTEXT;
