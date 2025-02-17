"use client";

import { Reservation, ReservationStatus } from "@prisma/client";
import { useState } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";

type ReservationWithDetails = Reservation & {
  user: {
    name: string | null;
    email: string;
  };
  car: {
    make: string;
    model: string;
    imageUrl: string | null;
    isAvailable: boolean;
  };
};

export default function ReservationsList({
  reservations: initialReservations,
}: {
  reservations: ReservationWithDetails[];
}) {
  const [reservations, setReservations] =
    useState<ReservationWithDetails[]>(initialReservations);
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<ReservationStatus | "ALL">(
    "ALL"
  );
  const [searchTerm, setSearchTerm] = useState("");

  const handleStatusChange = async (
    reservationId: string,
    newStatus: ReservationStatus
  ) => {
    try {
      setIsLoading(reservationId);

      const response = await fetch(`/api/admin/reservations/${reservationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update status");
      }

      if (data.success) {
        setReservations((prevReservations) =>
          prevReservations.map((reservation) =>
            reservation.id === reservationId
              ? {
                  ...reservation,
                  status: newStatus,
                  car: {
                    ...reservation.car,
                    isAvailable: getCarAvailability(newStatus),
                  },
                }
              : reservation
          )
        );
        toast.success(
          data.message || `Reservation ${newStatus.toLowerCase()} successfully`
        );
      }
    } catch (error) {
      console.error("Error updating reservation:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update reservation"
      );
    } finally {
      setIsLoading(null);
    }
  };

  // Helper function to determine car availability based on status
  const getCarAvailability = (status: ReservationStatus): boolean => {
    switch (status) {
      case ReservationStatus.CONFIRMED:
        return false;
      case ReservationStatus.CANCELLED:
      case ReservationStatus.COMPLETED:
        return true;
      case ReservationStatus.PENDING:
        return true; // or whatever default value makes sense for your business logic
      default:
        return true;
    }
  };

  const getStatusColor = (status: ReservationStatus) => {
    switch (status) {
      case ReservationStatus.PENDING:
        return "bg-yellow-100 text-yellow-800";
      case ReservationStatus.CONFIRMED:
        return "bg-green-100 text-green-800";
      case ReservationStatus.CANCELLED:
        return "bg-red-100 text-red-800";
      case ReservationStatus.COMPLETED:
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter reservations based on status and search term
  const filteredReservations = reservations.filter((reservation) => {
    const matchesStatus =
      filterStatus === "ALL" || reservation.status === filterStatus;
    const matchesSearch =
      reservation.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${reservation.car.make} ${reservation.car.model}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* Filters */}
      <div className="p-6 border-b">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by user email or car..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <select
              className="w-full md:w-auto px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(e.target.value as ReservationStatus | "ALL")
              }
            >
              <option value="ALL">All Statuses</option>
              {Object.values(ReservationStatus).map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Reservations List */}
      <div className="divide-y divide-gray-200">
        {filteredReservations.length > 0 ? (
          filteredReservations.map((reservation) => (
            <div key={reservation.id} className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Car Image */}
                <div className="w-full md:w-48 h-32 relative rounded-lg overflow-hidden bg-gray-100">
                  {reservation.car.imageUrl ? (
                    <Image
                      src={reservation.car.imageUrl}
                      alt={`${reservation.car.make} ${reservation.car.model}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No image
                    </div>
                  )}
                </div>

                {/* Reservation Details */}
                <div className="flex-1 space-y-4">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-lg font-medium">
                        {reservation.car.make} {reservation.car.model}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Reserved by: {reservation.user.name || "Anonymous"} (
                        {reservation.user.email})
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        From:{" "}
                        {new Date(reservation.startDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        To: {new Date(reservation.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          reservation.status
                        )}`}
                      >
                        {reservation.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        Total: ${reservation.totalPrice.toString()}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    {reservation.status === ReservationStatus.PENDING && (
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleStatusChange(
                              reservation.id,
                              ReservationStatus.CONFIRMED
                            )
                          }
                          disabled={isLoading === reservation.id}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          {isLoading === reservation.id
                            ? "Processing..."
                            : "Confirm"}
                        </button>
                        <button
                          onClick={() =>
                            handleStatusChange(
                              reservation.id,
                              ReservationStatus.CANCELLED
                            )
                          }
                          disabled={isLoading === reservation.id}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                        >
                          {isLoading === reservation.id
                            ? "Processing..."
                            : "Cancel"}
                        </button>
                      </div>
                    )}

                    {/* Add Complete button for CONFIRMED reservations */}
                    {reservation.status === ReservationStatus.CONFIRMED && (
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleStatusChange(
                              reservation.id,
                              ReservationStatus.COMPLETED
                            )
                          }
                          disabled={isLoading === reservation.id}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                          {isLoading === reservation.id
                            ? "Processing..."
                            : "Mark as Completed"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-gray-500">
            No reservations found
          </div>
        )}
      </div>
    </div>
  );
}
