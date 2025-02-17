"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ReservationStatus } from "@prisma/client";

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
        return "text-green-600 bg-green-100";
      case "Reserved":
      case "Currently Rented":
        return "text-red-600 bg-red-100";
      case "Reservation in Progress":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Car Image */}
      <div className="relative h-48 bg-gray-100">
        <Image
          src={car.imageUrl || "/placeholder-car.png"}
          alt={`${car.make} ${car.model}`}
          fill
          style={{ objectFit: "contain" }}
          className="p-2"
        />
      </div>

      {/* Car Details */}
      <div className="p-6">
        {/* Car Title */}
        <h3 className="text-xl font-semibold mb-3">
          {car.make} {car.model}
        </h3>

        {/* Car Specs */}
        <div className="flex items-center gap-4 mb-3">
          <span className="inline-flex items-center text-sm text-gray-600">
            <svg
              className="w-5 h-5 mr-1"
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
            {car.year}
          </span>
          <span className="inline-flex items-center text-sm text-gray-600">
            <svg
              className="w-5 h-5 mr-1"
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
            {car.transmission}
          </span>
        </div>

        {/* Availability Status */}
        <div className="mb-3">
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}
          >
            {getAvailabilityMessage()}
          </span>
        </div>

        {/* Current Date if provided */}
        {currentDate && (
          <div className="mb-3">
            <p className="text-sm text-gray-600">Date: {currentDate}</p>
          </div>
        )}

        {/* Price and Reserve Button */}
        <div className="flex justify-between items-center mt-4">
          <span className="text-lg font-bold text-blue-600">
            ${Number(car.pricePerDay).toFixed(2)}/day
          </span>
          {showReserveButton && (
            <button
              onClick={() => router.push(`/cars/${car.id}`)}
              disabled={!isCarAvailable()}
              className={`px-4 py-2 rounded-full text-sm transition-colors
                ${
                  isCarAvailable()
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
            >
              {isCarAvailable() ? "Reserve Now" : "Not Available"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
