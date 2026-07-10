import "./globals.css"; // Loads global styles for the application.

import type { Metadata } from "next";

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
      <body>{children}</body> 
    </html>
  );
}