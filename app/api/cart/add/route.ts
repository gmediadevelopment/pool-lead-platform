import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// POST /api/cart/add - Add lead to cart
export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { leadId } = await request.json()

        if (!leadId) {
            return NextResponse.json({ error: 'leadId is required' }, { status: 400 })
        }

        // Targeted single-lead lookup - avoids loading ALL leads into RAM
        const lead = await db.findLeadById(leadId)

        if (!lead || lead.status !== 'PUBLISHED') {
            return NextResponse.json({ error: 'Lead not found or not available' }, { status: 404 })
        }

        // Check if already purchased
        const purchasedLeads = await db.getPurchasedLeads(session.user.id)
        const alreadyPurchased = purchasedLeads.some(l => l.id === leadId)

        if (alreadyPurchased) {
            return NextResponse.json({ error: 'Lead already purchased' }, { status: 409 })
        }

        // Add to cart (ON DUPLICATE KEY UPDATE handles duplicates gracefully)
        await db.addToCart(session.user.id, leadId)

        return NextResponse.json({ success: true, message: 'Lead zum Warenkorb hinzugefügt' })
    } catch (error) {
        console.error('Error adding to cart:', error)
        return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 })
    }
}
