import type { Metadata } from "next";
import Link from "next/link";
import { DairyProvider } from "@/context/DairyContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dairy OS - Command Center",
  description: "Jhol-proof digital tracking system for dairy business.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <DairyProvider>
          <div className="container">
            <nav className="nav">
              <div className="nav-brand">
                <span style={{ fontSize: '1.5rem' }}>🐄</span> Dairy OS
              </div>
              <div className="nav-links">
                <Link href="/" className="nav-link">Owner Dashboard</Link>
                <Link href="/staff" className="nav-link">Staff Input App</Link>
              </div>
            </nav>
            {children}
          </div>
        </DairyProvider>
      </body>
    </html>
  );
}
