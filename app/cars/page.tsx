import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import CarCard from "@/components/CarCard";
import { notFound } from "next/navigation";
import BackButton from "@/components/BackButton";
import SearchBar from "@/components/SearchBar";
import { Prisma } from "@prisma/client";

type SearchParams = {
  search?: string;
};

// Get user's rented cars
async function getUserRentedCars(userId: string) {
  try {
    const rentedCars = await prisma.car.findMany({
      where: {
        reservations: {
          some: {
            userId: userId,
            status: {
              in: ["CONFIRMED", "PENDING"],
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
              in: ["CONFIRMED", "PENDING"],
            },
          },
          orderBy: {
            createdAt: "desc",
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
        createdAt: "desc",
      },
    });

    return rentedCars.map((car) => ({
      ...car,
      pricePerDay: car.pricePerDay.toString(),
    }));
  } catch (error) {
    console.error("Error fetching rented cars:", error);
    return [];
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
                    mode: "insensitive",
                  },
                },
                {
                  model: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              ],
            }
          : {},
      ],
    };

    const cars = await prisma.car.findMany({
      where,
      include: {
        reservations: {
          where: {
            OR: [
              { status: "CONFIRMED" },
              {
                AND: [
                  { status: "PENDING" },
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
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Filter available cars
    const availableCars = cars.filter((car) => {
      const hasConfirmedReservation = car.reservations.some(
        (res) => res.status === "CONFIRMED"
      );

      const hasPendingReservation = car.reservations.some((res) => {
        if (res.status === "PENDING") {
          const minutesAgo =
            (new Date().getTime() - new Date(res.createdAt).getTime()) /
            1000 /
            60;
          return minutesAgo < 30;
        }
        return false;
      });

      return !hasConfirmedReservation && !hasPendingReservation;
    });

    return availableCars.map((car) => ({
      ...car,
      pricePerDay: car.pricePerDay.toString(),
    }));
  } catch (error) {
    console.error("Error fetching cars:", error);
    return [];
  }
}

export default async function CarsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return notFound();
  }

  const [rentedCars, availableCars] = await Promise.all([
    getUserRentedCars(session.user.id),
    getCars(searchParams.search),
  ]);

  const currentDate = new Date().toISOString().slice(0, 19).replace("T", " ");
  const userName = session.user.name || session.user.email || "Unknown User";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <BackButton />
        </div>
        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar />
        </div>

        {/* Rented Cars Section */}
        {rentedCars.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Your Rented Cars</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {rentedCars.map((car) => (
                <CarCard
                  key={car.id}
                  car={{
                    ...car,
                    isRented: true,
                  }}
                  showReserveButton={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* Available Cars Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Available Cars</h2>
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
              />
            ))}
          </div>

          {availableCars.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No cars found matching your search.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
