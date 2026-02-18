-- Create OrderItem table for order line items
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
