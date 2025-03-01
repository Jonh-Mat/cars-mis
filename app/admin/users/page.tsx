import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import UsersList from '@/components/admin/users/UsersList'
import AdminStatsCard from '@/components/admin/AdminStatsCard'
import { PageContainer } from '@/components/ui/PageContainer'
import { PageHeader } from '@/components/PageHeaders'

async function getUsers() {
  return await prisma.user.findMany({
    include: {
      _count: {
        select: {
          reservations: true,
        },
      },
      reservations: {
        take: 1,
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export default async function UsersManagementPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'ADMIN') {
    return notFound()
  }

  const users = await getUsers()
  const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ')
  const userName = session.user.name || session.user.email || 'Unknown User'

  return (
    <PageContainer className="p-0">
      <PageHeader
        title="Users Management"
        username={userName}
        currentDate={currentDate}
      />

      <div className="p-6 bg-gray-50 dark:bg-navy-900/50 min-h-[calc(100vh-16rem)]">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <AdminStatsCard
            title="Total Users"
            value={users.length}
            icon="users"
            trend={`${users.filter((u) => u.role === 'ADMIN').length} admins`}
          />
          <AdminStatsCard
            title="Active Users"
            value={users.filter((u) => u._count.reservations > 0).length}
            icon="users"
            trend="With reservations"
          />
          <AdminStatsCard
            title="New Users"
            value={
              users.filter((u) => {
                const daysSinceJoined = Math.floor(
                  (new Date().getTime() - new Date(u.createdAt).getTime()) /
                    (1000 * 60 * 60 * 24)
                )
                return daysSinceJoined <= 30
              }).length
            }
            icon="users"
            trend="Last 30 days"
          />
        </div>

        {/* Users List */}
        <UsersList users={users} />
      </div>
    </PageContainer>
  )
}
