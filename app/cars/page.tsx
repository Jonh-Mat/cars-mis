import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import CarCard from "@/components/CarCard";
import { notFound } from "next/navigation";
import BackButton from "@/components/BackButton";

// Get all available cars
async function getCars() {
  try {
    const cars = await prisma.car.findMany({
      where: {
        isAvailable: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return cars.map((car) => ({
      ...car,
      pricePerDay: car.pricePerDay.toString(),
    }));
  } catch (error) {
    console.error("Error fetching cars:", error);
    return [];
  }
}

export default async function CarsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return notFound();
  }

  const cars = await getCars();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <BackButton />
        </div>
        <h1 className="text-3xl font-bold mb-8">Available Cars</h1>
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
      </div>
    </div>
  );
}
