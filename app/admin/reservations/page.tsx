import { getServerSession } from 'next-auth/next'
import authOptions from '@/app/api/auth/[...nextauth]/route'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ReservationsList from '@/components/admin/reservations/ReservationsList'
import AdminStatsCard from '@/components/admin/AdminStatsCard'
import { PageHeader } from '@/components/PageHeaders'
import { PageContainer } from '@/components/ui/PageContainer'

async function getReservations() {
  return await prisma.reservation.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      car: {
        select: {
          make: true,
          model: true,
          imageUrl: true,
          isAvailable: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export default async function ReservationsManagementPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user || session.user.role !== 'ADMIN') {
    return notFound()
  }

  const reservations = await getReservations()
  const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ')
  const userName = session.user.name || session.user.email || 'Unknown User'

  // Calculate some statistics
  const pendingCount = reservations.filter((r) => r.status === 'PENDING').length
  const confirmedCount = reservations.filter(
    (r) => r.status === 'CONFIRMED'
  ).length
  const completedCount = reservations.filter(
    (r) => r.status === 'COMPLETED'
  ).length
  const totalRevenue = reservations
    .filter((r) => r.status === 'COMPLETED')
    .reduce((acc, r) => acc + Number(r.totalPrice), 0)

  return (
    <PageContainer className="p-0">
      <PageHeader
        title="Reservations Management"
        username={userName}
        currentDate={currentDate}
      />

      <div className="p-6 bg-gray-50 dark:bg-navy-900/50 min-h-[calc(100vh-16rem)]">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <AdminStatsCard
            title="Pending Reservations"
            value={pendingCount}
            icon="calendar"
            trend="Awaiting confirmation"
            highlight={pendingCount > 0}
          />
          <AdminStatsCard
            title="Confirmed Reservations"
            value={confirmedCount}
            icon="calendar"
            trend="In progress"
          />
          <AdminStatsCard
            title="Completed Reservations"
            value={completedCount}
            icon="calendar"
            trend="Successfully finished"
          />
          <AdminStatsCard
            title="Total Revenue"
            value={`$${totalRevenue.toFixed(2)}`}
            icon="money"
            trend="From completed reservations"
          />
        </div>

        {/* Reservations List */}
        <ReservationsList reservations={reservations} />
      </div>
    </PageContainer>
  )
}
