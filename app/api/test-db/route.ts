import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        console.log("DEBUG: Test-DB starting")
        const userCount = await prisma.user.count()
        return NextResponse.json({ status: "ok", userCount })
    } catch (error: any) {
        console.error("DEBUG: Test-DB error", error)
        return NextResponse.json({ status: "error", error: error.message }, { status: 500 })
    }
}
