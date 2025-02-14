"use client";

import { TransmissionType, DriveType } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CarCreateForm() {
  const router = useRouter();
  const [isLoading, setIsLoasding] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoasding(true);
    setError("");

    try {
      const formData = new FormData(e.currentTarget);

      //if we have an image file, upload it first
      let imageUrl = null;
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append("file", imageFile);

        const imageUploadRes = await fetch("/api/upload", {
          method: "POST",
          body: imageFormData,
        });

        if (!imageUploadRes.ok) throw new Error("Failed to upload image");
        const imageData = await imageUploadRes.json();
        imageUrl = imageData.url;
      }

      // Create the car with all details including te image URL
      const carData = {
        make: formData.get("make"),
        model: formData.get("model"),
        year: parseInt(formData.get("year") as string),
        color: formData.get("color"),
        transmission: formData.get("transmission"),
        driveType: formData.get("driveType"),
        fuelEfficiency: parseFloat(formData.get("fuelEfficiency") as string),
        pricePerDay: parseFloat(formData.get("pricePerDay") as string),
        imageUrl,
        isAvailable: true,
      };

      const response = await fetch("/api/cars", {
        method: "POST",
        headers: {
          "content-Type": "application/json",
        },
        body: JSON.stringify(carData),
      });

      if (!response.ok) throw new Error("Failed to create car");

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoasding(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Image Upload */}
        <div className="space-y-2">
          <label className="block text-lg font-semibold text-gray-900">
            Car Image
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-blue-500 transition-colors">
            <div className="space-y-1 text-center">
              {imagePreview ? (
                <div className="relative h-48 w-full mb-4">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    style={{ objectFit: "contain" }}
                  />
                </div>
              ) : (
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
              <div className="flex text-sm text-gray-600 justify-center">
                <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                  <span>Upload a file</span>
                  <input
                    type="file"
                    name="image"
                    className="sr-only"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Make
              </label>
              <input
                type="text"
                name="make"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="e.g., Toyota"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Model
              </label>
              <input
                type="text"
                name="model"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="e.g., Camry"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Year
              </label>
              <input
                type="number"
                name="year"
                min="1900"
                max="2025"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="e.g., 2023"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Color
              </label>
              <input
                type="text"
                name="color"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="e.g., Silver"
              />
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Technical Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Transmission
              </label>
              <select
                name="transmission"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
              >
                <option value="">Select Transmission</option>
                {Object.values(TransmissionType).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Drive Type
              </label>
              <select
                name="driveType"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
              >
                <option value="">Select Drive Type</option>
                {Object.values(DriveType).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Fuel Efficiency (MPG)
              </label>
              <input
                type="number"
                name="fuelEfficiency"
                step="0.1"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="e.g., 25.5"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Price Per Day ($)
              </label>
              <input
                type="number"
                name="pricePerDay"
                step="0.01"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="e.g., 50.00"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                <span>Creating...</span>
              </div>
            ) : (
              "Create Car"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
