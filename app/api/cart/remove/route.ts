import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// DELETE /api/cart/remove - Remove lead from cart
export async function DELETE(request: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { leadId } = await request.json()

        if (!leadId) {
            return NextResponse.json({ error: 'leadId is required' }, { status: 400 })
        }

        await db.removeFromCart(session.user.id, leadId)

        return NextResponse.json({ success: true, message: 'Lead aus Warenkorb entfernt' })
    } catch (error) {
        console.error('Error removing from cart:', error)
        return NextResponse.json({ error: 'Failed to remove from cart' }, { status: 500 })
    }
}
