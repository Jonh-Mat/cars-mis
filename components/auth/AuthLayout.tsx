import Link from "next/link";
import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showSignIn?: boolean; // To determine which link to show
}

export function AuthLayout({
  children,
  title,
  subtitle,
  showSignIn,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-navy-900/50 p-4">
      <div className="max-w-md w-full">
        {/* Card Container */}
        <div className="bg-white dark:bg-navy-800 shadow-sm dark:shadow-navy-900/50 rounded-2xl border border-gray-200 dark:border-navy-700 overflow-hidden">
          {/* Brand Header */}
          <div className="bg-gradient-primary px-6 py-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm mb-4">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 4H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm-5 14h4m-4-3h4m-4-3h4M9 9h1.5m-1.5 3h1.5m-1.5 3h1.5M6 9h.5m-.5 3h.5m-.5 3h.5"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">{title}</h1>
            {subtitle && <p className="text-blue-100">{subtitle}</p>}
          </div>

          {/* Form Container */}
          <div className="p-6">{children}</div>

          {/* Footer */}
          <div className="px-6 pb-6 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-navy-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 text-gray-500 dark:text-gray-400 bg-white dark:bg-navy-800">
                  {showSignIn
                    ? "Already have an account?"
                    : "Don't have an account?"}
                </span>
              </div>
            </div>
            <Link
              href={showSignIn ? "/auth/signin" : "/auth/signup"}
              className={cn(
                "mt-4 inline-flex w-full justify-center rounded-lg px-4 py-2.5",
                "text-sm font-semibold transition-colors",
                "border border-gray-300 dark:border-navy-700",
                "text-gray-900 dark:text-white",
                "hover:bg-gray-50 dark:hover:bg-navy-700"
              )}
            >
              {showSignIn ? "Sign In" : "Create an account"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
