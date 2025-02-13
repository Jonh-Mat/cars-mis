import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { Car, Prisma, TransmissionType } from "@prisma/client";
import { Suspense } from "react";
import CarFilters from "@/components/CarFilters";
import CarCard from "@/components/CarCard";
import Loading from "@/components/Loading";
import { SearchParamsType } from "@/types";

// Helper function to safely parse search params
function parseSearchParams(searchParams: SearchParamsType) {
  return {
    make: searchParams?.make || "",
    model: searchParams?.model || "",
    minPrice: searchParams?.minPrice || "",
    maxPrice: searchParams?.maxPrice || "",
    transmission: searchParams?.transmission as TransmissionType | undefined,
    year: searchParams?.year || "",
    page: Number(searchParams?.page) || 1,
    limit: Number(searchParams?.limit) || 12,
  };
}

// Improved car fetching with filtering and pagination
async function getCars(searchParams: SearchParamsType) {
  // Parse search params safely
  const { make, model, minPrice, maxPrice, transmission, year, page, limit } =
    parseSearchParams(searchParams);

  const where: Prisma.CarWhereInput = {
    isAvailable: true,
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
  };

  const skip = (page - 1) * limit;

  try {
    const [cars, total] = await Promise.all([
      prisma.car.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.car.count({ where }),
    ]);

    return {
      cars,
      total,
      pages: Math.ceil(total / limit),
    };
  } catch (error) {
    console.error("Error fetching cars:", error);
    return {
      cars: [],
      total: 0,
      pages: 0,
    };
  }
}

type DashboardStats = {
  availableCars: number;
  activeReservations: number;
  averagePrice: number | Prisma.Decimal;
};

async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const stats = await prisma.$transaction([
      prisma.car.count({ where: { isAvailable: true } }),
      prisma.reservation.count({
        where: {
          status: "CONFIRMED",
          endDate: { gt: new Date() },
        },
      }),
      prisma.car.aggregate({
        _avg: { pricePerDay: true },
        where: { isAvailable: true },
      }),
    ]);

    return {
      availableCars: stats[0],
      activeReservations: stats[1],
      averagePrice: stats[2]._avg.pricePerDay || 0,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      availableCars: 0,
      activeReservations: 0,
      averagePrice: 0,
    };
  }
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParamsType;
}) {
  try {
    const [session, { cars, total, pages }, stats] = await Promise.all([
      getServerSession(authOptions),
      getCars(searchParams),
      getDashboardStats(),
    ]);

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="relative h-[500px] bg-gradient-to-r from-blue-600 to-blue-800 overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative container mx-auto px-4 h-full flex items-center">
            <div className="w-full lg:w-1/2 text-white z-10">
              <h1 className="text-5xl font-bold mb-6">
                Rent a car — quickly and easily!
              </h1>
              <p className="text-xl mb-8 text-gray-100">
                Streamline your car rental experience with our effortless
                booking process.
              </p>
              <div className="flex gap-4">
                <Link
                  href="/cars"
                  className="bg-white text-blue-600 px-8 py-3 rounded-full text-lg font-semibold hover:bg-gray-100 transition"
                >
                  Explore Cars
                </Link>
                {session?.user?.role === "ADMIN" && (
                  <Link
                    href="/dashboard/admin"
                    className="border-2 border-white text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-white/10 transition"
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
                  style={{ objectFit: "contain" }}
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="container mx-auto px-4 -mt-16 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-gray-500 text-sm font-medium">
                Available Cars
              </h3>
              <p className="text-3xl font-bold mt-2">{stats.availableCars}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-gray-500 text-sm font-medium">
                Active Reservations
              </h3>
              <p className="text-3xl font-bold mt-2">
                {stats.activeReservations}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-gray-500 text-sm font-medium">
                Average Price/Day
              </h3>
              <p className="text-3xl font-bold mt-2">
                ${Number(stats.averagePrice).toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Car Listings */}
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <h2 className="text-3xl font-bold">Available Cars</h2>
            <Suspense fallback={<div>Loading filters...</div>}>
              <CarFilters />
            </Suspense>
          </div>

          <Suspense fallback={<Loading />}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {cars.map((car) => (
                <CarCard
                  key={car.id}
                  car={{
                    id: car.id,
                    make: car.make,
                    model: car.model,
                    year: car.year,
                    transmission: car.transmission,
                    pricePerDay: car.pricePerDay.toString(), // Convert Decimal to string here
                    imageUrl: car.imageUrl,
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
                          pathname: "/dashboard",
                          query: { ...searchParams, page: pageNum },
                        }}
                        className={`px-4 py-2 rounded-lg ${
                          pageNum ===
                          parseInt(searchParams.page?.toString() || "1")
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
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
    );
  } catch (error) {
    console.error("Error in DashboardPage:", error);
    return <div>Something went wrong. Please try again later.</div>;
  }
}
