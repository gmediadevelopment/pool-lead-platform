import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, LeadStatus, LeadType, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    // Clear existing leads first? No, append or reset?
    // Reset for clean slate in dev
    try {
        await prisma.transaction.deleteMany() // Delete dependent
        await prisma.lead.deleteMany()
        // User cannot be deleted easily due to circular refs or just careful order?
        // User deletions not needed for leads testing.

        console.log("Deleted old data")

        await prisma.lead.createMany({
            data: [
                {
                    firstName: "Max",
                    lastName: "Mustermann",
                    email: "max@test.com",
                    zip: "10115",
                    city: "Berlin",
                    poolType: "Betonpool",
                    dimensions: "8x4m",
                    features: "Gegenstromanlage, Heizung",
                    status: LeadStatus.PUBLISHED, // Only visible leads
                    type: LeadType.CONSULTATION,
                    price: 99.00,
                    estimatedPrice: 25000,
                    budgetConfirmed: true,
                    timeline: "Sommer 2024",
                    exclusive: true,
                },
                {
                    firstName: "Julia",
                    lastName: "Sommer",
                    email: "julia@test.com",
                    zip: "80331",
                    city: "München",
                    poolType: "GFK-Pool",
                    dimensions: "6x3m",
                    features: "Beleuchtung, Abdeckung",
                    status: LeadStatus.PUBLISHED,
                    type: LeadType.INTEREST,
                    price: 49.00,
                    estimatedPrice: 15000,
                    budgetConfirmed: false,
                    timeline: "Sofort",
                    exclusive: false,
                },
                {
                    firstName: "Thomas",
                    lastName: "Müller",
                    email: "thomas@test.com",
                    zip: "20095",
                    city: "Hamburg",
                    poolType: "Edelstahlpool",
                    dimensions: "10x4m",
                    features: "Infinity-Kante, Automatische Dosierung",
                    status: LeadStatus.NEW, // Not visible yet
                    type: LeadType.CONSULTATION,
                    price: 99.00,
                    estimatedPrice: 45000,
                    budgetConfirmed: true,
                    timeline: "Nächstes Jahr",
                    exclusive: true,
                }
            ]
        })
        console.log("Database seeded successfully!")
    } catch (e) {
        console.error(e)
        // process.exit(1) // Don't exit yet, try to create user
    }

    try {
        const hashedPassword = await bcrypt.hash("admin123", 10)

        await prisma.user.upsert({
            where: { email: "admin@poolplatform.com" },
            update: {},
            create: {
                email: "admin@poolplatform.com",
                password: hashedPassword,
                role: Role.ADMIN,
                companyName: "System Admin",
            }
        })
        console.log("Admin user created/verified: admin@poolplatform.com / admin123")
    } catch (e) {
        console.error("Error creating admin user:", e)
        process.exit(1)
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
        await pool.end() // Close pool
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        await pool.end()
        process.exit(1)
    })
