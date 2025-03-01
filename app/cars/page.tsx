import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import CarCard from '@/components/CarCard'
import { notFound } from 'next/navigation'
import { BackButton } from '@/components/BackButton'
import SearchBar from '@/components/SearchBar'
import { Prisma } from '@prisma/client'
import { PageContainer } from '@/components/ui/PageContainer'

type SearchParams = {
  search?: string
}

// Get user's rented cars
async function getUserRentedCars(userId: string) {
  try {
    const rentedCars = await prisma.car.findMany({
      where: {
        reservations: {
          some: {
            userId: userId,
            status: {
              in: ['CONFIRMED', 'PENDING'],
            },
            endDate: {
              gte: new Date(),
            },
          },
        },
      },
      include: {
        reservations: {
          where: {
            userId: userId,
            status: {
              in: ['CONFIRMED', 'PENDING'],
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            status: true,
            createdAt: true,
            startDate: true,
            endDate: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return rentedCars.map((car) => ({
      ...car,
      pricePerDay: car.pricePerDay.toString(),
    }))
  } catch (error) {
    console.error('Error fetching rented cars:', error)
    return []
  }
}

// Get all available cars with search functionality
async function getCars(search?: string) {
  try {
    const where: Prisma.CarWhereInput = {
      AND: [
        search
          ? {
              OR: [
                {
                  make: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
                {
                  model: {
                    contains: search,
                    mode: 'insensitive',
                  },
                },
              ],
            }
          : {},
      ],
    }

    const cars = await prisma.car.findMany({
      where,
      include: {
        reservations: {
          where: {
            OR: [
              { status: 'CONFIRMED' },
              {
                AND: [
                  { status: 'PENDING' },
                  {
                    createdAt: {
                      gte: new Date(Date.now() - 30 * 60 * 1000), // Last 30 minutes
                    },
                  },
                ],
              },
            ],
          },
          select: {
            status: true,
            createdAt: true,
            startDate: true,
            endDate: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Filter available cars
    const availableCars = cars.filter((car) => {
      const hasConfirmedReservation = car.reservations.some(
        (res) => res.status === 'CONFIRMED'
      )

      const hasPendingReservation = car.reservations.some((res) => {
        if (res.status === 'PENDING') {
          const minutesAgo =
            (new Date().getTime() - new Date(res.createdAt).getTime()) /
            1000 /
            60
          return minutesAgo < 30
        }
        return false
      })

      return !hasConfirmedReservation && !hasPendingReservation
    })

    return availableCars.map((car) => ({
      ...car,
      pricePerDay: car.pricePerDay.toString(),
    }))
  } catch (error) {
    console.error('Error fetching cars:', error)
    return []
  }
}

export default async function CarsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return notFound()
  }

  const [rentedCars, availableCars] = await Promise.all([
    getUserRentedCars(session.user.id),
    getCars(searchParams.search),
  ])

  const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ')
  const userName = session.user.name || session.user.email || 'Unknown User'

  return (
    <PageContainer>
      {/* User Info Banner */}
      <div className="mb-8 p-4 bg-gray-50 dark:bg-navy-900/50 rounded-xl border border-gray-200 dark:border-navy-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Welcome back
              </p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {userName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {currentDate} UTC
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Search and Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <BackButton />
          <SearchBar />
        </div>

        {/* Rented Cars Section */}
        {rentedCars.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Your Rented Cars
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                {rentedCars.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {rentedCars.map((car) => (
                <CarCard
                  key={car.id}
                  car={{
                    ...car,
                    isRented: true,
                  }}
                  showReserveButton={false}
                  currentDate={currentDate}
                />
              ))}
            </div>
          </section>
        )}

        {/* Available Cars Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Available Cars
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
              {availableCars.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {availableCars.map((car) => (
              <CarCard
                key={car.id}
                car={{
                  ...car,
                  isAvailable: true,
                  isRented: false,
                }}
                showReserveButton={true}
                currentDate={currentDate}
              />
            ))}
          </div>

          {availableCars.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl bg-gray-50 dark:bg-navy-900/50">
              <div className="text-center space-y-4">
                <svg
                  className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                <p className="text-gray-600 dark:text-gray-400">
                  No cars found matching your search.
                </p>
                <button
                  onClick={() => (window.location.href = '/cars')}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Clear search
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </PageContainer>
  )
}
