-- Migration: Add missing indexes for performance optimization
-- Run this manually via phpMyAdmin on the live database
-- Generated: 2026-07-17
--
-- Note: books.code and members.form_number already have UNIQUE constraints (which create indexes).
-- The foreign keys issues.book_id and issues.member_id may already have auto-created indexes
-- depending on MySQL/InnoDB version, but explicit indexes ensure they exist.

-- Issues table: frequently used in WHERE, JOIN, and ORDER BY clauses
ALTER TABLE issues ADD INDEX idx_issues_status (status);
ALTER TABLE issues ADD INDEX idx_issues_book_id (book_id);
ALTER TABLE issues ADD INDEX idx_issues_member_id (member_id);
ALTER TABLE issues ADD INDEX idx_issues_book_code (book_code);
ALTER TABLE issues ADD INDEX idx_issues_form_number (form_number);
ALTER TABLE issues ADD INDEX idx_issues_return_date (return_date);
ALTER TABLE issues ADD INDEX idx_issues_issue_date (issue_date);
ALTER TABLE issues ADD INDEX idx_issues_status_return (status, return_date);

-- Books table: status is used in dashboard COUNT queries
ALTER TABLE books ADD INDEX idx_books_status (status);

-- Members table: payment_status used in filters
ALTER TABLE members ADD INDEX idx_members_payment_status (payment_status);

-- Audit logs: timestamp used in ORDER BY
ALTER TABLE audit_logs ADD INDEX idx_audit_logs_timestamp (timestamp);

-- Reviews: status used in filters
ALTER TABLE reviews ADD INDEX idx_reviews_status (status);
ALTER TABLE reviews ADD INDEX idx_reviews_member_form (member_form_number);
