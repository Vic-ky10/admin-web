import "./globals.css"; // Loads global styles for the application.

import type { Metadata } from "next";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "InfiniGoal Admin Portal",
  description: "Employee Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
