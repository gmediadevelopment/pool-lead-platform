import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { LeadStatus } from "@prisma/client"

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        const lead = await prisma.lead.findUnique({
            where: { id },
            include: { buyers: true }
        })

        if (!lead) {
            return NextResponse.json({ message: "Lead nicht gefunden" }, { status: 404 })
        }

        if (lead.status !== "PUBLISHED") {
            return NextResponse.json({ message: "Lead nicht verfügbar" }, { status: 400 })
        }

        const alreadyBought = lead.buyers.some(buyer => buyer.id === session.user.id)
        if (alreadyBought) {
            return NextResponse.json({ message: "Bereits gekauft" }, { status: 400 })
        }

        if (lead.exclusive && lead.salesCount >= 1) {
            return NextResponse.json({ message: "Lead bereits exklusiv verkauft" }, { status: 400 })
        }
        if (lead.salesCount >= lead.maxSales) {
            return NextResponse.json({ message: "Lead ausverkauft" }, { status: 400 })
        }

        // --- PAYMENT LOGIC (MVP: Simulate Success) ---
        const updatedLead = await prisma.$transaction(async (tx) => {
            // Create Transaction
            await tx.transaction.create({
                data: {
                    amount: lead.price,
                    status: "COMPLETED",
                    userId: session.user.id,
                    leadId: lead.id,
                    paymentId: "MOCK-" + Date.now(),
                }
            })

            // Update Lead
            const newSalesCount = lead.salesCount + 1
            const newStatus = (lead.exclusive && newSalesCount >= 1) || newSalesCount >= lead.maxSales
                ? LeadStatus.SOLD
                : lead.status

            return await tx.lead.update({
                where: { id: lead.id },
                data: {
                    salesCount: newSalesCount,
                    status: newStatus,
                    buyers: {
                        connect: { id: session.user.id }
                    }
                }
            })
        })

        return NextResponse.json({ message: "Kauf erfolgreich", lead: updatedLead })

    } catch (error) {
        console.error("Purchase error:", error)
        return NextResponse.json({ message: "Interner Fehler" }, { status: 500 })
    }
}
