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
    icon: "/myeng2.png",
    shortcut: "/myeng2.png",
    apple: "/myeng2.png",
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
