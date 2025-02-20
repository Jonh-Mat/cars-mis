"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { signIn } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();
  const { theme } = useTheme();

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-navy-700 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold gradient-text">Car Rental</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/dashboard"
              className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
            >
              Dashboard
            </Link>
            <Link
              href="/cars"
              className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
            >
              Cars
            </Link>
            {session?.user?.role === "ADMIN" && (
              <Link
                href="/admin/dashboard"
                className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400"
              >
                Admin
              </Link>
            )}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {session ? (
              <Button variant="outline" onClick={() => signOut()}>
                Sign Out
              </Button>
            ) : (
              <Button onClick={() => signIn()}>Sign In</Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
