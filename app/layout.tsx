import "./globals.css"; // Loads global styles for the application.

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";

import ReactQueryProvider from "@/components/providers/ReactQueryProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "InfiniGoal Employee Portal",
  description: "Employee Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${inter.variable} font-sans`}>
        <ReactQueryProvider>{children}</ReactQueryProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
