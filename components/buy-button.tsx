"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export function BuyButton({ leadId, price }: { leadId: string, price: number }) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleBuy() {
        if (!confirm(`Lead für ${price.toFixed(2)} € kaufen?`)) return

        setLoading(true)
        try {
            const res = await fetch(`/api/leads/${leadId}/purchase`, {
                method: "POST",
            })

            if (!res.ok) {
                const error = await res.json()
                throw new Error(error.message || "Kauf fehlgeschlagen")
            }

            toast.success("Lead erfolgreich gekauft!")
            router.refresh()
            router.push("/dashboard/my-leads")
        } catch (error: any) {
            toast.error(error.message || "Fehler beim Kauf")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button className="w-full" onClick={handleBuy} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lead kaufen ({price.toFixed(2)} €)
        </Button>
    )
}
