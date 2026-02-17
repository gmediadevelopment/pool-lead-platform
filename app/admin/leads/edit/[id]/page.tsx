import { db } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default async function EditLeadPage({ params }: { params: { id: string } }) {
    const leads = await db.findVerifiedLeads()
    const lead = leads.find(l => l.id === params.id)

    if (!lead) {
        notFound()
    }

    async function handleUpdate(formData: FormData) {
        'use server'

        const data = {
            firstName: formData.get('firstName') as string,
            lastName: formData.get('lastName') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string || undefined,
            zip: formData.get('zip') as string,
            city: formData.get('city') as string,
            poolType: formData.get('poolType') as string,
            dimensions: formData.get('dimensions') as string,
            features: formData.get('features') as string || undefined,
            estimatedPriceMin: formData.get('estimatedPriceMin') ? parseFloat(formData.get('estimatedPriceMin') as string) : undefined,
            estimatedPriceMax: formData.get('estimatedPriceMax') ? parseFloat(formData.get('estimatedPriceMax') as string) : undefined,
            timeline: formData.get('timeline') as string || undefined,
            budgetConfirmed: formData.get('budgetConfirmed') === 'true',
            price: parseFloat(formData.get('price') as string),
        }

        await db.updateLead(params.id, data)
        redirect('/admin/leads')
    }

    return (
        <div className="max-w-4xl">
            <Card>
                <CardHeader>
                    <CardTitle>Lead bearbeiten</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={handleUpdate} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">Vorname</Label>
                                <Input id="firstName" name="firstName" defaultValue={lead.firstName} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Nachname</Label>
                                <Input id="lastName" name="lastName" defaultValue={lead.lastName} required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">E-Mail</Label>
                                <Input id="email" name="email" type="email" defaultValue={lead.email} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Telefon</Label>
                                <Input id="phone" name="phone" defaultValue={lead.phone || ''} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="zip">PLZ</Label>
                                <Input id="zip" name="zip" defaultValue={lead.zip} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="city">Stadt</Label>
                                <Input id="city" name="city" defaultValue={lead.city} required />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="poolType">Pool-Typ</Label>
                            <Input id="poolType" name="poolType" defaultValue={lead.poolType} required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="dimensions">Maße</Label>
                            <Input id="dimensions" name="dimensions" defaultValue={lead.dimensions} required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="features">Extras</Label>
                            <Input id="features" name="features" defaultValue={lead.features || ''} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="estimatedPriceMin">Budget Min (€)</Label>
                                <Input
                                    id="estimatedPriceMin"
                                    name="estimatedPriceMin"
                                    type="number"
                                    step="0.01"
                                    defaultValue={lead.estimatedPriceMin || ''}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="estimatedPriceMax">Budget Max (€)</Label>
                                <Input
                                    id="estimatedPriceMax"
                                    name="estimatedPriceMax"
                                    type="number"
                                    step="0.01"
                                    defaultValue={lead.estimatedPriceMax || ''}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="timeline">Bauzeitraum</Label>
                                <Input id="timeline" name="timeline" defaultValue={lead.timeline || ''} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="budgetConfirmed">Budget bestätigt</Label>
                                <select
                                    id="budgetConfirmed"
                                    name="budgetConfirmed"
                                    defaultValue={lead.budgetConfirmed ? 'true' : 'false'}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="false">Nein</option>
                                    <option value="true">Ja</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="price">Lead-Preis (€)</Label>
                            <select
                                id="price"
                                name="price"
                                defaultValue={lead.price?.toString() || '49'}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="49">49€ (Konfigurator)</option>
                                <option value="99">99€ (Beratung)</option>
                            </select>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Link href="/admin/leads">
                                <Button type="button" variant="outline">
                                    Abbrechen
                                </Button>
                            </Link>
                            <Button type="submit">Speichern</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
