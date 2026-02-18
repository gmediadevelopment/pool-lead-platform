import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

const TAX_RATE = 0.19

function calculatePricing(items: { leadId: string; price: number }[]) {
    const subtotal = items.reduce((sum, item) => sum + item.price, 0)
    const discountRate = items.length >= 5 ? 0.05 : 0
    const discountAmount = subtotal * discountRate
    const subtotalAfterDiscount = subtotal - discountAmount
    const taxAmount = subtotalAfterDiscount * TAX_RATE
    const total = subtotalAfterDiscount + taxAmount
    return { subtotal, discountRate, discountAmount, subtotalAfterDiscount, taxAmount, total }
}

// POST /api/checkout/paypal - Create PayPal Order
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

        // Validate items
        const purchasedLeads = await db.getPurchasedLeads(session.user.id)
        const purchasedIds = purchasedLeads.map((l: any) => l.id)

        for (const item of items) {
            if (purchasedIds.includes(item.leadId)) {
                return NextResponse.json({
                    error: `Lead ${item.leadId} wurde bereits gekauft`
                }, { status: 409 })
            }
        }

        const { subtotal, discountAmount, subtotalAfterDiscount, taxAmount, total } = calculatePricing(items)

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

        if (!tokenData.access_token) {
            throw new Error('Failed to get PayPal access token')
        }

        const baseUrl = process.env.PAYPAL_MODE === 'live'
            ? 'https://api-m.paypal.com'
            : 'https://api-m.sandbox.paypal.com'

        // Create PayPal order
        const orderResponse = await fetch(`${baseUrl}/v2/checkout/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenData.access_token}`,
            },
            body: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [{
                    amount: {
                        currency_code: 'EUR',
                        value: total.toFixed(2),
                        breakdown: {
                            item_total: {
                                currency_code: 'EUR',
                                value: subtotalAfterDiscount.toFixed(2),
                            },
                            tax_total: {
                                currency_code: 'EUR',
                                value: taxAmount.toFixed(2),
                            },
                        },
                    },
                    items: items.map((item: any) => ({
                        name: `Pool Lead`,
                        description: `Lead ID: ${item.leadId}`,
                        quantity: '1',
                        unit_amount: {
                            currency_code: 'EUR',
                            value: item.price.toFixed(2),
                        },
                        category: 'DIGITAL_GOODS',
                    })),
                    custom_id: JSON.stringify({
                        userId: session.user.id,
                        leadIds: items.map((i: any) => i.leadId),
                        prices: items.map((i: any) => i.price),
                        isSingleItem,
                    }),
                }],
                application_context: {
                    return_url: `${process.env.NEXTAUTH_URL}/api/checkout/paypal/capture`,
                    cancel_url: `${process.env.NEXTAUTH_URL}/dashboard/checkout/cancel`,
                    brand_name: 'Poolbau Vergleich',
                    locale: 'de-DE',
                    landing_page: 'BILLING',
                    user_action: 'PAY_NOW',
                },
            }),
        })

        const orderData = await orderResponse.json()

        if (orderData.status !== 'CREATED') {
            throw new Error(`PayPal order creation failed: ${JSON.stringify(orderData)}`)
        }

        // Find approval URL
        const approvalUrl = orderData.links?.find((link: any) => link.rel === 'approve')?.href

        if (!approvalUrl) {
            throw new Error('No PayPal approval URL found')
        }

        return NextResponse.json({ approvalUrl, orderId: orderData.id })
    } catch (error: any) {
        console.error('PayPal checkout error:', error)
        return NextResponse.json({
            error: error.message || 'Failed to create PayPal order'
        }, { status: 500 })
    }
}
