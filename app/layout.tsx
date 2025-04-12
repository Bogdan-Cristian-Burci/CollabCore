import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { headers } from "next/headers";
import { auth } from "@/auth";
import { randomBytes } from "crypto";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Collab Core",
  description: "Work Smarter, Together"
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Generate a new CSRF token for each request
  const csrfToken = randomBytes(16).toString('hex');
  
  // Get the session to check if user is authenticated
  const session = await auth();
  
  return (
    <html lang="en">
    <head>
      <link
          rel="icon"
          href="/icon1.png"
          type="image/svg+xml"
      />
      <title>Collab Core</title>
      {/* Add CSRF token as meta tag for additional CSRF protection */}
      <meta name="csrf-token" content={csrfToken} />
      {/* Security headers */}
      <meta httpEquiv="Content-Security-Policy" content="default-src 'self'; connect-src 'self' http://localhost; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:;" />
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-Frame-Options" content="DENY" />
      <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
    </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers csrfToken={csrfToken} initialSession={session}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
