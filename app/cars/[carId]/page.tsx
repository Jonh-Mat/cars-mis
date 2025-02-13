import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import ReservationForm from "@/components/Reservation";
import BackButton from "@/components/BackButton";

async function getCarById(carId: string) {
  try {
    const car = await prisma.car.findUnique({
      where: { id: carId },
      include: {
        reservations: {
          where: {
            endDate: {
              gte: new Date(),
            },
          },
        },
      },
    });

    if (!car) return null;

    return {
      ...car,
      pricePerDay: car.pricePerDay.toString(),
    };
  } catch (error) {
    console.error("Error fetching car:", error);
    return null;
  }
}

export default async function CarDetailsPage({
  params,
}: {
  params: { carId: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return notFound();
  }

  const car = await getCarById(params.carId);

  if (!car) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm">
          <div className="mb-6">
            <BackButton />
          </div>
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">
              Reserve {car.make} {car.model}
            </h1>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Car Image and Details */}
              <div>
                <div className="relative h-64 rounded-lg overflow-hidden mb-4">
                  <Image
                    src={car.imageUrl || "/placeholder-car.png"}
                    alt={`${car.make} ${car.model}`}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    <span className="font-medium">Year:</span> {car.year}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Transmission:</span>{" "}
                    {car.transmission}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Drive Type:</span>{" "}
                    {car.driveType}
                  </p>
                  <p className="text-blue-600 font-bold">
                    ${Number(car.pricePerDay).toFixed(2).toString()} per day
                  </p>
                </div>
              </div>

              {/* Reservation Form */}
              <ReservationForm
                carId={car.id}
                priceParDay={parseFloat(car.pricePerDay)}
                userId={session.user.id}
                existingReservations={car.reservations}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
