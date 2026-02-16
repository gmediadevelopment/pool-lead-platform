import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { Role } from "@prisma/client"

export async function POST(req: Request) {
    console.log("DEBUG: POST /api/register started")
    try {
        const body = await req.json()
        console.log("DEBUG: Request body parsed", { email: body.email })
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
        console.error("DEBUG: Registration caught error:", error.message)
        console.error("DEBUG: Stack trace:", error.stack)
        return NextResponse.json(
            {
                message: "Interner Serverfehler",
                error: error.message,
                stack: error.stack,
                type: error.constructor.name
            },
            { status: 500 }
        )
    }
}
