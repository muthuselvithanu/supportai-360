import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SupportAI 360",
  description: "Headless Salesforce Agentforce customer support portal"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
