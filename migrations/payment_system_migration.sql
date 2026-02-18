-- ============================================
-- Payment System Database Migration
-- Created: 2026-02-17 (Fixed: 2026-02-18)
-- Description: Creates tables for shopping cart, orders, and payment tracking
-- NOTE: Lead and User are escaped with backticks (reserved words in MySQL)
-- ============================================

-- 1. Create Cart table
CREATE TABLE IF NOT EXISTS `Cart` (
    id VARCHAR(255) PRIMARY KEY,
    userId VARCHAR(255) NOT NULL,
    leadId VARCHAR(255) NOT NULL,
    addedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES `User`(id) ON DELETE CASCADE,
    FOREIGN KEY (leadId) REFERENCES `Lead`(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_lead (userId, leadId),
    INDEX idx_cart_user (userId),
    INDEX idx_cart_lead (leadId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Create Order table
CREATE TABLE IF NOT EXISTS `Order` (
    id VARCHAR(255) PRIMARY KEY,
    userId VARCHAR(255) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0.00,
    taxRate DECIMAL(5,2) DEFAULT 19.00,
    taxAmount DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    paymentMethod ENUM('stripe', 'paypal') NOT NULL,
    paymentId VARCHAR(255) NOT NULL,
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    invoiceNumber VARCHAR(50) UNIQUE,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    completedAt DATETIME NULL,
    FOREIGN KEY (userId) REFERENCES `User`(id) ON DELETE CASCADE,
    INDEX idx_order_user (userId),
    INDEX idx_order_status (status),
    INDEX idx_order_created (createdAt),
    INDEX idx_order_invoice (invoiceNumber)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Create OrderItem table
CREATE TABLE IF NOT EXISTS `OrderItem` (
    id VARCHAR(255) PRIMARY KEY,
    orderId VARCHAR(255) NOT NULL,
    leadId VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (orderId) REFERENCES `Order`(id) ON DELETE CASCADE,
    FOREIGN KEY (leadId) REFERENCES `Lead`(id) ON DELETE CASCADE,
    INDEX idx_item_order (orderId),
    INDEX idx_item_lead (leadId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Update _PurchasedLeads table
-- Add orderId column if it doesn't exist
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = '_PurchasedLeads'
AND COLUMN_NAME = 'orderId';

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE `_PurchasedLeads` ADD COLUMN orderId VARCHAR(255) NULL',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add purchasePrice column if it doesn't exist
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = '_PurchasedLeads'
AND COLUMN_NAME = 'purchasePrice';

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE `_PurchasedLeads` ADD COLUMN purchasePrice DECIMAL(10,2) NULL',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add foreign key if it doesn't exist
SET @fk_exists = 0;
SELECT COUNT(*) INTO @fk_exists
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = '_PurchasedLeads'
AND CONSTRAINT_NAME = 'fk_purchased_leads_order';

SET @sql = IF(@fk_exists = 0,
    'ALTER TABLE `_PurchasedLeads` ADD CONSTRAINT fk_purchased_leads_order FOREIGN KEY (orderId) REFERENCES `Order`(id) ON DELETE SET NULL',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index if it doesn't exist
SET @idx_exists = 0;
SELECT COUNT(*) INTO @idx_exists
FROM INFORMATION_SCHEMA.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
AND TABLE_NAME = '_PurchasedLeads'
AND INDEX_NAME = 'idx_pl_order';

SET @sql = IF(@idx_exists = 0,
    'ALTER TABLE `_PurchasedLeads` ADD INDEX idx_pl_order (orderId)',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- Migration Complete!
-- Tables: Cart, Order, OrderItem
-- Updated: _PurchasedLeads (orderId, purchasePrice)
-- ============================================
