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
    role: string
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
