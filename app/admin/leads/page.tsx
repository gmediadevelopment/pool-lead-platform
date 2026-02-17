import { db } from "@/lib/db"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, ArrowLeft } from "lucide-react"
import { deleteLeadAction, unpublishLeadAction } from "./actions"

export default async function ManageLeadsPage() {
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
                <div className="grid gap-4">
                    {leads.map((lead) => (
                        <Card key={lead.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle>{lead.firstName} {lead.lastName}</CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {lead.zip} {lead.city}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Badge variant="outline">{lead.poolType}</Badge>
                                        <Badge className={lead.price === 99 ? "bg-purple-600" : "bg-blue-600"}>
                                            {lead.price ? lead.price.toFixed(0) : '0'}€
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                                    <div>
                                        <p className="font-semibold">Kontakt</p>
                                        <p>{lead.email}</p>
                                        <p>{lead.phone || "Kein Telefon"}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold">Details</p>
                                        <p>{lead.dimensions}</p>
                                        <p>{lead.features || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="font-semibold">Budget</p>
                                        {lead.estimatedPriceMin && lead.estimatedPriceMax ? (
                                            lead.estimatedPriceMin === lead.estimatedPriceMax ? (
                                                <p>{lead.estimatedPriceMin.toLocaleString()} €</p>
                                            ) : (
                                                <p>{lead.estimatedPriceMin.toLocaleString()} € - {lead.estimatedPriceMax.toLocaleString()} €</p>
                                            )
                                        ) : (
                                            <p>Keine Angabe</p>
                                        )}
                                    </div>
                                    {(lead.timeline || lead.budgetConfirmed) && (
                                        <div>
                                            <p className="font-semibold">Beratung</p>
                                            {lead.timeline && <p>Bauzeitraum: {lead.timeline}</p>}
                                            {lead.budgetConfirmed && <p className="text-green-600">✓ Budget bestätigt</p>}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end gap-2 pt-4 border-t">
                                    <Link href={`/admin/leads/${lead.id}/edit`}>
                                        <Button variant="outline" size="sm">
                                            <Pencil className="h-4 w-4 mr-1" />
                                            Bearbeiten
                                        </Button>
                                    </Link>

                                    <form action={unpublishLeadAction.bind(null, lead.id)}>
                                        <Button variant="outline" size="sm" type="submit">
                                            <ArrowLeft className="h-4 w-4 mr-1" />
                                            Zurückziehen
                                        </Button>
                                    </form>

                                    <form action={deleteLeadAction.bind(null, lead.id)}>
                                        <Button variant="destructive" size="sm" type="submit">
                                            <Trash2 className="h-4 w-4 mr-1" />
                                            Löschen
                                        </Button>
                                    </form>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
