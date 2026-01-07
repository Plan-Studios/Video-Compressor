"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye, Server, Trash2, Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link href="/">
            <Button variant="ghost" className="gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
              <ArrowLeft className="w-4 h-4" />
              Torna al compressore
            </Button>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-violet-500/10 mb-4">
            <Shield className="w-8 h-8 text-violet-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-3">
            Privacy Policy
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Ultimo aggiornamento: {new Date().toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-8"
        >
          {/* Intro */}
          <section className="p-6 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              La tua privacy e' la nostra priorita'. Video Compressor e' progettato con un approccio
              <strong className="text-violet-600 dark:text-violet-400"> "privacy by design"</strong>:
              tutti i tuoi video vengono elaborati direttamente nel tuo browser, senza mai essere
              caricati su server esterni.
            </p>
          </section>

          {/* Key points */}
          <div className="grid gap-4 md:grid-cols-2">
            <PrivacyCard
              icon={<Lock className="w-5 h-5" />}
              title="Elaborazione Locale"
              description="I tuoi video non lasciano mai il tuo dispositivo. Tutta la compressione avviene nel browser."
              color="emerald"
            />
            <PrivacyCard
              icon={<Server className="w-5 h-5" />}
              title="Nessun Server"
              description="Non utilizziamo server per elaborare i video. Zero upload, zero rischi."
              color="blue"
            />
            <PrivacyCard
              icon={<Eye className="w-5 h-5" />}
              title="Nessun Tracciamento"
              description="Non raccogliamo dati personali, non usiamo analytics invasivi."
              color="violet"
            />
            <PrivacyCard
              icon={<Trash2 className="w-5 h-5" />}
              title="Nessuna Memorizzazione"
              description="I video vengono eliminati dalla memoria del browser quando chiudi la pagina."
              color="rose"
            />
          </div>

          {/* Detailed sections */}
          <section className="space-y-6">
            <PolicySection title="1. Dati che NON raccogliamo">
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                <li>I tuoi video o file multimediali</li>
                <li>Informazioni personali identificabili</li>
                <li>Cronologia di navigazione o utilizzo</li>
                <li>Indirizzi IP o dati di geolocalizzazione</li>
                <li>Cookie di tracciamento di terze parti</li>
              </ul>
            </PolicySection>

            <PolicySection title="2. Come funziona la compressione">
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                Video Compressor utilizza tecnologie moderne del browser per elaborare i video:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                <li><strong>WebCodecs API</strong> - Per la codifica video nativa e veloce</li>
                <li><strong>FFmpeg.wasm</strong> - Come fallback per browser meno recenti</li>
              </ul>
              <p className="text-slate-600 dark:text-slate-400 mt-3">
                Entrambe le tecnologie operano interamente nel tuo browser. I file video rimangono
                nella memoria locale del tuo dispositivo durante l'elaborazione e vengono automaticamente
                rilasciati quando chiudi la pagina o il browser.
              </p>
            </PolicySection>

            <PolicySection title="3. Cookie e Storage Locale">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-4">
                <Cookie className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Utilizziamo esclusivamente il <strong>localStorage</strong> del browser per salvare
                  la tua preferenza tema (chiaro/scuro). Nessun altro dato viene memorizzato.
                </p>
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                Non utilizziamo cookie di tracciamento, cookie pubblicitari o cookie di terze parti.
              </p>
            </PolicySection>

            <PolicySection title="4. Risorse Esterne">
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                L'applicazione potrebbe caricare risorse esterne minime:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                <li>Font web (Google Fonts) - Solo se necessario</li>
                <li>Libreria FFmpeg.wasm da CDN - Solo come fallback</li>
              </ul>
              <p className="text-slate-600 dark:text-slate-400 mt-3">
                Queste risorse sono caricate in modo sicuro e non trasmettono informazioni sui tuoi video.
              </p>
            </PolicySection>

            <PolicySection title="5. Sicurezza">
              <p className="text-slate-600 dark:text-slate-400">
                La sicurezza dei tuoi dati e' garantita dal design stesso dell'applicazione:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 mt-3">
                <li>Connessione HTTPS obbligatoria</li>
                <li>Nessuna trasmissione di dati sensibili</li>
                <li>Codice open source verificabile</li>
                <li>Headers di sicurezza (COOP/COEP) per isolamento del contesto</li>
              </ul>
            </PolicySection>

            <PolicySection title="6. I tuoi diritti">
              <p className="text-slate-600 dark:text-slate-400">
                Poiche' non raccogliamo dati personali, non ci sono dati da richiedere, modificare
                o eliminare. Hai il pieno controllo dei tuoi file in ogni momento.
              </p>
            </PolicySection>

            <PolicySection title="7. Modifiche alla Privacy Policy">
              <p className="text-slate-600 dark:text-slate-400">
                Eventuali modifiche a questa privacy policy saranno pubblicate su questa pagina
                con la data di aggiornamento. Ti consigliamo di controllare periodicamente questa
                pagina per eventuali cambiamenti.
              </p>
            </PolicySection>

            <PolicySection title="8. Contatti">
              <p className="text-slate-600 dark:text-slate-400">
                Per domande sulla privacy o su questa applicazione, puoi contattarci tramite
                i canali ufficiali del progetto.
              </p>
            </PolicySection>
          </section>

          {/* Footer note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center pt-8 border-t border-slate-200 dark:border-slate-700"
          >
            <p className="text-sm text-slate-500">
              Video Compressor - Compressione video 100% locale e privata
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function PrivacyCard({
  icon,
  title,
  description,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: "emerald" | "blue" | "violet" | "rose";
}) {
  const colorClasses = {
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-500",
    violet: "bg-violet-500/10 border-violet-500/20 text-violet-500",
    rose: "bg-rose-500/10 border-rose-500/20 text-rose-500",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`p-4 rounded-xl border ${colorClasses[color].split(" ").slice(0, 2).join(" ")}`}
    >
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${colorClasses[color]} mb-3`}>
        {icon}
      </div>
      <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">{title}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
    </motion.div>
  );
}

function PolicySection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="p-6 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
        {title}
      </h2>
      {children}
    </div>
  );
}
