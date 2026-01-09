import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://bedtimestories.productmama.dev'),
  title: {
    default: "Bedtime Stories - Magical AI-Generated Tales",
    template: "%s | Bedtime Stories"
  },
  description: "Receive a new, calming bedtime story every day for your children. Free AI-generated short stories for sleep.",
  keywords: ["bedtime stories", "short stories for kids", "AI story generator", "stories for sleep", "children's books"],
  authors: [{ name: "Sravyamajeti" }],
  openGraph: {
    title: "Bedtime Stories - Magical AI-Generated Tales",
    description: "Receive a new, calming bedtime story every day for your children.",
    url: 'https://bedtimestories.productmama.dev',
    siteName: 'Bedtime Stories',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Bedtime Stories",
    description: "Magical AI-Generated Tales for Kids",
  },
  robots: {
    index: true,
    follow: true,
  }
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
