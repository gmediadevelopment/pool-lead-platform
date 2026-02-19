import { NextRequest, NextResponse } from 'next/server'
import { getPool } from '@/lib/db'

/**
 * ONE-TIME migration endpoint to fix lead types in the database.
 *
 * Old webhook saved all leads as type='POOL' (invalid).
 * New webhook saves type='INTEREST' (49€) or type='CONSULTATION' (99€).
 *
 * Logic:
 *  - type='POOL' AND has consultation data (budgetConfirmed OR timeline) → CONSULTATION + 99€
 *  - type='POOL' AND no consultation data → INTEREST + 49€
 *  - type='CONSULTATION' → price = 99€ (already correct type, fix price)
 *  - type='INTEREST' → price = 49€ (already correct type, fix price)
 */
export async function POST(req: NextRequest) {
    const secret = req.headers.get('x-webhook-secret')
    if (secret !== process.env.WEBHOOK_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const pool = getPool()

    // Step 1: 'POOL' type with consultation data → CONSULTATION + 99€
    const [r1] = await pool.execute(
        `UPDATE \`Lead\`
         SET type = 'CONSULTATION', price = 99.00, updatedAt = NOW()
         WHERE type = 'POOL'
           AND (budgetConfirmed = 1 OR (timeline IS NOT NULL AND timeline != ''))`
    ) as any[]

    // Step 2: Remaining 'POOL' type (no consultation data) → INTEREST + 49€
    const [r2] = await pool.execute(
        `UPDATE \`Lead\`
         SET type = 'INTEREST', price = 49.00, updatedAt = NOW()
         WHERE type = 'POOL'`
    ) as any[]

    // Step 3: Fix price for all CONSULTATION leads (ensure 99€)
    const [r3] = await pool.execute(
        `UPDATE \`Lead\`
         SET price = 99.00, updatedAt = NOW()
         WHERE type = 'CONSULTATION' AND price != 99.00`
    ) as any[]

    // Step 4: Fix price for all INTEREST leads (ensure 49€)
    const [r4] = await pool.execute(
        `UPDATE \`Lead\`
         SET price = 49.00, updatedAt = NOW()
         WHERE type = 'INTEREST' AND price != 49.00`
    ) as any[]

    return NextResponse.json({
        success: true,
        message: 'Migration complete',
        results: {
            'POOL→CONSULTATION (had budget/timeline)': r1.affectedRows,
            'POOL→INTEREST (no consultation data)': r2.affectedRows,
            'CONSULTATION price fixed to 99€': r3.affectedRows,
            'INTEREST price fixed to 49€': r4.affectedRows,
        }
    })
}
