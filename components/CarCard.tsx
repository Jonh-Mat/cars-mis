"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ReservationStatus } from "@prisma/client";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

type CarCardProps = {
  car: {
    id: string;
    make: string;
    model: string;
    year: number;
    transmission: string;
    pricePerDay: string;
    imageUrl: string | null;
    isAvailable: boolean;
    isRented?: boolean;
    reservations?: {
      status: ReservationStatus;
      createdAt: Date;
    }[];
  };
  showReserveButton?: boolean;
  currentDate?: string;
};

export default function CarCard({
  car,
  showReserveButton = true,
  currentDate,
}: CarCardProps) {
  const router = useRouter();
  const { theme } = useTheme();

  // Function to check if car is available
  const isCarAvailable = () => {
    if (!car.isAvailable) {
      return false;
    }

    if (!car.reservations || car.reservations.length === 0) {
      return true;
    }

    // Check for any CONFIRMED reservations
    const hasConfirmedReservation = car.reservations.some(
      (reservation) => reservation.status === "CONFIRMED"
    );

    // Check for recent PENDING reservations (within last 30 minutes)
    const hasPendingReservation = car.reservations.some((reservation) => {
      if (reservation.status === "PENDING") {
        const minutesAgo =
          (new Date().getTime() - new Date(reservation.createdAt).getTime()) /
          1000 /
          60;
        return minutesAgo < 30;
      }
      return false;
    });

    return !hasConfirmedReservation && !hasPendingReservation;
  };

  // Get availability status message
  const getAvailabilityMessage = () => {
    if (!car.isAvailable) {
      return "Currently Rented";
    }

    if (car.reservations?.some((res) => res.status === "CONFIRMED")) {
      return "Reserved";
    }

    if (
      car.reservations?.some((res) => {
        if (res.status === "PENDING") {
          const minutesAgo =
            (new Date().getTime() - new Date(res.createdAt).getTime()) /
            1000 /
            60;
          return minutesAgo < 30;
        }
        return false;
      })
    ) {
      return "Reservation in Progress";
    }

    return "Available";
  };

  // Get status color
  const getStatusColor = () => {
    const status = getAvailabilityMessage();
    switch (status) {
      case "Available":
        return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30";
      case "Reserved":
      case "Currently Rented":
        return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30";
      case "Reservation in Progress":
        return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30";
      default:
        return "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800";
    }
  };

  return (
    <div
      className={cn(
        "group relative",
        "bg-white dark:bg-navy-800",
        "rounded-xl shadow-sm",
        "transition-all duration-300",
        "hover:shadow-lg hover:-translate-y-1",
        "dark:shadow-navy-900/50",
        "overflow-hidden"
      )}
    >
      {/* Car Image */}
      <div className="relative h-48 bg-gray-100 dark:bg-navy-900/50">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <Image
          src={car.imageUrl || "/placeholder-car.png"}
          alt={`${car.make} ${car.model}`}
          fill
          style={{ objectFit: "contain" }}
          className="p-2 transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Car Details */}
      <div className="p-6">
        {/* Car Title */}
        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
          {car.make} {car.model}
        </h3>

        {/* Car Specs Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {[
            {
              icon: (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              ),
              value: car.year,
            },
            {
              icon: (
                <svg
                  className="w-5 h-5"
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
              ),
              value: car.transmission,
            },
          ].map((spec, index) => (
            <div
              key={index}
              className="flex items-center text-sm text-gray-600 dark:text-gray-400"
            >
              <span className="mr-2">{spec.icon}</span>
              {spec.value}
            </div>
          ))}
        </div>

        {/* Availability Status */}
        <div className="mb-4">
          <span
            className={cn(
              "px-3 py-1 rounded-full text-sm font-medium",
              getStatusColor()
            )}
          >
            {getAvailabilityMessage()}
          </span>
        </div>

        {/* Current Date if provided */}
        {currentDate && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {currentDate}
            </p>
          </div>
        )}

        {/* Price and Reserve Button */}
        <div className="flex justify-between items-center mt-6">
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Price per day
            </span>
            <p
              className={cn(
                "text-2xl font-bold",
                "bg-clip-text text-transparent",
                "bg-gradient-to-r from-blue-600 to-blue-800",
                "dark:from-blue-400 dark:to-blue-600"
              )}
            >
              ${Number(car.pricePerDay).toFixed(2)}
            </p>
          </div>

          {showReserveButton && (
            <button
              onClick={() => router.push(`/cars/${car.id}`)}
              disabled={!isCarAvailable()}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300",
                isCarAvailable()
                  ? "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
              )}
            >
              {isCarAvailable() ? "Reserve Now" : "Not Available"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
