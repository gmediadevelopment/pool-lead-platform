'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pencil } from "lucide-react"
import { updateLeadAction } from "./actions"
import type { Lead } from "@/lib/db"

export function EditLeadDialog({ lead }: { lead: Lead }) {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Pencil className="h-4 w-4 mr-1" />
                    Bearbeiten
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Lead bearbeiten</DialogTitle>
                    <DialogDescription>
                        Ändern Sie die Lead-Daten und speichern Sie die Änderungen.
                    </DialogDescription>
                </DialogHeader>
                <form action={async (formData: FormData) => {
                    await updateLeadAction(lead.id, formData)
                    setOpen(false)
                }}>
                    <div className="grid gap-4 py-4">
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
                                defaultValue={lead.price.toString()}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="49">49€ (Konfigurator)</option>
                                <option value="99">99€ (Beratung)</option>
                            </select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Abbrechen
                        </Button>
                        <Button type="submit">Speichern</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
