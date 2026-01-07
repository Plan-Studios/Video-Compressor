import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Video Compressor - Comprimi video online gratis",
  description:
    "Comprimi i tuoi video gratuitamente, direttamente nel browser. Nessun upload su server, 100% privacy.",
  keywords: [
    "compressore video",
    "comprimi video",
    "video compressor",
    "ridurre dimensione video",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-300`}
      >
        {children}
      </body>
    </html>
  );
}
