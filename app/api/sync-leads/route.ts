import { NextResponse } from 'next/server'
import { getSheetData } from '@/lib/google-sheets'
import { db } from '@/lib/db'

export async function POST() {
    try {
        // Fetch leads from Google Sheet
        const sheetLeads = await getSheetData()

        let imported = 0
        let skipped = 0
        let errors: string[] = []

        // Import each lead
        for (const lead of sheetLeads) {
            try {
                // Check if lead already exists
                const existing = await db.findLeadByExternalId(lead.externalId)

                if (existing) {
                    skipped++
                    continue
                }

                // Import lead
                await db.createLeadFromSheet(lead)
                imported++
            } catch (error) {
                errors.push(`${lead.externalId}: ${error instanceof Error ? error.message : 'Unknown error'}`)
            }
        }

        return NextResponse.json({
            success: true,
            summary: {
                total: sheetLeads.length,
                imported,
                skipped,
                errors: errors.length,
            },
            errors: errors.length > 0 ? errors : undefined,
        })
    } catch (error) {
        console.error('Sync failed:', error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        )
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Use POST to trigger sync',
        endpoint: '/api/sync-leads',
    })
}
