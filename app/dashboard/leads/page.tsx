import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { LeadsMarketplace } from "@/components/leads-marketplace"

export default async function LeadsPage() {
    const session = await getServerSession(authOptions)
    const leads = await db.findPublishedLeads(session?.user?.id)

    let purchasedLeadIds: string[] = []
    let cartLeadIds: string[] = []

    if (session?.user?.id) {
        const purchasedLeads = await db.getPurchasedLeads(session.user.id)
        purchasedLeadIds = purchasedLeads.map((l: any) => l.id)

        const cartItems = await db.getCart(session.user.id)
        cartLeadIds = cartItems.map((item: any) => item.leadId)
    }

    return (
        <LeadsMarketplace
            leads={leads as any[]}
            purchasedLeadIds={purchasedLeadIds}
            cartLeadIds={cartLeadIds}
        />
    )
}
