import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
    try {
        const isConnected = await db.testConnection()

        if (isConnected) {
            return NextResponse.json({
                message: 'Database connection successful (using mysql2 directly)',
                status: 'connected'
            })
        } else {
            return NextResponse.json({
                message: 'Database connection failed',
                status: 'disconnected'
            }, { status: 500 })
        }
    } catch (error: any) {
        return NextResponse.json({
            message: 'Database test error',
            error: error.message
        }, { status: 500 })
    }
}
