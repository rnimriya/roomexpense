import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FairShare",
  description: "Split expenses easily",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full">
      <body className={`${inter.className} min-h-full bg-black text-white flex justify-center`}>
        <Providers>
          <div className="w-full max-w-[480px] min-h-screen bg-[#121212] border-x border-zinc-900/50 shadow-2xl relative flex flex-col">
            <main className="flex-1">
              {children}
            </main>
            <BottomNav />
          </div>
          <Toaster theme="dark" />
        </Providers>
      </body>
    </html>
  );
}
