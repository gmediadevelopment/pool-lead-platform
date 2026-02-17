import { db } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"

export default async function ManageLeadsPage() {
    try {
        const leads = await db.findVerifiedLeads()

        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Leads verwalten</h1>
                    <p className="text-muted-foreground">Alle freigegebenen Leads bearbeiten, löschen oder zurückziehen.</p>
                </div>

                {leads.length === 0 ? (
                    <Card>
                        <CardContent className="p-6 text-center text-muted-foreground">
                            Keine freigegebenen Leads vorhanden.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        <p>Anzahl Leads: {leads.length}</p>
                        <pre className="bg-gray-100 p-4 rounded overflow-auto">
                            {JSON.stringify(leads[0], null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        )
    } catch (error) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-red-600">Fehler beim Laden</h1>
                <Card>
                    <CardContent className="p-6">
                        <pre className="text-sm text-red-600">
                            {error instanceof Error ? error.message : String(error)}
                        </pre>
                    </CardContent>
                </Card>
            </div>
        )
    }
}
