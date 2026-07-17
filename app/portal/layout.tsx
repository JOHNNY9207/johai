import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Customer Portal | JOHAI",
  description: "Secure customer access to appointments, messages, documents, and support.",
};

export default function PortalRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
