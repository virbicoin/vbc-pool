import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import GlobalHealthChecker from "@/components/GlobalHealthChecker";
import Footer from "@/components/Footer";
import poolConfig from "@/lib/poolConfig";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: poolConfig.pool.name,
  description: poolConfig.pool.description,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <GlobalHealthChecker />
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
