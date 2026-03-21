import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MyEng",
  description: "app for learning English daily",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/2.svg",
    shortcut: "/2.svg",
    apple: "/2.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Daily Vocab",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${inter.className} antialiased`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
