-- ============================================
-- Payment System Database Migration
-- Created: 2026-02-17
-- Description: Creates tables for shopping cart, orders, and payment tracking
-- ============================================

-- 1. Create Cart table
-- Stores items in user's shopping cart
CREATE TABLE IF NOT EXISTS Cart (
    id VARCHAR(255) PRIMARY KEY,
    userId VARCHAR(255) NOT NULL,
    leadId VARCHAR(255) NOT NULL,
    addedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
    FOREIGN KEY (leadId) REFERENCES Lead(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_lead (userId, leadId),
    INDEX idx_user (userId),
    INDEX idx_lead (leadId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Create Order table
-- Stores payment orders with German tax (MwSt) calculation
-- Using DECIMAL(10,2) for currency as per MySQL best practices
CREATE TABLE IF NOT EXISTS `Order` (
    id VARCHAR(255) PRIMARY KEY,
    userId VARCHAR(255) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL COMMENT 'Subtotal before discount and tax',
    discount DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Discount amount (5% for 5+ items)',
    taxRate DECIMAL(5,2) DEFAULT 19.00 COMMENT 'Tax rate percentage (19% MwSt)',
    taxAmount DECIMAL(10,2) NOT NULL COMMENT 'Calculated tax amount',
    total DECIMAL(10,2) NOT NULL COMMENT 'Final total including tax',
    paymentMethod ENUM('stripe', 'paypal') NOT NULL,
    paymentId VARCHAR(255) NOT NULL COMMENT 'Stripe Payment Intent ID or PayPal Order ID',
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    invoiceNumber VARCHAR(50) UNIQUE COMMENT 'Format: INV-YYYY-NNNNN',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    completedAt DATETIME NULL COMMENT 'When payment was completed',
    FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE,
    INDEX idx_user (userId),
    INDEX idx_status (status),
    INDEX idx_created (createdAt),
    INDEX idx_invoice (invoiceNumber)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Create OrderItem table
-- Stores individual items within an order
CREATE TABLE IF NOT EXISTS OrderItem (
    id VARCHAR(255) PRIMARY KEY,
    orderId VARCHAR(255) NOT NULL,
    leadId VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL COMMENT 'Price at time of purchase',
    FOREIGN KEY (orderId) REFERENCES `Order`(id) ON DELETE CASCADE,
    FOREIGN KEY (leadId) REFERENCES Lead(id) ON DELETE CASCADE,
    INDEX idx_order (orderId),
    INDEX idx_lead (leadId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Update _PurchasedLeads table
-- Add columns to link purchases to orders and track historical pricing

-- Check if orderId column exists, add if not
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = '_PurchasedLeads' 
AND COLUMN_NAME = 'orderId';

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE _PurchasedLeads ADD COLUMN orderId VARCHAR(255) NULL COMMENT "Link to Order table"',
    'SELECT "orderId column already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if purchasePrice column exists, add if not
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = '_PurchasedLeads' 
AND COLUMN_NAME = 'purchasePrice';

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE _PurchasedLeads ADD COLUMN purchasePrice DECIMAL(10,2) NULL COMMENT "Price paid for this lead"',
    'SELECT "purchasePrice column already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if foreign key exists, add if not
SET @fk_exists = 0;
SELECT COUNT(*) INTO @fk_exists 
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = '_PurchasedLeads' 
AND CONSTRAINT_NAME = 'fk_purchased_leads_order';

SET @sql = IF(@fk_exists = 0,
    'ALTER TABLE _PurchasedLeads ADD CONSTRAINT fk_purchased_leads_order FOREIGN KEY (orderId) REFERENCES `Order`(id) ON DELETE SET NULL',
    'SELECT "Foreign key constraint already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check if index exists, add if not
SET @idx_exists = 0;
SELECT COUNT(*) INTO @idx_exists 
FROM INFORMATION_SCHEMA.STATISTICS 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME = '_PurchasedLeads' 
AND INDEX_NAME = 'idx_order';

SET @sql = IF(@idx_exists = 0,
    'ALTER TABLE _PurchasedLeads ADD INDEX idx_order (orderId)',
    'SELECT "Index already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- Migration Complete!
-- ============================================
-- Tables created:
-- - Cart (shopping cart items)
-- - Order (payment orders with tax calculation)
-- - OrderItem (order line items)
-- 
-- Tables updated:
-- - _PurchasedLeads (added orderId and purchasePrice columns)
-- ============================================
