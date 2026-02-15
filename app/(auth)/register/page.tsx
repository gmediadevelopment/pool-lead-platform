"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function RegisterPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)

        const formData = new FormData(event.currentTarget)
        const email = formData.get("email") as string
        const password = formData.get("password") as string
        const companyName = formData.get("companyName") as string

        try {
            const response = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, companyName }),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || "Registrierung fehlgeschlagen")
            }

            toast.success("Registrierung erfolgreich! Bitte loggen Sie sich ein.")
            router.push("/login")
        } catch (error: any) {
            toast.error(error.message || "Ein Fehler ist aufgetreten.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle className="text-2xl">Registrierung</CardTitle>
                <CardDescription>
                    Erstellen Sie ein Konto für Ihre Poolbaufirma.
                </CardDescription>
            </CardHeader>
            <form onSubmit={onSubmit}>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="companyName">Firmenname</Label>
                        <Input id="companyName" name="companyName" type="text" placeholder="Muster Poolbau GmbH" required disabled={isLoading} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">E-Mail</Label>
                        <Input id="email" name="email" type="email" placeholder="kontakt@firma.de" required disabled={isLoading} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Passwort</Label>
                        <Input id="password" name="password" type="password" required disabled={isLoading} />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button className="w-full" type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Konto erstellen
                    </Button>
                    <div className="text-center text-sm">
                        Bereits registriert?{" "}
                        <Link href="/login" className="underline">
                            Anmelden
                        </Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    )
}
