"use client";

import Link from "next/link";
import { Film } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { VideoCompressor } from "@/components/video-compressor";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-slate-200 dark:border-slate-800/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50 transition-colors duration-300">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-linear-to-br from-violet-500 to-cyan-500">
                <Film className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  Video Compressor
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                  Comprimi video direttamente nel browser
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-3">
              Comprimi i tuoi video{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-500 to-cyan-500">
                gratuitamente
              </span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
              Riduci le dimensioni dei tuoi video direttamente nel browser.
              Nessun upload su server, 100% privacy garantita.
            </p>
          </div>

          {/* Video Compressor Component */}
          <VideoCompressor />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800/50 mt-auto transition-colors duration-300">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-sm text-slate-500">
            <p>
              Creato con Next.js e WebCodecs API
            </p>
            <span className="hidden sm:inline">•</span>
            <Link
              href="/privacy"
              className="hover:text-violet-500 transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
