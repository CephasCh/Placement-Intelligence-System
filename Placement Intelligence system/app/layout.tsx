import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Placement Intelligence System",
  description: "Student-focused company intelligence by Team RAGNAROK.",
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
