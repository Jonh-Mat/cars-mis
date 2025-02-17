import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import AdminStatsCard from "@/components/admin/AdminStatsCard";
import AdminQuickActions from "@/components/admin/AdminQuickActions";
import RecentActivities from "@/components/admin/RecentActivities";
import BackButton from "@/components/BackButton";

async function getAdminStats() {
  const [
    totalUsers,
    totalCars,
    pendingReservations,
    totalRevenue,
    recentActivities,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.car.count(),
    prisma.reservation.count({
      where: { status: "PENDING" },
    }),
    prisma.reservation.aggregate({
      where: { status: "COMPLETED" },
      _sum: { totalPrice: true },
    }),
    prisma.reservation.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        car: true,
      },
    }),
  ]);

  return {
    totalUsers,
    totalCars,
    pendingReservations,
    totalRevenue: totalRevenue._sum.totalPrice || 0,
    recentActivities,
  };
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  const currentDate = "2025-02-14 17:18:06";
  const userName = "Jonh-Mat";

  if (!session?.user || session.user.role !== "ADMIN") {
    return notFound();
  }

  const stats = await getAdminStats();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-900 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <BackButton />
              <h1 className="text-3xl font-bold mt-4">Admin Dashboard</h1>
              <p className="text-blue-100">Logged in as: {session.user.name}</p>
            </div>
            <Link
              href="/admin/car-create"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add New Car
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <AdminStatsCard
            title="Total Users"
            value={stats.totalUsers}
            icon="users"
            trend="+12% from last month"
          />
          <AdminStatsCard
            title="Total Cars"
            value={stats.totalCars}
            icon="cars"
            trend="+5% from last month"
          />
          <AdminStatsCard
            title="Pending Reservations"
            value={stats.pendingReservations}
            icon="calendar"
            trend="4 new today"
            highlight={true}
          />
          <AdminStatsCard
            title="Total Revenue"
            value={`$${stats.totalRevenue.toFixed(2)}`}
            icon="money"
            trend="+8% from last month"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <AdminQuickActions />
          </div>

          {/* Recent Activities */}
          <div className="lg:col-span-2">
            <RecentActivities activities={stats.recentActivities} />
          </div>
        </div>
      </div>
    </div>
  );
}
