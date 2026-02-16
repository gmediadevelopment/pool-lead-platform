import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

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

        // Check if user exists (using direct MySQL2)
        console.log("DEBUG: Checking for existing user...")
        const existingUser = await db.findUserByEmail(email)

        if (existingUser) {
            console.log("DEBUG: User already exists")
            return NextResponse.json(
                { message: "Benutzer existiert bereits" },
                { status: 409 }
            )
        }

        console.log("DEBUG: Hashing password...")
        const hashedPassword = await bcrypt.hash(password, 10)

        console.log("DEBUG: Creating user in database...")
        const user = await db.createUser({
            email,
            password: hashedPassword,
            companyName,
            role: 'COMPANY',
        })

        console.log("DEBUG: User created successfully:", user.id)
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
