import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    try {
        // Verify cron secret
        const authHeader = request.headers.get('authorization')
        const cronSecret = process.env.CRON_SECRET

        if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Call sync endpoint
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
        const response = await fetch(`${baseUrl}/api/sync-leads`, {
            method: 'POST',
        })

        const data = await response.json()

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            syncResult: data,
        })
    } catch (error) {
        console.error('Cron sync failed:', error)
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        )
    }
}
