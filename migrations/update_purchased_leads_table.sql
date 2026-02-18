-- Update _PurchasedLeads table to link to orders
ALTER TABLE _PurchasedLeads 
ADD COLUMN IF NOT EXISTS orderId VARCHAR(255) NULL COMMENT 'Link to Order table',
ADD COLUMN IF NOT EXISTS purchasePrice DECIMAL(10,2) NULL COMMENT 'Price paid for this lead';

-- Add foreign key constraint
ALTER TABLE _PurchasedLeads
ADD CONSTRAINT fk_purchased_leads_order
FOREIGN KEY (orderId) REFERENCES `Order`(id) ON DELETE SET NULL;

-- Add index for performance
ALTER TABLE _PurchasedLeads
ADD INDEX IF NOT EXISTS idx_order (orderId);
