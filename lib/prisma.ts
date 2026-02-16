import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import mariadb from 'mariadb'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const connectionString = `${process.env.DATABASE_URL}`

const createPrismaClient = () => {
    // Force IPv4 if URL is present
    const ipv4Url = connectionString.includes('localhost') || connectionString.includes('main-hosting.eu')
        ? connectionString.replace(/@([^:/]+)/, '@127.0.0.1')
        : connectionString;

    const pool = mariadb.createPool(ipv4Url)
    const adapter = new PrismaMariaDb(pool)
    return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
