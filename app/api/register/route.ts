import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { Role } from "@prisma/client"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { email, password, companyName } = body

        if (!email || !password || !companyName) {
            return NextResponse.json(
                { message: "Fehlende Felder" },
                { status: 400 }
            )
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return NextResponse.json(
                { message: "Benutzer existiert bereits" },
                { status: 409 }
            )
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                companyName,
                role: Role.COMPANY,
            },
        })

        return NextResponse.json(
            { message: "Benutzer erstellt", user: { id: user.id, email: user.email } },
            { status: 201 }
        )
    } catch (error: any) {
        console.error("Registration error:", error)
        return NextResponse.json(
            {
                message: "Interner Serverfehler",
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            },
            { status: 500 }
        )
    }
}
