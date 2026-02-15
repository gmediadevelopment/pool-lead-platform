import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, MapPin } from "lucide-react"
import { verifyLead, rejectLead } from "./actions"

export default async function AdminDashboard() {
    const newLeads = await prisma.lead.findMany({
        where: {
            status: "NEW",
        },
        orderBy: {
            createdAt: "desc",
        },
    })

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Neue Leads prüfen</h1>
            <p className="text-muted-foreground">Folgende Leads warten auf Freigabe.</p>

            <div className="grid gap-6">
                {newLeads.length === 0 ? (
                    <Card>
                        <CardContent className="p-6 text-center text-muted-foreground">
                            Keine neuen Leads zur Prüfung.
                        </CardContent>
                    </Card>
                ) : (
                    newLeads.map((lead) => (
                        <Card key={lead.id}>
                            <CardHeader>
                                <div className="flex justify-between">
                                    <div>
                                        <CardTitle>{lead.firstName} {lead.lastName}</CardTitle>
                                        <CardDescription className="flex items-center mt-1">
                                            <MapPin className="h-3 w-3 mr-1" />
                                            {lead.zip} {lead.city}
                                        </CardDescription>
                                    </div>
                                    <Badge variant="outline">{lead.poolType}</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
                                        <p className="font-semibold">Budget & Zeit</p>
                                        <p>{Number(lead.estimatedPrice).toLocaleString()} € {lead.budgetConfirmed ? "(Bestätigt)" : ""}</p>
                                        <p>{lead.timeline}</p>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2 bg-muted/50 p-4">
                                <form action={rejectLead.bind(null, lead.id)}>
                                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                        <X className="h-4 w-4 mr-1" />
                                        Ablehnen
                                    </Button>
                                </form>
                                <form action={verifyLead.bind(null, lead.id)}>
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                        <Check className="h-4 w-4 mr-1" />
                                        Freigeben & Veröffentlichen
                                    </Button>
                                </form>
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
