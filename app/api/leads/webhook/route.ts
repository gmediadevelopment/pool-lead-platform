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
                // IMPORTANT: Keep the existing status!
                // CONSULTATION_REQUESTED is NOT a valid LeadStatus enum value in MySQL.
                // We only upgrade the type to CONSULTATION and update consultation fields.
                // - If status is NEW → stays NEW (admin can approve it from the queue)
                // - If status is PUBLISHED → stays PUBLISHED (marketplace stays live)
                await db.updateLeadConsultation(existingLead.id, existingLead.status, {
                    timeline: timeframe || existingLead.timeline,
                    // Plugin v2.6+ sends full German string, old format was 'yes'
                    budgetConfirmed: budgetConfirmed === 'yes' || budgetConfirmed === 'Ja, Budget ist vorhanden',
                })

                return NextResponse.json({
                    success: true,
                    leadId: existingLead.id,
                    action: 'updated',
                    message: `Lead upgraded to CONSULTATION type, status kept as ${existingLead.status}`,
                })
            }
            // If no existing lead found, fall through and create new one as CONSULTATION
        }

        // Lead type is determined ONLY by the WordPress status field
        // Price is set inside createLeadFromWebhook based on type: INTEREST=49€, CONSULTATION=99€
        const leadType = isConsultationRequest ? 'CONSULTATION' : 'INTEREST'

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
            // Plugin v2.6+ sends full German string, old format was 'yes'
            budgetConfirmed: budgetConfirmed === 'yes' || budgetConfirmed === 'Ja, Budget ist vorhanden',
            source: 'wordpress_planer',
            type: leadType,
            status: 'NEW',
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
