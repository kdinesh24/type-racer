import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ErrorBoundary from "@/components/ErrorBoundary";
import NavigationGuard from "@/components/NavigationGuard";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TypeRace",
  description: "Real-time competitive typing races with friends and players worldwide",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <NavigationGuard />
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}