import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter font for a clean look
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/layout/header"; // Import Header
import { TooltipProvider } from "@/components/ui/tooltip"; // Import TooltipProvider

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });

export const metadata: Metadata = {
  title: "Audio Insights", // Updated title
  description: "Summarize your audio recordings with AI - Audio Insights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <TooltipProvider delayDuration={0}> {/* Wrap with TooltipProvider */}
          <AuthProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow container mx-auto px-4 py-8">
                {children}
              </main>
              <footer className="py-4 text-center text-muted-foreground text-sm border-t">
                © {new Date().getFullYear()} Audio Insights. All rights reserved. {/* Updated company name */}
              </footer>
            </div>
            <Toaster />
          </AuthProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
