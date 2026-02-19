import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * ONE-TIME migration endpoint to fix lead types in the database.
 *
 * Old webhook saved all leads as type='POOL' (invalid).
 * New webhook saves type='INTEREST' (49€) or type='CONSULTATION' (99€).
 *
 * Logic:
 *  - type='POOL' AND has consultation data (budgetConfirmed OR timeline) → CONSULTATION + 99€
 *  - type='POOL' AND no consultation data → INTEREST + 49€
 *  - type='CONSULTATION' → price = 99€ (fix price)
 *  - type='INTEREST'     → price = 49€ (fix price)
 */
export async function POST(req: NextRequest) {
    const secret = req.headers.get('x-webhook-secret')
    if (secret !== process.env.WEBHOOK_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const results = await db.migrateLeadTypes()
    return NextResponse.json({ success: true, message: 'Migration complete', results })
}
