import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JOHAI AI Automation",
  description: "AI automation audits and CRM lead capture for JOHAI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
