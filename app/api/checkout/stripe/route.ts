import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2025-02-24.acacia'
})

const TAX_RATE = 0.19 // 19% MwSt

function calculatePricing(items: { leadId: string; price: number }[]) {
    const subtotal = items.reduce((sum, item) => sum + item.price, 0)
    const discountRate = items.length >= 5 ? 0.05 : 0
    const discountAmount = subtotal * discountRate
    const subtotalAfterDiscount = subtotal - discountAmount
    const taxAmount = subtotalAfterDiscount * TAX_RATE
    const total = subtotalAfterDiscount + taxAmount
    return { subtotal, discountRate, discountAmount, subtotalAfterDiscount, taxAmount, total }
}

// POST /api/checkout/stripe - Create Stripe Checkout Session
export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { items, isSingleItem } = await request.json()

        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'No items provided' }, { status: 400 })
        }

        // Validate items and check for already purchased leads
        const purchasedLeads = await db.getPurchasedLeads(session.user.id)
        const purchasedIds = purchasedLeads.map((l: any) => l.id)

        for (const item of items) {
            if (purchasedIds.includes(item.leadId)) {
                return NextResponse.json({
                    error: `Lead ${item.leadId} wurde bereits gekauft`
                }, { status: 409 })
            }
        }

        const { subtotal, discountRate, discountAmount, subtotalAfterDiscount, taxAmount, total } = calculatePricing(items)

        // Build Stripe line items
        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item: any) => ({
            price_data: {
                currency: 'eur',
                product_data: {
                    name: `Pool Lead`,
                    description: `Lead ID: ${item.leadId}`,
                },
                unit_amount: Math.round(item.price * 100), // Stripe uses cents
            },
            quantity: 1,
        }))

        // Add discount as negative line item if applicable
        if (discountAmount > 0) {
            lineItems.push({
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: `Mengenrabatt (${discountRate * 100}%)`,
                    },
                    unit_amount: -Math.round(discountAmount * 100),
                },
                quantity: 1,
            })
        }

        // Create Stripe Checkout Session
        const checkoutSession = await stripe.checkout.sessions.create({
            mode: 'payment',
            line_items: lineItems,
            currency: 'eur',
            success_url: `${process.env.NEXTAUTH_URL}/dashboard/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/checkout/cancel`,
            metadata: {
                userId: session.user.id,
                leadIds: JSON.stringify(items.map((i: any) => i.leadId)),
                prices: JSON.stringify(items.map((i: any) => i.price)),
                isSingleItem: isSingleItem ? 'true' : 'false',
                subtotal: subtotal.toFixed(2),
                discount: discountAmount.toFixed(2),
                taxAmount: taxAmount.toFixed(2),
                total: total.toFixed(2),
            },
            // German tax display
            automatic_tax: { enabled: false },
            payment_method_types: ['card'],
            locale: 'de',
        })

        return NextResponse.json({ url: checkoutSession.url })
    } catch (error: any) {
        console.error('Stripe checkout error:', error)
        return NextResponse.json({
            error: error.message || 'Failed to create checkout session'
        }, { status: 500 })
    }
}
