const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function runMigrations() {
    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL not found in environment variables');
        process.exit(1);
    }

    const connection = await mysql.createConnection(process.env.DATABASE_URL);

    try {
        console.log('Starting payment system migrations...\n');

        // 1. Create Cart table
        console.log('1. Creating Cart table...');
        const cartSQL = `
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
        `;
        await connection.execute(cartSQL);
        console.log('✓ Cart table created\n');

        // 2. Create Order table
        console.log('2. Creating Order table...');
        const orderSQL = `
            CREATE TABLE IF NOT EXISTS \`Order\` (
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
        `;
        await connection.execute(orderSQL);
        console.log('✓ Order table created\n');

        // 3. Create OrderItem table
        console.log('3. Creating OrderItem table...');
        const orderItemSQL = `
            CREATE TABLE IF NOT EXISTS OrderItem (
                id VARCHAR(255) PRIMARY KEY,
                orderId VARCHAR(255) NOT NULL,
                leadId VARCHAR(255) NOT NULL,
                price DECIMAL(10,2) NOT NULL COMMENT 'Price at time of purchase',
                FOREIGN KEY (orderId) REFERENCES \`Order\`(id) ON DELETE CASCADE,
                FOREIGN KEY (leadId) REFERENCES Lead(id) ON DELETE CASCADE,
                INDEX idx_order (orderId),
                INDEX idx_lead (leadId)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `;
        await connection.execute(orderItemSQL);
        console.log('✓ OrderItem table created\n');

        // 4. Update _PurchasedLeads table
        console.log('4. Updating _PurchasedLeads table...');

        // Check if columns already exist
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = '_PurchasedLeads'
            AND COLUMN_NAME IN ('orderId', 'purchasePrice')
        `);

        const existingColumns = columns.map(col => col.COLUMN_NAME);

        if (!existingColumns.includes('orderId')) {
            await connection.execute(`
                ALTER TABLE _PurchasedLeads 
                ADD COLUMN orderId VARCHAR(255) NULL COMMENT 'Link to Order table'
            `);
            console.log('  ✓ Added orderId column');
        } else {
            console.log('  - orderId column already exists');
        }

        if (!existingColumns.includes('purchasePrice')) {
            await connection.execute(`
                ALTER TABLE _PurchasedLeads 
                ADD COLUMN purchasePrice DECIMAL(10,2) NULL COMMENT 'Price paid for this lead'
            `);
            console.log('  ✓ Added purchasePrice column');
        } else {
            console.log('  - purchasePrice column already exists');
        }

        // Add foreign key if not exists
        const [fks] = await connection.execute(`
            SELECT CONSTRAINT_NAME 
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = '_PurchasedLeads'
            AND CONSTRAINT_NAME = 'fk_purchased_leads_order'
        `);

        if (fks.length === 0) {
            await connection.execute(`
                ALTER TABLE _PurchasedLeads
                ADD CONSTRAINT fk_purchased_leads_order
                FOREIGN KEY (orderId) REFERENCES \`Order\`(id) ON DELETE SET NULL
            `);
            console.log('  ✓ Added foreign key constraint');
        } else {
            console.log('  - Foreign key constraint already exists');
        }

        console.log('✓ _PurchasedLeads table updated\n');

        console.log('✅ All migrations completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        throw error;
    } finally {
        await connection.end();
    }
}

runMigrations().catch(console.error);
