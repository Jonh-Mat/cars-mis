import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import Link from 'next/link'
import { Prisma, TransmissionType } from '@prisma/client'
import { Suspense } from 'react'
import CarFilters from '@/components/CarFilters'
import CarCard from '@/components/CarCard'
import Loading from '@/components/Loading'
import { SearchParamsType } from '@/types'
import { cn } from '@/lib/utils'

// Helper function to safely parse search params
function parseSearchParams(searchParams: SearchParamsType) {
  return {
    make: searchParams?.make || '',
    model: searchParams?.model || '',
    minPrice: searchParams?.minPrice || '',
    maxPrice: searchParams?.maxPrice || '',
    transmission: searchParams?.transmission as TransmissionType | undefined,
    year: searchParams?.year || '',
    page: Number(searchParams?.page) || 1,
    limit: Number(searchParams?.limit) || 12,
  }
}

async function getCars(searchParams: SearchParamsType) {
  // Parse search params safely
  const { make, model, minPrice, maxPrice, transmission, year, page, limit } =
    parseSearchParams(searchParams)

  const where: Prisma.CarWhereInput = {
    ...(make && {
      make: {
        contains: make,
        mode: Prisma.QueryMode.insensitive,
      },
    }),
    ...(model && {
      model: {
        contains: model,
        mode: Prisma.QueryMode.insensitive,
      },
    }),
    ...(transmission && { transmission }),
    ...(year && { year: parseInt(year) }),
    ...(minPrice && {
      pricePerDay: { gte: new Prisma.Decimal(minPrice) },
    }),
    ...(maxPrice && {
      pricePerDay: { lte: new Prisma.Decimal(maxPrice) },
    }),
  }

  const skip = (page - 1) * limit

  try {
    // Get cars with their recent reservations
    const [carsWithReservations] = await Promise.all([
      prisma.car.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
      }),
      prisma.car.count({ where }),
    ])

    // Filter out cars that are currently reserved or in pending state
    const availableCars = carsWithReservations.filter((car) => {
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

    return {
      cars: availableCars.map((car) => ({
        ...car,
        isAvailable: true, // These cars are definitely available after filtering
        reservations: car.reservations, // Include reservations for UI state management
      })),
      total: availableCars.length, // Update total count to reflect actually available cars
      pages: Math.ceil(availableCars.length / limit),
    }
  } catch (error) {
    console.error('Error fetching cars:', error)
    return {
      cars: [],
      total: 0,
      pages: 0,
    }
  }
}
type DashboardStats = {
  availableCars: number
  activeReservations: number
  averagePrice: number | Prisma.Decimal
}

