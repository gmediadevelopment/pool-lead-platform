'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface RemoveFromCartButtonProps {
    leadId: string
}

export function RemoveFromCartButton({ leadId }: RemoveFromCartButtonProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    async function handleRemove() {
        setLoading(true)
        try {
            const res = await fetch('/api/cart/remove', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadId }),
            })

            if (res.ok) {
                window.dispatchEvent(new Event('cart-updated'))
                router.refresh()
            } else {
                alert('Fehler beim Entfernen')
            }
        } catch (error) {
            alert('Netzwerkfehler. Bitte versuche es erneut.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            disabled={loading}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
        >
            {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Trash2 className="h-4 w-4" />
            )}
        </Button>
    )
}
