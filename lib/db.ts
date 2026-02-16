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
    firstName: string
    lastName: string
    email: string
    phone?: string
    zip: string
    city: string
    poolType: string
    dimensions: string
    features?: string
    estimatedPrice: number
    timeline: string
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

    async testConnection(): Promise<boolean> {
        try {
            const pool = getPool()
            await pool.execute('SELECT 1')
            return true
        } catch (error) {
            console.error('Database connection test failed:', error)
            return false
        }
    }
}

