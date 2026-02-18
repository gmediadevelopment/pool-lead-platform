import { NextResponse } from 'next/server'

// Google Sheets sync has been replaced by direct WordPress webhook integration.
// Leads now arrive via POST /api/leads/webhook from the WordPress plugin.
// This endpoint is kept for backwards compatibility but returns a deprecation notice.

export async function POST() {
    return NextResponse.json({
        success: false,
        deprecated: true,
        message: 'Google Sheets sync is no longer used. Leads are now received directly via the WordPress webhook at /api/leads/webhook.',
    }, { status: 410 })
}

export async function GET() {
    return NextResponse.json({
        deprecated: true,
        message: 'This endpoint is deprecated. Use POST /api/leads/webhook instead.',
        newEndpoint: '/api/leads/webhook',
    })
}
