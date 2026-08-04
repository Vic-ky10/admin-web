import "./globals.css"; // Loads global styles for the application.

import type { Metadata } from "next";
import { Toaster } from "sonner";

import ReactQueryProvider from "@/components/providers/ReactQueryProvider";

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
      <body>
        <ReactQueryProvider>{children}</ReactQueryProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
