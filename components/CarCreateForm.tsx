"use client";

import { TransmissionType, DriveType } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "./ui/button";
import { FormInput } from "./ui/form-input";
import { FormSelect } from "./ui/form-select";
import { cn } from "@/lib/utils";

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
      toast.success("Car created successfully");
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
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <svg
              className="w-6 h-6 text-gray-600 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <label className="block text-lg font-semibold text-gray-900 dark:text-white">
              Car Image
            </label>
          </div>
          <div
            className={cn(
              "mt-1 flex justify-center px-6 pt-5 pb-6",
              "border-2 border-dashed rounded-xl",
              "border-gray-200 dark:border-navy-700",
              "hover:border-blue-500 dark:hover:border-blue-400",
              "transition-colors",
              "bg-gray-50 dark:bg-navy-900/50"
            )}
          >
            <div className="space-y-3 text-center">
              {imagePreview ? (
                <div className="relative h-48 w-full mb-4">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    style={{ objectFit: "contain" }}
                    className="rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setImageFile(null);
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                  >
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Drag and drop your image here, or
                  </p>
                </div>
              )}
              <div className="flex justify-center text-sm">
                <label
                  className={cn(
                    "relative cursor-pointer rounded-md font-medium",
                    "text-blue-600 dark:text-blue-400",
                    "hover:text-blue-500 dark:hover:text-blue-300",
                    "focus-within:outline-none focus-within:ring-2",
                    "focus-within:ring-blue-500 dark:focus-within:ring-blue-400",
                    "focus-within:ring-offset-2"
                  )}
                >
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
              <p className="text-xs text-gray-500 dark:text-gray-400">
                PNG, JPG, GIF up to 10MB
              </p>
            </div>
          </div>
        </div>{" "}
        {/* Basic Information */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              label="Make"
              name="make"
              required
              placeholder="e.g., Toyota"
            />
            <FormInput
              label="Model"
              name="model"
              required
              placeholder="e.g., Camry"
            />
            <FormInput
              label="Year"
              name="year"
              type="number"
              min="1900"
              max="2025"
              required
              placeholder="e.g., 2023"
            />
            <FormInput
              label="Color"
              name="color"
              required
              placeholder="e.g., Silver"
            />
          </div>
        </div>
        {/* Technical Details */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Technical Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormSelect
              label="Transmission"
              name="transmission"
              required
              options={Object.values(TransmissionType).map((type) => ({
                value: type,
                label: type,
              }))}
            />
            <FormSelect
              label="Drive Type"
              name="driveType"
              required
              options={Object.values(DriveType).map((type) => ({
                value: type,
                label: type,
              }))}
            />
            <FormInput
              label="Fuel Efficiency (MPG)"
              name="fuelEfficiency"
              type="number"
              step="0.1"
              required
              placeholder="e.g., 25.5"
            />
            <FormInput
              label="Price Per Day ($)"
              name="pricePerDay"
              type="number"
              step="0.01"
              required
              placeholder="e.g., 50.00"
            />
          </div>
        </div>
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  {/* ... Loading SVG remains the same ... */}
                </svg>
                <span>Creating...</span>
              </div>
            ) : (
              "Create Car"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
