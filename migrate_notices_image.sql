-- Migration: Add image column to notices table
-- Run this against your production database directly.
-- This is a live DB schema change — review before executing.

ALTER TABLE notices
  ADD COLUMN image LONGTEXT DEFAULT NULL
  AFTER content;
