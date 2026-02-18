-- Create Cart table for shopping cart functionality
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
