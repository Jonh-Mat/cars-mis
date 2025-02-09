"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function CarFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState({
    make: searchParams.get("make") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    transmission: searchParams.get("transmission") || "",
    year: searchParams.get("year") || "",
  });

  const handleFilter = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);

    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }

    router.push(`/dashboard?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-4">
      <select
        name="make"
        value={filters.make}
        onChange={handleFilter}
        className="px-4 py-2 rounded-lg border border-gray-300"
      >
        <option value="">All Makes</option>
        {/* Add car makes dynamically */}
      </select>

      <select
        name="transmission"
        value={filters.transmission}
        onChange={handleFilter}
        className="px-4 py-2 rounded-lg border border-gray-300"
      >
        <option value="">All Transmissions</option>
        <option value="AUTOMATIC">Automatic</option>
        <option value="MANUAL">Manual</option>
      </select>

      <input
        type="number"
        name="minPrice"
        placeholder="Min Price"
        value={filters.minPrice}
        onChange={handleFilter}
        className="px-4 py-2 rounded-lg border border-gray-300"
      />

      <input
        type="number"
        name="maxPrice"
        placeholder="Max Price"
        value={filters.maxPrice}
        onChange={handleFilter}
        className="px-4 py-2 rounded-lg border border-gray-300"
      />
    </div>
  );
}
