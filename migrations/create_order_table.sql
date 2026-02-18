-- Create Order table for payment tracking
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
