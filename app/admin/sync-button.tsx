'use client'

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useState } from "react"

export function SyncButton() {
    const [syncing, setSyncing] = useState(false)
    const [result, setResult] = useState<any>(null)

    async function handleSync() {
        setSyncing(true)
        setResult(null)

        try {
            const response = await fetch('/api/sync-leads', {
                method: 'POST',
            })
            const data = await response.json()
            setResult(data)
        } catch (error) {
            setResult({ success: false, error: 'Sync failed' })
        } finally {
            setSyncing(false)
        }
    }

    return (
        <div className="space-y-4">
            <Button
                onClick={handleSync}
                disabled={syncing}
                variant="outline"
                className="w-full sm:w-auto"
            >
                <RefreshCw className={`mr-2 h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Synchronisiere...' : 'Jetzt synchronisieren'}
            </Button>

            {result && (
                <div className={`p-4 rounded-lg ${result.success ? 'bg-green-50 text-green-900' : 'bg-red-50 text-red-900'}`}>
                    {result.success ? (
                        <div>
                            <p className="font-semibold">✅ Synchronisation erfolgreich!</p>
                            <ul className="mt-2 text-sm space-y-1">
                                <li>Gesamt: {result.summary.total}</li>
                                <li>Importiert: {result.summary.imported}</li>
                                <li>Übersprungen: {result.summary.skipped}</li>
                                {result.summary.errors > 0 && <li>Fehler: {result.summary.errors}</li>}
                            </ul>
                            {result.errors && result.errors.length > 0 && (
                                <div className="mt-3 border-t border-green-200 pt-3">
                                    <p className="font-semibold text-sm">Fehler-Details:</p>
                                    <ul className="mt-1 text-xs space-y-1 max-h-40 overflow-y-auto">
                                        {result.errors.map((error: string, i: number) => (
                                            <li key={i} className="text-red-700">• {error}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p>❌ Fehler: {result.error}</p>
                    )}
                </div>
            )}
        </div>
    )
}
