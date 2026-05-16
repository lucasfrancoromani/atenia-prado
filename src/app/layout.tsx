import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mesa QR | Demo Horeca",
  description: "Demo frontend para pedidos por QR en mesa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
