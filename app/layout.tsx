import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from "./providers";
import { ThemeProvider } from "@/components/provider/theme-provider";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Car Rental System",
  description: "A modern car rental management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          inter.className,
          "min-h-screen bg-background text-foreground",
          "transition-colors duration-300"
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextAuthProvider>
            {/* Main Layout Structure */}
            <div className="relative flex min-h-screen flex-col">
              <Navbar />

              {/* Main Content */}
              <main className="flex-1">{children}</main>

              {/* Footer */}
              <footer className="border-t border-gray-200 dark:border-navy-700">
                <div className="container mx-auto px-4 py-6">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      © {new Date().getFullYear()} Car Rental System. All rights
                      reserved.
                    </p>
                    <div className="flex items-center gap-4">
                      <a
                        href="#"
                        className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                      >
                        Privacy Policy
                      </a>
                      <a
                        href="#"
                        className="text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                      >
                        Terms of Service
                      </a>
                    </div>
                  </div>
                </div>
              </footer>
            </div>

            {/* Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                className: "dark:bg-navy-800 dark:text-white",
                style: {
                  background: "var(--background)",
                  color: "var(--foreground)",
                },
              }}
            />
          </NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
