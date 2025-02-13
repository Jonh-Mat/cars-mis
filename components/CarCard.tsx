"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

type CarCardProps = {
  car: {
    id: string;
    make: string;
    model: string;
    year: number;
    transmission: string;
    pricePerDay: string;
    imageUrl: string | null;
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

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Car Image */}
      <div className="relative h-48 bg-gray-100">
        <Image
          src={car.imageUrl || "/placeholder-car.png"}
          alt={`${car.make} ${car.model}`}
          fill
          style={{ objectFit: "contain" }}
          className="p-2" // Added padding to the image
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
              className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-700 transition-colors"
            >
              Reserve Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
