import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { LoadingProvider } from "@/context/LoadingContext";
import SteeringLoader from "@/components/SteeringLoader";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DriveGuard | Traffic Fine Assistant India",
  description: "AI-powered traffic fine assistant for India.",
  icons: {
    icon: "/driveguard-logo.png",
    apple: "/driveguard-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <LoadingProvider>
            <SteeringLoader />
            {children}
          </LoadingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