async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const stats = await prisma.$transaction(async (prisma) => {
      // Get all cars with their recent reservations
      const cars = await prisma.car.findMany({
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
                        gte: new Date(Date.now() - 30 * 60 * 1000),
                      },
                    },
                  ],
                },
              ],
            },
          },
        },
      })

      // Count truly available cars
      const availableCars = cars.filter((car) => {
        return !car.reservations.some(
          (res) =>
            res.status === 'CONFIRMED' ||
            (res.status === 'PENDING' &&
              (new Date().getTime() - new Date(res.createdAt).getTime()) /
                1000 /
                60 <
                30)
        )
      }).length

      const activeReservations = await prisma.reservation.count({
        where: {
          status: 'CONFIRMED',
          endDate: { gt: new Date() },
        },
      })

      const avgPrice = await prisma.car.aggregate({
        _avg: { pricePerDay: true },
      })

      return {
        availableCars,
        activeReservations,
        averagePrice: avgPrice._avg.pricePerDay || new Prisma.Decimal(0),
      }
    })

    return stats
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return {
      availableCars: 0,
      activeReservations: 0,
      averagePrice: 0,
    }
  }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParamsType
}) {
  try {
    const [session, { cars, pages }, stats] = await Promise.all([
      getServerSession(authOptions),
      getCars(searchParams),
      getDashboardStats(),
    ])

    return (
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="relative h-[500px] overflow-hidden bg-gradient-primary">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative container mx-auto px-4 h-full flex items-center">
            <div className="w-full lg:w-1/2 text-white z-10">
              <h1 className="text-5xl font-bold mb-6 animate-fade-in">
                Rent a car — quickly and easily!
              </h1>
              <p className="text-xl mb-8 text-gray-100 animate-slide-up">
                Streamline your car rental experience with our effortless
                booking process.
              </p>
              <div className="flex gap-4">
                <Link
                  href="/cars"
                  className={cn(
                    'btn-primary',
                    'bg-white dark:bg-navy-800 text-blue-600 dark:text-blue-400',
                    'px-8 py-3 rounded-full text-lg font-semibold',
                    'hover:bg-gray-100 dark:hover:bg-navy-700 transition'
                  )}
                >
                  Explore Cars
                </Link>
                {session?.user?.role === 'ADMIN' && (
                  <Link
                    href="/admin/dashboard"
                    className={cn(
                      'border-2 border-white text-white',
                      'px-8 py-3 rounded-full text-lg font-semibold',
                      'hover:bg-white/10 transition',
                      'dark:border-navy-400 dark:text-navy-100'
                    )}
                  >
                    Admin Dashboard
                  </Link>
                )}
              </div>
            </div>
            <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-1/2">
              <div className="relative w-full h-[400px]">
                <Image
                  src="/cars/heroo.png"
                  alt="Featured Car"
                  fill
                  style={{ objectFit: 'contain' }}
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="animate-bounce-soft"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="container mx-auto px-4 -mt-16 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Available Cars',
                value: stats.availableCars,
              },
              {
                title: 'Active Reservations',
                value: stats.activeReservations,
              },
              {
                title: 'Average Price/Day',
                value: `$${Number(stats.averagePrice).toFixed(2)}`,
              },
            ].map((stat) => (
              <div
                key={stat.title}
                className={cn(
                  'card',
                  'p-6 transform transition-all duration-300',
                  'hover:-translate-y-1 hover:shadow-lg'
                )}
              >
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  {stat.title}
                </h3>
                <p className="text-3xl font-bold mt-2 gradient-text">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Car Listings */}
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <h2 className="text-3xl font-bold text-foreground">
              Available Cars
            </h2>
            <Suspense
              fallback={
                <div className="animate-pulse bg-gray-200 dark:bg-navy-700 h-10 w-48 rounded-lg" />
              }
            >
              <CarFilters />
            </Suspense>
          </div>

          <Suspense fallback={<Loading />}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {cars.map((car) => (
                <CarCard
                  key={car.id}
                  car={{
                    ...car,
                    pricePerDay: car.pricePerDay.toString(),
                  }}
                />
              ))}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex gap-2">
                  {Array.from({ length: pages }, (_, i) => i + 1).map(
                    (pageNum) => (
                      <Link
                        key={pageNum}
                        href={{
                          pathname: '/dashboard',
                          query: { ...searchParams, page: pageNum },
                        }}
                        className={cn(
                          'px-4 py-2 rounded-lg transition-colors',
                          pageNum ===
                            parseInt(searchParams.page?.toString() || '1')
                            ? 'bg-blue-600 dark:bg-blue-700 text-white'
                            : 'bg-white dark:bg-navy-800 text-gray-700 dark:text-gray-300',
                          'hover:bg-gray-50 dark:hover:bg-navy-700'
                        )}
                      >
                        {pageNum}
                      </Link>
                    )
                  )}
                </nav>
              </div>
            )}
          </Suspense>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error in DashboardPage:', error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">
            Something went wrong
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please try again later
          </p>
          <Link
            href="/"
            className="inline-block btn-primary px-6 py-2 rounded-lg"
          >
            Go Home
          </Link>
        </div>
      </div>
    )
  }
}
