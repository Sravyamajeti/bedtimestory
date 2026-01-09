import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bedtime Stories - Magical AI-Generated Tales",
  description: "Receive a new, calming bedtime story every day for your children.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
