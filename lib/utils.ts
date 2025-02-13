import { Car } from "@prisma/client";

export function serializeCarData(car: Car) {
  return {
    ...car,
    pricePerDay: car.pricePerDay.toString(),
    createdAt: car.createdAt.toISOString(),
    updatedAt: car.updatedAt.toISOString(),
  };
}
