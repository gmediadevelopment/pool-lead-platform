import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Webhook endpoint for WordPress PoolbauVergleich Planer plugin
// Secured with WEBHOOK_SECRET environment variable

export async function POST(request: NextRequest) {
    try {
        // Verify webhook secret
        const webhookSecret = process.env.WEBHOOK_SECRET
        const authHeader = request.headers.get('x-webhook-secret')

        if (webhookSecret && authHeader !== webhookSecret) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()

        // Extract fields from WordPress plugin payload
        const {
            firstName,
            lastName,
            email,
            phone,
            zip,
            poolType,
            installation,
            dimensions,
            extras,
            priceEstimate,
            timeframe,
            budgetConfirmed,
            status: leadStatus,
        } = body

        // Validate required fields
        if (!firstName || !lastName || !email || !zip) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields: firstName, lastName, email, zip' },
                { status: 400 }
            )
        }

        // Parse price estimate (format: "12000€ - 15000€")
        let estimatedPriceMin: number | undefined
        let estimatedPriceMax: number | undefined
        let estimatedPrice: number | undefined

        if (priceEstimate) {
            const matches = priceEstimate.match(/(\d+)/g)
            if (matches && matches.length >= 2) {
                estimatedPriceMin = parseInt(matches[0])
                estimatedPriceMax = parseInt(matches[1])
                estimatedPrice = Math.round((estimatedPriceMin + estimatedPriceMax) / 2)
            }
        }

        // Map status from WordPress to our system
        const statusMap: Record<string, string> = {
            'Interessent (Nur Berechnung)': 'pending',
            'Beratung angefragt': 'pending',
        }
        const mappedStatus = statusMap[leadStatus] || 'pending'

        // Create lead in database
        const lead = await db.createLeadFromWebhook({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim().toLowerCase(),
            phone: phone?.trim() || '',
            zip: zip.trim(),
            city: '', // Will be enriched later if needed
            poolType: poolType || 'Unbekannt',
            installation: installation || '',
            dimensions: dimensions || '',
            features: extras || '',
            estimatedPrice,
            estimatedPriceMin,
            estimatedPriceMax,
            timeline: timeframe || '',
            budgetConfirmed: budgetConfirmed === 'yes',
            status: mappedStatus,
            source: 'wordpress_planer',
        })

        return NextResponse.json({
            success: true,
            leadId: lead.id,
            message: 'Lead successfully created',
        })
    } catch (error) {
        console.error('Webhook error:', error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Internal server error',
            },
            { status: 500 }
        )
    }
}

// Allow GET for health check
export async function GET() {
    return NextResponse.json({
        status: 'ok',
        endpoint: '/api/leads/webhook',
        method: 'POST',
        description: 'WordPress PoolbauVergleich Planer webhook receiver',
    })
}
