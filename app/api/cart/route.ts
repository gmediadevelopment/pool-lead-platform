import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET /api/cart - Get user's cart
export async function GET() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const cartItems = await db.getCart(session.user.id)
        return NextResponse.json({ items: cartItems })
    } catch (error) {
        console.error('Error fetching cart:', error)
        return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
    }
}

// DELETE /api/cart - Clear entire cart
export async function DELETE() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        await db.clearCart(session.user.id)
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error clearing cart:', error)
        return NextResponse.json({ error: 'Failed to clear cart' }, { status: 500 })
    }
}
