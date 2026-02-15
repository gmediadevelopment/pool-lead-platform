"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { ArrowRight, CheckCircle2, TrendingUp, ShieldCheck } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b backdrop-blur-md fixed w-full z-50 bg-background/80">
        <Link className="flex items-center justify-center" href="#">
          <TrendingUp className="h-6 w-6 text-primary" />
          <span className="ml-2 text-lg font-bold">Poolbau Vergleich</span>
          <span className="ml-1 text-sm text-muted-foreground">| Lead-Marktplatz</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/login">
            Login
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/register">
            Registrieren
          </Link>
        </nav>
      </header>
      <main className="flex-1 pt-14">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-background to-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-2"
              >
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Qualifizierte Pool-Leads <br className="hidden sm:inline" />
                  auf Knopfdruck
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Steigern Sie Ihren Umsatz mit vorqualifizierten Kundenanfragen aus Ihrer Region.
                  Keine Kaltakquise, volle Transparenz.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="space-x-4"
              >
                <Link href="/register">
                  <Button size="lg" className="h-12 px-8">
                    Jetzt Partner werden
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="h-12 px-8">
                    Login
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <motion.div
                whileHover={{ y: -5 }}
                className="flex flex-col items-center space-y-4 text-center p-6 border rounded-xl bg-card shadow-sm"
              >
                <div className="p-3 bg-primary/10 rounded-full">
                  <ShieldCheck className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-xl font-bold">Geprüfte Qualität</h2>
                <p className="text-muted-foreground">
                  Jeder Lead wird von unserem Team validiert. Keine Fake-Anfragen, nur echte Interessenten.
                </p>
              </motion.div>
              <motion.div
                whileHover={{ y: -5 }}
                className="flex flex-col items-center space-y-4 text-center p-6 border rounded-xl bg-card shadow-sm"
              >
                <div className="p-3 bg-primary/10 rounded-full">
                  <CheckCircle2 className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-xl font-bold">Volle Transparenz</h2>
                <p className="text-muted-foreground">
                  Sehen Sie Projektdetails bevor Sie kaufen. Entscheiden Sie selbst, welche Anfragen zu Ihnen passen.
                </p>
              </motion.div>
              <motion.div
                whileHover={{ y: -5 }}
                className="flex flex-col items-center space-y-4 text-center p-6 border rounded-xl bg-card shadow-sm"
              >
                <div className="p-3 bg-primary/10 rounded-full">
                  <TrendingUp className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-xl font-bold">Skalierbarer Umsatz</h2>
                <p className="text-muted-foreground">
                  Füllen Sie Ihre Auftragspipeline flexibel auf. Zahlen Sie nur für Leads, die Sie wirklich wollen.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500 dark:text-gray-400">© 2024 Poolbau Vergleich. Alle Rechte vorbehalten.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Impressum
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Datenschutz
          </Link>
        </nav>
      </footer>
    </div>
  )
}
