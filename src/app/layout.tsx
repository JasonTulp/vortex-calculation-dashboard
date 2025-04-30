import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import dotenv from 'dotenv';
import Image from "next/image";
dotenv.config();

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vortex Data Dashboard",
  description: "MongoDB data viewer for Vortex data",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-darker`}
      >
        <header className="bg-mid shadow pt-16 border-b border-light">
          <div className="max-w-[1800px] mx-auto py-4 px-4 sm:px-6 lg:px-8 flex items-center gap-4">
            <Image
              src="/TRN-Logo.svg"
              alt="TRN Logo"
              width={220}
              height={220}
              priority
            />
            {/* <h1 className="text-3xl font-bold text-primary pt-5">VORTEX DISTRIBUTION DASHBOARD</h1> */}
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
