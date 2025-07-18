import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "./providers";
import Navbar from "@/components/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Restaurant Voting App",
  description: "Vote for restaurants and place orders with your team",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <Navbar />
            <main className="container mx-auto px-4 py-8">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
