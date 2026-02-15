import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

export default async function ProfilePage() {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
        return <div>Bitte einloggen.</div>
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
    })

    if (!user) return <div>Nutzer nicht gefunden.</div>

    return (
        <div className="space-y-6 max-w-2xl">
            <h1 className="text-3xl font-bold">Mein Profil</h1>
            <p className="text-muted-foreground">Verwalten Sie hier Ihre Firmendaten.</p>

            <Card>
                <CardHeader>
                    <CardTitle>Stammdaten</CardTitle>
                    <CardDescription>Ihre Account-Informationen.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Firmenname</Label>
                        <Input value={user.companyName || ""} readOnly />
                    </div>
                    <div className="grid gap-2">
                        <Label>Email</Label>
                        <Input value={user.email} readOnly />
                    </div>
                    <div className="grid gap-2">
                        <Label>Rolle</Label>
                        <Input value={user.role} readOnly />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Kontakt & Einstellungen</CardTitle>
                    <CardDescription>Diese Daten werden (optional) verwendet.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Telefon</Label>
                        <Input value={user.phone || ""} placeholder="Nicht hinterlegt" readOnly />
                    </div>
                    <div className="grid gap-2">
                        <Label>Adresse</Label>
                        <Input value={user.address || ""} placeholder="Nicht hinterlegt" readOnly />
                    </div>

                    <Separator className="my-4" />
                    <p className="text-sm text-muted-foreground">
                        Änderungen bitte beim Support anfragen.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
