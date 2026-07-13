import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/Providers";
import { AppLayoutWrapper } from "@/components/AppLayoutWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rentify",
  description: "Split expenses easily",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body className={`${inter.className} min-h-full bg-black text-white`}>
        <Providers>
          <AppLayoutWrapper>
            {children}
          </AppLayoutWrapper>
          <Toaster theme="dark" />
        </Providers>
      </body>
    </html>
  );
}
