import mysql from 'mysql2/promise'

// Create a connection pool for better performance
let pool: mysql.Pool | null = null

function getPool() {
    if (!pool) {
        const connectionString = process.env.DATABASE_URL || ''

        // Force IPv4 for Hostinger compatibility
        const ipv4Url = connectionString.includes('localhost') || connectionString.includes('main-hosting.eu')
            ? connectionString.replace(/@([^:/]+)/, '@127.0.0.1')
            : connectionString

        pool = mysql.createPool(ipv4Url)
    }
    return pool
}

export interface User {
    id: string
    email: string
    password: string
    companyName: string
    phone?: string
    address?: string
    role: string
    createdAt: Date
    updatedAt: Date
}

export interface Lead {
    id: string
    externalId?: string
    date?: Date
    firstName: string
    lastName: string
    email: string
    phone?: string
    zip: string
    city: string
    poolType: string
    dimensions: string
    features?: string
    estimatedPrice?: number
    estimatedPriceMin?: number
    estimatedPriceMax?: number
    timeline?: string
    budgetConfirmed?: boolean
    type: string
    status: string
    price: number
    createdAt: Date
    updatedAt: Date
}

export const db = {
    async findUserByEmail(email: string): Promise<User | null> {
        const pool = getPool()
        const [rows] = await pool.execute(
            'SELECT * FROM User WHERE email = ? LIMIT 1',
            [email]
        )
        const users = rows as User[]
        return users.length > 0 ? users[0] : null
    },

    async findUserById(id: string): Promise<User | null> {
        const pool = getPool()
        const [rows] = await pool.execute(
            'SELECT * FROM User WHERE id = ? LIMIT 1',
            [id]
        )
        const users = rows as User[]
        return users.length > 0 ? users[0] : null
    },

    async createUser(data: { email: string; password: string; companyName: string; role: string }): Promise<User> {
        const pool = getPool()
        const id = crypto.randomUUID()
        const now = new Date()

        await pool.execute(
            'INSERT INTO User (id, email, password, companyName, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, data.email, data.password, data.companyName, data.role, now, now]
        )

        return {
            id,
            email: data.email,
            password: data.password,
            companyName: data.companyName,
            role: data.role,
            createdAt: now,
            updatedAt: now
        }
    },

    async createLeadFromWebhook(data: {
        firstName: string
        lastName: string
        email: string
        phone: string
        zip: string
        city: string
        poolType: string
        installation: string
        dimensions: string
        features: string
        estimatedPrice?: number
        estimatedPriceMin?: number
        estimatedPriceMax?: number
        timeline: string
        budgetConfirmed: boolean
        status: string
        source: string
    }): Promise<Lead> {
        const pool = getPool()
        const id = crypto.randomUUID()
        const now = new Date()

        // Calculate lead price based on estimated budget
        const leadPrice = data.estimatedPriceMin
            ? Math.round(data.estimatedPriceMin * 0.01) // 1% of min estimate
            : 49 // default price

        await pool.execute(
            `INSERT INTO \`Lead\` (id, firstName, lastName, email, phone, zip, city, poolType, dimensions, features,
             estimatedPrice, estimatedPriceMin, estimatedPriceMax, timeline, budgetConfirmed,
             type, status, price, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                data.firstName,
                data.lastName,
                data.email,
                data.phone,
                data.zip,
                data.city,
                `${data.poolType}${data.installation ? ' / ' + data.installation : ''}`,
                data.dimensions,
                data.features,
                data.estimatedPrice || null,
                data.estimatedPriceMin || null,
                data.estimatedPriceMax || null,
                data.timeline,
                data.budgetConfirmed ? 1 : 0,
                'POOL',
                'NEW',
                leadPrice,
                now,
                now,
            ]
        )

        return {
            id,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            zip: data.zip,
            city: data.city,
            poolType: data.poolType,
            dimensions: data.dimensions,
            features: data.features,
            estimatedPrice: data.estimatedPrice,
            estimatedPriceMin: data.estimatedPriceMin,
            estimatedPriceMax: data.estimatedPriceMax,
            timeline: data.timeline,
            budgetConfirmed: data.budgetConfirmed,
            type: 'POOL',
            status: 'NEW',
            price: leadPrice,
            createdAt: now,
            updatedAt: now,
        }
    },

    async findLeadByEmail(email: string): Promise<Lead | null> {
        const pool = getPool()
        const [rows] = await pool.execute(
            'SELECT * FROM `Lead` WHERE email = ? ORDER BY createdAt DESC LIMIT 1',
            [email]
        )
        const leads = rows as Lead[]
        return leads.length > 0 ? leads[0] : null
    },

    async updateLeadStatus(
        id: string,
        status: string,
        extra?: { timeline?: string; budgetConfirmed?: boolean }
    ): Promise<void> {
        const pool = getPool()
        const now = new Date()

        if (extra && (extra.timeline !== undefined || extra.budgetConfirmed !== undefined)) {
            await pool.execute(
                'UPDATE `Lead` SET status = ?, timeline = COALESCE(?, timeline), budgetConfirmed = COALESCE(?, budgetConfirmed), updatedAt = ? WHERE id = ?',
                [
                    status,
                    extra.timeline ?? null,
                    extra.budgetConfirmed !== undefined ? (extra.budgetConfirmed ? 1 : 0) : null,
                    now,
                    id,
                ]
            )
        } else {
            await pool.execute(
                'UPDATE `Lead` SET status = ?, updatedAt = ? WHERE id = ?',
                [status, now, id]
            )
        }
    },

    // Update lead to consultation - preserves PUBLISHED status, updates type
    async updateLeadConsultation(
        id: string,
        status: string,
        extra?: { timeline?: string; budgetConfirmed?: boolean }
    ): Promise<void> {
        const pool = getPool()
        const now = new Date()
        await pool.execute(
            `UPDATE \`Lead\` SET 
                status = ?,
                type = 'CONSULTATION',
                timeline = COALESCE(?, timeline),
                budgetConfirmed = COALESCE(?, budgetConfirmed),
                updatedAt = ?
             WHERE id = ?`,
            [
                status,
                extra?.timeline ?? null,
                extra?.budgetConfirmed !== undefined ? (extra.budgetConfirmed ? 1 : 0) : null,
                now,
                id,
            ]
        )
    },

    async findPublishedLeads(excludeUserId?: string): Promise<Lead[]> {
        const pool = getPool()
        if (excludeUserId) {
            // Exclude leads already purchased by this user
            // _PurchasedLeads: A = Lead.id (alphabetically first), B = User.id
            const [rows] = await pool.execute(`
                SELECT l.* FROM Lead l
                WHERE l.status = 'PUBLISHED'
                AND l.id NOT IN (
                    SELECT A FROM _PurchasedLeads WHERE B = ?
                )
                ORDER BY l.createdAt DESC
            `, [excludeUserId])
            return rows as Lead[]
        }
        const [rows] = await pool.execute(
            'SELECT * FROM Lead WHERE status = ? ORDER BY createdAt DESC',
            ['PUBLISHED']
        )
        return rows as Lead[]
    },

    async findLeadsByBuyerId(buyerId: string): Promise<any[]> {
        const pool = getPool()
        // _PurchasedLeads: A = Lead.id, B = User.id (Prisma implicit M2M convention)
        // Left join Order to get purchase date
        const [rows] = await pool.execute(
            `SELECT l.*, 
                COALESCE(o.completedAt, o.createdAt) as purchasedAt,
                COALESCE(pl.purchasePrice, l.price) as paidPrice
             FROM Lead l
             INNER JOIN _PurchasedLeads pl ON l.id = pl.A
             LEFT JOIN \`Order\` o ON pl.orderId = o.id
             WHERE pl.B = ?
             ORDER BY purchasedAt DESC`,
            [buyerId]
        )
        return rows as any[]
    },

    async findNewLeads(): Promise<Lead[]> {
        const pool = getPool()
        // Show both NEW and CONSULTATION_REQUESTED leads in admin queue
        const [rows] = await pool.execute(
            "SELECT * FROM `Lead` WHERE status IN ('NEW', 'CONSULTATION_REQUESTED') ORDER BY createdAt DESC"
        )
        return rows as Lead[]
    },

    async findVerifiedLeads(): Promise<Lead[]> {
        const pool = getPool()
        const [rows] = await pool.execute(
            'SELECT * FROM `Lead` WHERE status = ? ORDER BY createdAt DESC',
            ['PUBLISHED']
        )
        return rows as Lead[]
    },

    async updateLead(id: string, data: Partial<Lead>): Promise<void> {
        const pool = getPool()
        const updates: string[] = []
        const values: any[] = []

        // Build dynamic UPDATE query based on provided fields
        const allowedFields = [
            'firstName', 'lastName', 'email', 'phone', 'zip', 'city',
            'poolType', 'dimensions', 'features',
            'estimatedPrice', 'estimatedPriceMin', 'estimatedPriceMax',
            'timeline', 'budgetConfirmed', 'price'
        ]

        for (const field of allowedFields) {
            if (field in data) {
                updates.push(`${field} = ?`)
                values.push(data[field as keyof Lead])
            }
        }

        if (updates.length === 0) return

        values.push(new Date()) // updatedAt
        values.push(id)

        await pool.execute(
            `UPDATE \`Lead\` SET ${updates.join(', ')}, updatedAt = ? WHERE id = ?`,
            values
        )
    },

    async deleteLead(id: string): Promise<void> {
        const pool = getPool()
        await pool.execute('DELETE FROM `Lead` WHERE id = ?', [id])
    },

    async unpublishLead(id: string): Promise<void> {
        const pool = getPool()
        await pool.execute(
            'UPDATE `Lead` SET status = ?, updatedAt = ? WHERE id = ?',
            ['NEW', new Date(), id]
        )
    },


    async findAllUsersWithLeadCount(): Promise<(User & { purchasedLeadsCount: number })[]> {
        const pool = getPool()
        const [rows] = await pool.execute(
            `SELECT u.*, COUNT(pl.B) as purchasedLeadsCount
             FROM User u
             LEFT JOIN _PurchasedLeads pl ON u.id = pl.A
             GROUP BY u.id
             ORDER BY u.createdAt DESC`
        )
        return rows as (User & { purchasedLeadsCount: number })[]
    },

    async findLeadByExternalId(externalId: string): Promise<Lead | null> {
        const pool = getPool()
        const [rows] = await pool.execute(
            'SELECT * FROM Lead WHERE externalId = ? LIMIT 1',
            [externalId]
        )
        const leads = rows as Lead[]
        return leads.length > 0 ? leads[0] : null
    },

    async createLeadFromSheet(lead: {
        externalId: string
        date?: Date
        firstName?: string
        lastName?: string
        email?: string
        phone?: string
        zip?: string
        city?: string
        poolType?: string
        dimensions?: string
        features?: string
        estimatedPrice?: number
        estimatedPriceMin?: number
        estimatedPriceMax?: number
        timeline?: string
        budgetConfirmed?: boolean
        isConsultationLead?: boolean
    }): Promise<string> {
        const pool = getPool()
        const leadId = `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const now = new Date()

        // Determine lead price based on type from Google Sheets Status column
        // Beratungs-Lead (99€) if isConsultationLead is true
        // Otherwise Konfigurator-Lead (49€)
        const leadPrice = lead.isConsultationLead ? 99.00 : 49.00

        await pool.execute(
            `INSERT INTO \`Lead\` (
                id, externalId, date, firstName, lastName, email, phone, zip, city,
                poolType, dimensions, features, 
                estimatedPrice, estimatedPriceMin, estimatedPriceMax,
                timeline, budgetConfirmed,
                status, type, price, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                leadId,
                lead.externalId,
                lead.date || null,
                lead.firstName || null,
                lead.lastName || null,
                lead.email || null,
                lead.phone || null,
                lead.zip || null,
                lead.city || null,
                lead.poolType || null,
                lead.dimensions || null,
                lead.features || null,
                lead.estimatedPrice || null,
                lead.estimatedPriceMin || null,
                lead.estimatedPriceMax || null,
                lead.timeline || null,
                lead.budgetConfirmed || false,
                'NEW', // Always import as NEW for admin review
                'INTEREST', // Default type
                leadPrice, // Dynamic: 49€ for Konfigurator, 99€ for Beratung
                now,
                now
            ]
        )

        return leadId
    },


    async testConnection(): Promise<boolean> {
        try {
            const pool = getPool()
            await pool.execute('SELECT 1')
            return true
        } catch (error) {
            console.error('Database connection test failed:', error)
            return false
        }
    },

    async countAvailableLeads(): Promise<number> {
        const pool = getPool()
        const [rows] = await pool.execute(
            'SELECT COUNT(*) as count FROM `Lead` WHERE status = ?',
            ['PUBLISHED']
        )
        const result = rows as { count: number }[]
        return result[0]?.count || 0
    },

    async countPurchasedLeadsThisMonth(): Promise<number> {
        try {
            const pool = getPool()
            const [rows] = await pool.execute(
                'SELECT COUNT(*) as count FROM _PurchasedLeads'
            )
            const result = rows as { count: number }[]
            return result[0]?.count || 0
        } catch (error) {
            console.error('Error counting purchased leads:', error)
            return 0
        }
    },

    async getPurchasedLeads(userId: string): Promise<Lead[]> {
        const pool = getPool()
        try {
            // _PurchasedLeads: A = Lead.id, B = User.id (Prisma implicit M2M)
            const [rows] = await pool.execute(`
                SELECT l.* FROM Lead l
                INNER JOIN _PurchasedLeads pl ON l.id = pl.A
                WHERE pl.B = ?
                ORDER BY l.createdAt DESC
            `, [userId])
            return rows as Lead[]
        } catch (error) {
            console.error('Error fetching purchased leads:', error)
            return []
        }
    },

    // ==================== CART FUNCTIONS ====================

    async purchaseLead(userId: string, leadId: string): Promise<void> {
        const pool = getPool()
        // _PurchasedLeads: A = Lead.id, B = User.id (Prisma implicit M2M convention)
        try {
            await pool.execute(
                `INSERT IGNORE INTO _PurchasedLeads (A, B) VALUES (?, ?)`,
                [leadId, userId]
            )
        } catch (error) {
            console.error('Error recording purchase:', error)
            throw error
        }
    },

    async addToCart(userId: string, leadId: string): Promise<void> {
        const pool = getPool()
        const cartId = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        await pool.execute(
            'INSERT INTO Cart (id, userId, leadId) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE addedAt = CURRENT_TIMESTAMP',
            [cartId, userId, leadId]
        )
    },

    async removeFromCart(userId: string, leadId: string): Promise<void> {
        const pool = getPool()
        await pool.execute(
            'DELETE FROM Cart WHERE userId = ? AND leadId = ?',
            [userId, leadId]
        )
    },

    async getCart(userId: string): Promise<any[]> {
        const pool = getPool()
        const [rows] = await pool.execute(`
            SELECT 
                c.id,
                c.userId,
                c.leadId,
                c.addedAt,
                l.*
            FROM Cart c
            INNER JOIN Lead l ON c.leadId = l.id
            WHERE c.userId = ?
            ORDER BY c.addedAt DESC
        `, [userId])

        return rows as any[]
    },

    async clearCart(userId: string): Promise<void> {
        const pool = getPool()
        await pool.execute('DELETE FROM Cart WHERE userId = ?', [userId])
    },

    async isInCart(userId: string, leadId: string): Promise<boolean> {
        const pool = getPool()
        const [rows] = await pool.execute(
            'SELECT id FROM Cart WHERE userId = ? AND leadId = ?',
            [userId, leadId]
        ) as any
        return rows.length > 0
    },

    // ==================== ORDER FUNCTIONS ====================

    async createOrder(orderData: {
        userId: string
        subtotal: number
        discount: number
        taxRate: number
        taxAmount: number
        total: number
        paymentMethod: 'stripe' | 'paypal'
        paymentId: string
    }): Promise<string> {
        const pool = getPool()
        const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        await pool.execute(`
            INSERT INTO \`Order\` (
                id, userId, subtotal, discount, taxRate, taxAmount, total,
                paymentMethod, paymentId, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
        `, [
            orderId,
            orderData.userId,
            orderData.subtotal,
            orderData.discount,
            orderData.taxRate,
            orderData.taxAmount,
            orderData.total,
            orderData.paymentMethod,
            orderData.paymentId
        ])

        return orderId
    },

    async addOrderItem(orderId: string, leadId: string, price: number): Promise<void> {
        const pool = getPool()
        const itemId = `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

        await pool.execute(
            'INSERT INTO OrderItem (id, orderId, leadId, price) VALUES (?, ?, ?, ?)',
            [itemId, orderId, leadId, price]
        )
    },

    async completeOrder(orderId: string, invoiceNumber: string): Promise<void> {
        const pool = getPool()
        await pool.execute(`
            UPDATE \`Order\` 
            SET status = 'completed', 
                invoiceNumber = ?,
                completedAt = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [invoiceNumber, orderId])
    },

    async failOrder(orderId: string): Promise<void> {
        const pool = getPool()
        await pool.execute(
            'UPDATE `Order` SET status = \'failed\' WHERE id = ?',
            [orderId]
        )
    },

    async getOrder(orderId: string): Promise<any | null> {
        const pool = getPool()
        const [rows] = await pool.execute(
            'SELECT * FROM `Order` WHERE id = ?',
            [orderId]
        ) as any
        return rows[0] || null
    },

    // Alias for getOrder
    async getOrderById(orderId: string): Promise<any | null> {
        return this.getOrder(orderId)
    },

    // Idempotency check - find order by Stripe/PayPal payment ID
    async getOrderByPaymentId(paymentId: string): Promise<any | null> {
        const pool = getPool()
        const [rows] = await pool.execute(
            'SELECT * FROM `Order` WHERE paymentId = ? LIMIT 1',
            [paymentId]
        ) as any
        return rows[0] || null
    },

    async getOrderItems(orderId: string): Promise<any[]> {
        const pool = getPool()
        const [rows] = await pool.execute(`
            SELECT 
                oi.*,
                l.*
            FROM OrderItem oi
            INNER JOIN Lead l ON oi.leadId = l.id
            WHERE oi.orderId = ?
        `, [orderId])

        return rows as any[]
    },

    async getUserOrders(userId: string): Promise<any[]> {
        const pool = getPool()
        const [rows] = await pool.execute(`
            SELECT * FROM \`Order\`
            WHERE userId = ?
            ORDER BY createdAt DESC
        `, [userId])

        return rows as any[]
    },

    async getNextInvoiceNumber(): Promise<string> {
        const pool = getPool()
        const year = new Date().getFullYear()

        const [rows] = await pool.execute(`
            SELECT invoiceNumber 
            FROM \`Order\` 
            WHERE invoiceNumber LIKE ?
            ORDER BY invoiceNumber DESC 
            LIMIT 1
        `, [`INV-${year}-%`]) as any

        if (rows.length === 0) {
            return `INV-${year}-00001`
        }

        const lastNumber = parseInt(rows[0].invoiceNumber.split('-')[2])
        const nextNumber = (lastNumber + 1).toString().padStart(5, '0')
        return `INV-${year}-${nextNumber}`
    },

    // Link purchased leads to order - sets orderId and purchasePrice (added via migration)
    async linkPurchasedLeadsToOrder(userId: string, leadIds: string[], orderId: string, prices: number[]): Promise<void> {
        const pool = getPool()
        // _PurchasedLeads: A = Lead.id, B = User.id (Prisma implicit M2M)
        for (let i = 0; i < leadIds.length; i++) {
            try {
                await pool.execute(`
                    UPDATE _PurchasedLeads 
                    SET orderId = ?, purchasePrice = ?
                    WHERE A = ? AND B = ?
                `, [orderId, prices[i], leadIds[i], userId])
            } catch (e) {
                // purchasePrice/orderId columns may not exist yet - ignore
            }
        }
    },

    // Update lead salesCount and set status to SOLD if maxSales reached
    async updateLeadSalesCount(leadId: string): Promise<void> {
        const pool = getPool()
        await pool.execute(`
            UPDATE Lead
            SET salesCount = salesCount + 1,
                status = CASE
                    WHEN (exclusive = 1 AND salesCount + 1 >= 1) THEN 'SOLD'
                    WHEN (salesCount + 1 >= maxSales) THEN 'SOLD'
                    ELSE status
                END
            WHERE id = ?
        `, [leadId])
    },

    // Get all sold leads for admin view
    async getSoldLeads(): Promise<any[]> {
        const pool = getPool()
        try {
            // _PurchasedLeads: A = Lead.id, B = User.id (Prisma implicit M2M)
            // Join with Order table to get actual purchase date
            const [rows] = await pool.execute(`
                SELECT 
                    l.*,
                    buyer_counts.buyerCount,
                    buyer_counts.buyerEmails,
                    buyer_counts.totalRevenue,
                    buyer_counts.lastSoldAt
                FROM Lead l
                INNER JOIN (
                    SELECT 
                        pl.A as leadId,
                        COUNT(pl.B) as buyerCount,
                        GROUP_CONCAT(u.email SEPARATOR ', ') as buyerEmails,
                        SUM(COALESCE(pl.purchasePrice, l2.price)) as totalRevenue,
                        MAX(o.completedAt) as lastSoldAt
                    FROM _PurchasedLeads pl
                    INNER JOIN User u ON pl.B = u.id
                    INNER JOIN Lead l2 ON pl.A = l2.id
                    LEFT JOIN \`Order\` o ON pl.orderId = o.id
                    GROUP BY pl.A
                ) buyer_counts ON l.id = buyer_counts.leadId
                ORDER BY buyer_counts.lastSoldAt DESC
            `) as any
            return rows as any[]
        } catch (error) {
            console.error('Error fetching sold leads:', error)
            return []
        }
    },
}

