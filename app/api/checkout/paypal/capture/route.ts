import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'

// GET /api/checkout/paypal/capture - Capture PayPal payment after approval
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token') // PayPal order ID
    const payerId = searchParams.get('PayerID')

    if (!token || !payerId) {
        return NextResponse.redirect(
            new URL('/dashboard/checkout/cancel', request.url)
        )
    }

    try {
        // Get PayPal access token
        const tokenResponse = await fetch(
            `${process.env.PAYPAL_MODE === 'live'
                ? 'https://api-m.paypal.com'
                : 'https://api-m.sandbox.paypal.com'}/v1/oauth2/token`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${Buffer.from(
                        `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
                    ).toString('base64')}`,
                },
                body: 'grant_type=client_credentials',
            }
        )

        const tokenData = await tokenResponse.json()
        const baseUrl = process.env.PAYPAL_MODE === 'live'
            ? 'https://api-m.paypal.com'
            : 'https://api-m.sandbox.paypal.com'

        // Capture the payment
        const captureResponse = await fetch(
            `${baseUrl}/v2/checkout/orders/${token}/capture`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${tokenData.access_token}`,
                },
            }
        )

        const captureData = await captureResponse.json()

        if (captureData.status !== 'COMPLETED') {
            console.error('PayPal capture failed:', captureData)
            return NextResponse.redirect(
                new URL('/dashboard/checkout/cancel', request.url)
            )
        }

        // Extract metadata from custom_id
        const customId = captureData.purchase_units?.[0]?.custom_id
        if (!customId) {
            throw new Error('No custom_id in PayPal response')
        }

        const metadata = JSON.parse(customId)
        const { userId, leadIds, prices, isSingleItem } = metadata

        // Calculate totals
        const subtotal = prices.reduce((sum: number, p: number) => sum + p, 0)
        const discountRate = leadIds.length >= 5 ? 0.05 : 0
        const discountAmount = subtotal * discountRate
        const subtotalAfterDiscount = subtotal - discountAmount
        const taxAmount = subtotalAfterDiscount * 0.19
        const total = subtotalAfterDiscount + taxAmount

        // Create order in database
        const orderId = await db.createOrder({
            userId,
            subtotal,
            discount: discountAmount,
            taxRate: 19,
            taxAmount,
            total,
            paymentMethod: 'paypal',
            paymentId: token,
        })

        // Add order items
        for (let i = 0; i < leadIds.length; i++) {
            await db.addOrderItem(orderId, leadIds[i], prices[i])
        }

        // Generate invoice number and complete order
        const invoiceNumber = await db.getNextInvoiceNumber()
        await db.completeOrder(orderId, invoiceNumber)

        // Add leads to purchased leads
        for (const leadId of leadIds) {
            await db.purchaseLead(userId, leadId)
        }

        // Link purchased leads to order
        await db.linkPurchasedLeadsToOrder(userId, leadIds, orderId, prices)

        // Clear cart
        if (!isSingleItem) {
            await db.clearCart(userId)
        } else {
            for (const leadId of leadIds) {
                await db.removeFromCart(userId, leadId)
            }
        }

        // Redirect to success page
        return NextResponse.redirect(
            new URL(`/dashboard/checkout/success?orderId=${orderId}`, request.url)
        )
    } catch (error: any) {
        console.error('PayPal capture error:', error)
        return NextResponse.redirect(
            new URL('/dashboard/checkout/cancel', request.url)
        )
    }
}
