import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Webhook endpoint for WordPress PoolbauVergleich Planer plugin
// Two events from WordPress:
//   1. status = 'Interessent (Nur Berechnung)' → Create new lead (NEW)
//   2. status = 'Beratung angefragt'           → Update existing lead by email (CONSULTATION_REQUESTED)

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

        const normalizedEmail = email.trim().toLowerCase()

        // Parse price estimate (format: "12.000€ - 15.000€" or "12000€ - 15000€")
        let estimatedPriceMin: number | undefined
        let estimatedPriceMax: number | undefined
        let estimatedPrice: number | undefined

        if (priceEstimate) {
            const matches = priceEstimate.replace(/\./g, '').match(/(\d+)/g)
            if (matches && matches.length >= 2) {
                estimatedPriceMin = parseInt(matches[0])
                estimatedPriceMax = parseInt(matches[1])
                estimatedPrice = Math.round((estimatedPriceMin + estimatedPriceMax) / 2)
            }
        }

        const isConsultationRequest = leadStatus === 'Beratung angefragt'

        if (isConsultationRequest) {
            // Try to find existing lead by email and update it
            const existingLead = await db.findLeadByEmail(normalizedEmail)

            if (existingLead) {
                // Update existing lead: mark as consultation requested
                await db.updateLeadStatus(existingLead.id, 'CONSULTATION_REQUESTED', {
                    timeline: timeframe || existingLead.timeline,
                    budgetConfirmed: budgetConfirmed === 'yes',
                })

                return NextResponse.json({
                    success: true,
                    leadId: existingLead.id,
                    action: 'updated',
                    message: 'Lead updated to consultation requested',
                })
            }
            // If no existing lead found, fall through and create new one
        }

        // Calculate lead price based on estimated budget
        const leadPrice = estimatedPriceMin
            ? Math.round(estimatedPriceMin * 0.01) // 1% of min estimate
            : 49 // default price

        // Create new lead
        const lead = await db.createLeadFromWebhook({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: normalizedEmail,
            phone: phone?.trim() || '',
            zip: zip.trim(),
            city: '',
            poolType: poolType || 'Unbekannt',
            installation: installation || '',
            dimensions: dimensions || '',
            features: extras || '',
            estimatedPrice,
            estimatedPriceMin,
            estimatedPriceMax,
            timeline: timeframe || '',
            budgetConfirmed: budgetConfirmed === 'yes',
            // If consultation was requested directly (no prior lead), mark accordingly
            status: isConsultationRequest ? 'CONSULTATION_REQUESTED' : 'NEW',
            source: 'wordpress_planer',
        })

        return NextResponse.json({
            success: true,
            leadId: lead.id,
            action: 'created',
            message: isConsultationRequest ? 'Lead created with consultation request' : 'Lead created',
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

export async function GET() {
    return NextResponse.json({
        status: 'ok',
        endpoint: '/api/leads/webhook',
        method: 'POST',
        description: 'WordPress PoolbauVergleich Planer webhook receiver',
    })
}
