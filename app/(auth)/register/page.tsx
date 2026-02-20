"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2, Mail, Lock, Building2, Waves } from "lucide-react"
import { toast } from "sonner"

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

    const inputStyle = {
        width: '100%',
        padding: '10px 12px 10px 36px',
        border: '1.5px solid #e2e8f0',
        borderRadius: '10px',
        fontSize: '14px',
        color: '#0f172a',
        background: '#ffffff',
        outline: 'none',
        boxSizing: 'border-box' as const,
        transition: 'border-color 0.15s',
    }

    return (
        <div style={{
            width: '100%',
            maxWidth: '420px',
            background: 'white',
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
        }}>
            {/* Brand Header */}
            <div style={{
                background: 'linear-gradient(135deg, #1B1B2E 0%, #1e3a5f 60%, #1E88D9 100%)',
                padding: '32px 32px 28px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
            }}>
                <div style={{
                    position: 'absolute',
                    bottom: '-1px',
                    left: 0,
                    right: 0,
                    height: '20px',
                    background: 'white',
                    borderRadius: '50% 50% 0 0 / 20px 20px 0 0',
                }} />
                <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: 'rgba(255,255,255,0.12)',
                    marginBottom: '16px',
                    backdropFilter: 'blur(10px)',
                }}>
                    <Waves style={{ width: '28px', height: '28px', color: '#60afff' }} />
                </div>
                <h1 style={{
                    color: 'white',
                    fontSize: '22px',
                    fontWeight: 700,
                    margin: '0 0 4px',
                    letterSpacing: '-0.3px',
                }}>
                    Poolbau Marktplatz
                </h1>
                <p style={{
                    color: 'rgba(255,255,255,0.6)',
                    fontSize: '13px',
                    margin: 0,
                }}>
                    Qualifizierte Pool-Leads kaufen
                </p>
            </div>

            {/* Form */}
            <div style={{ padding: '28px 32px 32px' }}>
                <h2 style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: '#0f172a',
                    margin: '0 0 6px',
                }}>
                    Konto erstellen
                </h2>
                <p style={{
                    fontSize: '13px',
                    color: '#64748b',
                    margin: '0 0 24px',
                }}>
                    Registrieren Sie Ihre Poolbaufirma kostenlos.
                </p>

                <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Company Name */}
                    <div>
                        <label htmlFor="companyName" style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#334155',
                            marginBottom: '6px',
                        }}>
                            Firmenname
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Building2 style={{
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: '16px',
                                height: '16px',
                                color: '#94a3b8',
                                pointerEvents: 'none',
                            }} />
                            <input
                                id="companyName"
                                name="companyName"
                                type="text"
                                placeholder="Muster Poolbau GmbH"
                                required
                                disabled={isLoading}
                                style={inputStyle}
                                onFocus={e => (e.target.style.borderColor = '#1E88D9')}
                                onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#334155',
                            marginBottom: '6px',
                        }}>
                            E-Mail
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Mail style={{
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: '16px',
                                height: '16px',
                                color: '#94a3b8',
                                pointerEvents: 'none',
                            }} />
                            <input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="kontakt@firma.de"
                                required
                                disabled={isLoading}
                                style={inputStyle}
                                onFocus={e => (e.target.style.borderColor = '#1E88D9')}
                                onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#334155',
                            marginBottom: '6px',
                        }}>
                            Passwort
                        </label>
                        <div style={{ position: 'relative' }}>
                            <Lock style={{
                                position: 'absolute',
                                left: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                width: '16px',
                                height: '16px',
                                color: '#94a3b8',
                                pointerEvents: 'none',
                            }} />
                            <input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                required
                                disabled={isLoading}
                                style={inputStyle}
                                onFocus={e => (e.target.style.borderColor = '#1E88D9')}
                                onBlur={e => (e.target.style.borderColor = '#e2e8f0')}
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            padding: '12px',
                            background: isLoading ? '#93c5fd' : 'linear-gradient(135deg, #1E88D9 0%, #1a6cb8 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '10px',
                            fontSize: '14px',
                            fontWeight: 700,
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            marginTop: '4px',
                            boxShadow: '0 4px 12px rgba(30,136,217,0.3)',
                        }}
                    >
                        {isLoading && <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />}
                        {isLoading ? 'Konto wird erstellt...' : 'Konto erstellen'}
                    </button>
                </form>

                <p style={{
                    textAlign: 'center',
                    marginTop: '20px',
                    fontSize: '13px',
                    color: '#64748b',
                }}>
                    Bereits registriert?{' '}
                    <Link href="/login" style={{
                        color: '#1E88D9',
                        fontWeight: 600,
                        textDecoration: 'none',
                    }}>
                        Anmelden
                    </Link>
                </p>
            </div>
        </div>
    )
}
