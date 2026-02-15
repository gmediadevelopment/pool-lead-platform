"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)

        const formData = new FormData(event.currentTarget)
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            })

            if (result?.error) {
                toast.error("Anmeldung fehlgeschlagen. Bitte überprüfen Sie Ihre Daten.")
            } else {
                toast.success("Erfolgreich eingeloggt!")
                router.push("/dashboard") // Will allow middleware to redirect based on role later
                router.refresh()
            }
        } catch (error) {
            toast.error("Ein Fehler ist aufgetreten.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle className="text-2xl">Login</CardTitle>
                <CardDescription>
                    Geben Sie Ihre E-Mail-Adresse ein, um sich anzumelden.
                </CardDescription>
            </CardHeader>
            <form onSubmit={onSubmit}>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">E-Mail</Label>
                        <Input id="email" name="email" type="email" placeholder="m@example.com" required disabled={isLoading} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Passwort</Label>
                        <Input id="password" name="password" type="password" required disabled={isLoading} />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button className="w-full" type="submit" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Anmelden
                    </Button>
                    <div className="text-center text-sm">
                        Noch kein Konto?{" "}
                        <Link href="/register" className="underline">
                            Registrieren
                        </Link>
                    </div>
                </CardFooter>
            </form>
        </Card>
    )
}
