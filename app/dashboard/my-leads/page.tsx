import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Mail, User } from "lucide-react"

export default async function MyLeadsPage() {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return <div>Bitte einloggen.</div>
    }

    const myLeads = await prisma.lead.findMany({
        where: {
            buyers: {
                some: {
                    id: session.user.id,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Meine gekauften Leads</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {myLeads.length === 0 ? (
                    <p className="text-muted-foreground">Sie haben noch keine Leads gekauft.</p>
                ) : (
                    myLeads.map((lead) => (
                        <Card key={lead.id}>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <Badge variant="outline">Gekauft</Badge>
                                    <span className="text-sm text-muted-foreground">{new Date(lead.createdAt).toLocaleDateString()}</span>
                                </div>
                                <CardTitle className="mt-2">{lead.firstName} {lead.lastName}</CardTitle>
                                <div className="flex items-center text-muted-foreground text-sm gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {lead.zip} {lead.city}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">Kontakt</p>
                                        <div className="flex items-center text-sm text-muted-foreground gap-2">
                                            <Mail className="h-3 w-3" />
                                            <a href={`mailto:${lead.email}`} className="hover:underline">{lead.email}</a>
                                        </div>
                                        <div className="flex items-center text-sm text-muted-foreground gap-2">
                                            <Phone className="h-3 w-3" />
                                            <a href={`tel:${lead.phone}`} className="hover:underline">{lead.phone || "N/A"}</a>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">Projektdaten</p>
                                        <p className="text-sm text-muted-foreground">Typ: {lead.poolType}</p>
                                        <p className="text-sm text-muted-foreground">Größe: {lead.dimensions}</p>
                                        <p className="text-sm text-muted-foreground">Budget: {Number(lead.estimatedPrice).toLocaleString()} €</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
