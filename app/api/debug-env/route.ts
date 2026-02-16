import { NextResponse } from 'next/server'
import os from 'os'
import fs from 'fs'
import path from 'path'

export async function GET() {
    try {
        const debugLogPath = path.join(process.cwd(), 'debug.log')
        let lastLogs = 'No debug.log found'

        if (fs.existsSync(debugLogPath)) {
            const logs = fs.readFileSync(debugLogPath, 'utf8')
            lastLogs = logs.split('\n').slice(-100).join('\n')
        }

        const systemInfo = {
            platform: os.platform(),
            release: os.release(),
            arch: os.arch(),
            cpus: os.cpus().length,
            totalMemory: Math.round(os.totalmem() / 1024 / 1024) + ' MB',
            freeMemory: Math.round(os.freemem() / 1024 / 1024) + ' MB',
            uptime: Math.round(os.uptime() / 60) + ' minutes',
            nodeVersion: process.version,
            env: {
                NODE_ENV: process.env.NODE_ENV,
                DATABASE_URL_PRESENT: !!process.env.DATABASE_URL,
                NEXTAUTH_URL: process.env.NEXTAUTH_URL,
                PORT: process.env.PORT,
                ALL_KEYS: Object.keys(process.env).filter(k => !k.includes('SECRET') && !k.includes('PASS'))
            },
            cwd: process.cwd(),
            files: fs.readdirSync(process.cwd()).filter(f => !f.startsWith('.')),
            lastLogs: lastLogs
        }

        return NextResponse.json(systemInfo)
    } catch (error: any) {
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 })
    }
}
