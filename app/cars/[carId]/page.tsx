import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import ReservationForm from "@/components/Reservation";
import { BackButton } from "@/components/BackButton";
import { cn } from "@/lib/utils";
import { PageContainer } from "@/components/ui/PageContainer";

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
    <PageContainer className="max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-8 p-4 bg-gray-50 dark:bg-navy-900/50 rounded-xl border border-gray-200 dark:border-navy-700">
        <BackButton />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Reserve {car.make} {car.model}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Complete your reservation details below
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Car Image and Details */}
        <div className="space-y-6">
          <div className="relative h-64 rounded-xl overflow-hidden bg-gray-100 dark:bg-navy-900/50">
            <Image
              src={car.imageUrl || "/placeholder-car.png"}
              alt={`${car.make} ${car.model}`}
              fill
              style={{ objectFit: "cover" }}
              className="transition-transform duration-300 hover:scale-105"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Year", value: car.year },
              { label: "Transmission", value: car.transmission },
              { label: "Drive Type", value: car.driveType },
              {
                label: "Price per day",
                value: `$${Number(car.pricePerDay).toFixed(2)}`,
                highlight: true,
              },
            ].map((detail) => (
              <div
                key={detail.label}
                className="bg-gray-50 dark:bg-navy-900/50 p-4 rounded-lg border border-gray-200 dark:border-navy-700"
              >
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {detail.label}
                </p>
                <p
                  className={cn(
                    "font-semibold",
                    detail.highlight
                      ? "text-blue-600 dark:text-blue-400 text-lg"
                      : "text-gray-900 dark:text-white"
                  )}
                >
                  {detail.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Reservation Form */}
        <div className="bg-gray-50 dark:bg-navy-900/50 rounded-xl p-6 border border-gray-200 dark:border-navy-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Reservation Details
          </h2>
          <ReservationForm
            carId={car.id}
            priceParDay={parseFloat(car.pricePerDay)}
            userId={session.user.id}
            existingReservations={car.reservations}
          />
        </div>
      </div>
    </PageContainer>
  );
}
