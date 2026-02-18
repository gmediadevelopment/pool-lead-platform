-- ============================================
-- Payment System Database Migration (Hostinger-kompatibel)
-- Erstellt: 2026-02-18
-- ANLEITUNG: Führe jeden Abschnitt EINZELN aus falls Fehler auftreten
-- ============================================

-- SCHRITT 1: Cart Tabelle erstellen
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

-- SCHRITT 2: Order Tabelle erstellen
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
    INDEX idx_order_created (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SCHRITT 3: OrderItem Tabelle erstellen
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

-- SCHRITT 4: _PurchasedLeads Tabelle erweitern
-- Spalte orderId hinzufügen (ignoriert Fehler wenn bereits vorhanden)
ALTER TABLE `_PurchasedLeads` ADD COLUMN orderId VARCHAR(255) NULL;

-- SCHRITT 5: purchasePrice Spalte hinzufügen
ALTER TABLE `_PurchasedLeads` ADD COLUMN purchasePrice DECIMAL(10,2) NULL;

-- SCHRITT 6: Foreign Key für orderId hinzufügen
ALTER TABLE `_PurchasedLeads`
    ADD CONSTRAINT fk_purchased_leads_order
    FOREIGN KEY (orderId) REFERENCES `Order`(id) ON DELETE SET NULL;

-- SCHRITT 7: Index für orderId hinzufügen
ALTER TABLE `_PurchasedLeads` ADD INDEX idx_pl_order (orderId);

-- ============================================
-- Migration abgeschlossen!
-- ============================================
