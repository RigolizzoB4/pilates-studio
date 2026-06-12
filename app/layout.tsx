import type { Metadata, Viewport } from "next";
import "./globals.css";
import { PwaTheme } from "@/app/components/PwaTheme";

export const metadata: Metadata = {
  title: "Studio Pilates",
  description: "Gestão completa do Studio de Pilates",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Studio Pilates",
  },
};

export const viewport: Viewport = {
  themeColor: "#7d8768",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" sizes="180x180" />
        <link
          rel="apple-touch-startup-image"
          href="/icons/icon-512.png"
          media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)"
        />
        <meta name="theme-color" content="#7d8768" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Studio Pilates" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body style={{ margin: 0, padding: 0, overflow: "hidden", backgroundColor: "var(--pilates-bg)" }}>
        <PwaTheme />
        {children}
      </body>
    </html>
  );
}
