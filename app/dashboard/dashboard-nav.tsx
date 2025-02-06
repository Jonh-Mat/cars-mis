"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { Role } from "@/types";

interface DashboardNavProps {
  user: {
    name?: string | null;
    role: Role;
  };
}

export default function DashboardNav({ user }: DashboardNavProps) {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-xl font-bold">
                Car Rental System
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/dashboard"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Dashboard
              </Link>
              {user.role === Role.ADMIN && (
                <Link
                  href="/dashboard/users"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Users
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-gray-500 mr-4">{user.name}</span>
            <button
              onClick={() => signOut()}
              className="text-gray-500 hover:text-gray-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
