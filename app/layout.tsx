import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Providers from "./providers";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aplikacja do głosowania na restauracje",
  description: "Głosuj na restauracje i składaj zamówienia ze swoim zespołem",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body className={inter.className}>
        <Providers>
          <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <Navbar />
            <main className="container flex-grow px-4 py-8 mx-auto">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
