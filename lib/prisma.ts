import { PrismaClient } from '@prisma/client'
import { PrismaMysql2 } from '@prisma/adapter-mysql2'
import mysql from 'mysql2'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const connectionString = `${process.env.DATABASE_URL}`

const createPrismaClient = () => {
    // Force IPv4 for the internal adapter pool if URL is present
    const ipv4Url = connectionString.includes('localhost') || connectionString.includes('main-hosting.eu')
        ? connectionString.replace(/@([^:/]+)/, '@127.0.0.1')
        : connectionString;

    const pool = mysql.createPool(ipv4Url)
    const adapter = new PrismaMysql2(pool)
    return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
