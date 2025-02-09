import Image from "next/image";
import Link from "next/link";
import { Car } from "@prisma/client";

export default function CarCard({ car }: { car: Car }) {
  return (
    <div className="bg-white rounded-x1 shadow-sm hover:shadow-md transition overflow-hidden group">
      <div className="relative h-48 bg-gray-100 group-hover:bg-gray-200 transition">
        <Image
          src={car.imageUrl || "/placeholder-car.png"}
          alt={`${car.make} ${car.model}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: "contain" }}
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">
          {car.make} {car.model}
        </h3>
        <div className="flex items-center gap-4 mb-4">
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
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-blue-600">
            ${Number(car.pricePerDay).toFixed(2)}/day
          </span>
          <Link
            href={`/cars/${car.id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-700 transition"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
