"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import { useRouter } from "next/navigation";
import "react-datepicker/dist/react-datepicker.css";
import { differenceInDays } from "date-fns";
import toast from "react-hot-toast";

type ReservationFormProps = {
  carId: string;
  priceParDay: number;
  userId: string;
  existingReservations: any[];
};

export default function ReservationForm({
  carId,
  priceParDay,
  userId,
  existingReservations,
}: ReservationFormProps) {
  const router = useRouter();
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) return;

    setIsLoading(true);
    setError("");

    try {
      const days = differenceInDays(endDate, startDate);
      const totalPrice = days * priceParDay;

      const response = await fetch("/api/revervations", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          carId,
          userId,
          startDate,
          endDate,
          totalPrice,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create reservation");
      }

      //Redirect to cars page
      router.push("/cars");
      toast.success("Car reserved!!!");
      router.refresh();
    } catch (error) {
      setError("Something went wrong. Please try again!!!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <DatePicker
            selected={startDate}
            onChange={setStartDate}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            minDate={new Date()}
            dateFormat="MMMM d, yyyy"
            className="w-full px-3 py-2 border
            rounded-lg"
            placeholderText="Select start date"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <DatePicker
            selected={endDate}
            onChange={setEndDate}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate || new Date()}
            dateFormat="MMMM d, yyyy"
            className="w-full px-3 py-2 border rounded-lg"
            placeholderText="Select end date"
          />
        </div>
      </div>

      {startDate && endDate && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-lg font-semibold">
            Total Price: $
            {(differenceInDays(endDate, startDate) * priceParDay).toFixed(2)}
          </p>
          <p className="text-sm text-gray-500">
            {differenceInDays(endDate, startDate)} days at ${priceParDay}/day
          </p>
        </div>
      )}
      {error && <div className="text-red-600 text-sm">{error}</div>}

      <button
        type="submit"
        disabled={isLoading || !startDate || !endDate}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Creating Reservation..." : "Confirm Reservation"}
      </button>
    </form>
  );
}
