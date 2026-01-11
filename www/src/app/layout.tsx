import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import GlobalHealthChecker from "@/components/GlobalHealthChecker";
import Footer from "@/components/Footer";
import { I18nProvider } from "@/components/I18nProvider";
import poolConfig, { getLocalizedValue } from "@/lib/poolConfig";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: getLocalizedValue(poolConfig.pool.name, "en"),
  description: getLocalizedValue(poolConfig.pool.description, "en"),
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <I18nProvider>
          <GlobalHealthChecker />
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </I18nProvider>
      </body>
    </html>
  );
}
