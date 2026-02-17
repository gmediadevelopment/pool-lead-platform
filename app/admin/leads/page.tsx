import { db } from "@/lib/db"

export default async function ManageLeadsPage() {
    try {
        const leads = await db.findVerifiedLeads()

        return (
            <div className="p-8">
                <h1 className="text-3xl font-bold">Leads verwalten</h1>
                <p className="mt-4">Anzahl gefundener Leads: {leads.length}</p>
                {leads.length > 0 && (
                    <div className="mt-4">
                        <p>Erster Lead: {leads[0].firstName} {leads[0].lastName}</p>
                    </div>
                )}
            </div>
        )
    } catch (error) {
        return (
            <div className="p-8">
                <h1 className="text-3xl font-bold text-red-600">Fehler</h1>
                <pre className="mt-4 text-sm bg-red-50 p-4 rounded">
                    {error instanceof Error ? error.message : String(error)}
                </pre>
            </div>
        )
    }
}
