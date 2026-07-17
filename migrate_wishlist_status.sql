-- Migration script for wishlist status column
-- Add status column if it does not exist (if it already exists without default, modify it):
ALTER TABLE wishlist MODIFY COLUMN status VARCHAR(50) DEFAULT 'pending';

-- If status column needs to be added from scratch on existing tables that lack it:
-- ALTER TABLE wishlist ADD COLUMN status VARCHAR(50) DEFAULT 'pending';

-- Update all existing records that have NULL or empty status to 'pending':
UPDATE wishlist SET status = 'pending' WHERE status IS NULL OR status = '';
