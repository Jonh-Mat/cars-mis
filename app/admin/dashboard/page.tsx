import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import AdminStatsCard from '@/components/admin/AdminStatsCard'
import AdminQuickActions from '@/components/admin/AdminQuickActions'
import RecentActivities from '@/components/admin/RecentActivities'
import { BackButton } from '@/components/BackButton'
import { PageContainer } from '@/components/ui/PageContainer'
import { Button } from '@/components/ui/button'

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
      where: { status: 'PENDING' },
    }),
    prisma.reservation.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { totalPrice: true },
    }),
    prisma.reservation.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: true,
        car: true,
      },
    }),
  ])

  return {
    totalUsers,
    totalCars,
    pendingReservations,
    totalRevenue: totalRevenue._sum.totalPrice || 0,
    recentActivities,
  }
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'ADMIN') {
    return notFound()
  }

  const stats = await getAdminStats()

  return (
    <PageContainer className="p-0">
      {/* Admin Header */}
      <div className="bg-gradient-primary text-white rounded-t-2xl">
        <div className="px-6 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BackButton
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                />
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              </div>
              <p className="text-blue-100">
                Logged in as: {session.user.name || session.user.email}
              </p>
            </div>
            <Button asChild variant="secondary">
              <Link href="/admin/car-create">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add New Car
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
    </PageContainer>
  )
}
