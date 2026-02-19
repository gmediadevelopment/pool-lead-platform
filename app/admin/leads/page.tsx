import { db } from "@/lib/db"
import { AdminLeadsManager } from "./admin-leads-manager"

export default async function ManageLeadsPage() {
    const leads = await db.findVerifiedLeads()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Leads verwalten</h1>
                <p className="text-muted-foreground">Alle freigegebenen Leads filtern, zurückziehen oder löschen.</p>
            </div>

            <AdminLeadsManager leads={leads as any} />
        </div>
    )
}
