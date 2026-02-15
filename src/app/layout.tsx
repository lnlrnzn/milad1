import type { Metadata, Viewport } from "next"
import { Lato, Open_Sans } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const lato = Lato({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
})

const openSans = Open_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "SDIA Portal",
    template: "%s | SDIA Portal",
  },
  description:
    "Ihr persönliches Kundenportal für Immobilien-Investments – Süddeutsche Immobilienagentur",
  metadataBase: new URL("https://portal.sdia.de"),
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9f7f3" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1a1a" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="de">
      <body className={`${lato.variable} ${openSans.variable} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
