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

    async findPublishedLeads(): Promise<Lead[]> {
        const pool = getPool()
        const [rows] = await pool.execute(
            'SELECT * FROM Lead WHERE status = ? ORDER BY createdAt DESC',
            ['PUBLISHED']
        )
        return rows as Lead[]
    },

    async findLeadsByBuyerId(buyerId: string): Promise<Lead[]> {
        const pool = getPool()
        // Note: This requires a join with the _PurchasedLeads table (Prisma's many-to-many relation table)
        const [rows] = await pool.execute(
            `SELECT l.* FROM Lead l 
             INNER JOIN _PurchasedLeads pl ON l.id = pl.B 
             WHERE pl.A = ? 
             ORDER BY l.createdAt DESC`,
            [buyerId]
        )
        return rows as Lead[]
    },

    async findNewLeads(): Promise<Lead[]> {
        const pool = getPool()
        const [rows] = await pool.execute(
            'SELECT * FROM `Lead` WHERE status = ? ORDER BY createdAt DESC',
            ['NEW']
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

    async updateLeadStatus(leadId: string, status: string): Promise<void> {
        const pool = getPool()
        await pool.execute(
            'UPDATE Lead SET status = ?, updatedAt = ? WHERE id = ?',
            [status, new Date(), leadId]
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
            const firstDayOfMonth = new Date()
            firstDayOfMonth.setDate(1)
            firstDayOfMonth.setHours(0, 0, 0, 0)

            const [rows] = await pool.execute(
                'SELECT COUNT(*) as count FROM _PurchasedLeads WHERE createdAt >= ?',
                [firstDayOfMonth]
            )
            const result = rows as { count: number }[]
            return result[0]?.count || 0
        } catch (error) {
            // Table might not exist yet, return 0
            console.error('Error counting purchased leads:', error)
            return 0
        }
    },
}

