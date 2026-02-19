import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import Stripe from 'stripe'

// Lazy initialization - only create Stripe instance at request time, not build time
function getStripe() {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY is not configured')
    }
    return new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-02-24.acacia'
    })
}

// POST /api/webhooks/stripe - Handle Stripe webhook events
export async function POST(request: NextRequest) {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
        return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    let event: Stripe.Event

    try {
        const stripe = getStripe()
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (error: any) {
        console.error('Stripe webhook signature verification failed:', error.message)
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.payment_status === 'paid') {
            await handleSuccessfulPayment({
                paymentId: session.id,
                paymentMethod: 'stripe',
                userId: session.metadata?.userId!,
                leadIds: JSON.parse(session.metadata?.leadIds || '[]'),
                prices: JSON.parse(session.metadata?.prices || '[]'),
                subtotal: parseFloat(session.metadata?.subtotal || '0'),
                discount: parseFloat(session.metadata?.discount || '0'),
                taxAmount: parseFloat(session.metadata?.taxAmount || '0'),
                total: parseFloat(session.metadata?.total || '0'),
                isSingleItem: session.metadata?.isSingleItem === 'true',
            })
        }
    }

    return NextResponse.json({ received: true })
}

async function handleSuccessfulPayment(data: {
    paymentId: string
    paymentMethod: 'stripe' | 'paypal'
    userId: string
    leadIds: string[]
    prices: number[]
    subtotal: number
    discount: number
    taxAmount: number
    total: number
    isSingleItem: boolean
}) {
    try {
        // IDEMPOTENCY CHECK: Prevent duplicate orders if webhook fires twice
        const existingOrder = await db.getOrderByPaymentId(data.paymentId)
        if (existingOrder) {
            console.log(`⚠️ Order for paymentId ${data.paymentId} already exists (${existingOrder.id}). Skipping duplicate.`)
            return
        }

        // Create order in database
        const orderId = await db.createOrder({
            userId: data.userId,
            subtotal: data.subtotal,
            discount: data.discount,
            taxRate: 19,
            taxAmount: data.taxAmount,
            total: data.total,
            paymentMethod: data.paymentMethod,
            paymentId: data.paymentId,
        })

        // Add order items
        for (let i = 0; i < data.leadIds.length; i++) {
            await db.addOrderItem(orderId, data.leadIds[i], data.prices[i])
        }

        // Generate invoice number
        const invoiceNumber = await db.getNextInvoiceNumber()

        // Complete order
        await db.completeOrder(orderId, invoiceNumber)

        // Add leads to purchased leads & update lead status
        for (let i = 0; i < data.leadIds.length; i++) {
            await db.purchaseLead(data.userId, data.leadIds[i])
            await db.updateLeadSalesCount(data.leadIds[i])
        }

        // Link purchased leads to order
        await db.linkPurchasedLeadsToOrder(data.userId, data.leadIds, orderId, data.prices)

        // Clear cart (always clear purchased leads from cart)
        for (const leadId of data.leadIds) {
            await db.removeFromCart(data.userId, leadId)
        }
        if (!data.isSingleItem) {
            await db.clearCart(data.userId)
        }

        console.log(`✅ Order ${orderId} completed. Invoice: ${invoiceNumber}`)
    } catch (error) {
        console.error('Error processing payment:', error)
        throw error
    }
}

// Export for use by PayPal capture route
export { handleSuccessfulPayment }
