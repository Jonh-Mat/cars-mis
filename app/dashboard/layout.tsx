import type { Metadata } from "next";
import { cn } from "@/lib/utils";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export const metadata: Metadata = {
  title: "Dashboard - Car Rental System",
  description: "Dashboard for car rental management system",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }
  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">{children}</div>
    </div>
  );
}
