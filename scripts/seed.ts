import { PrismaClient, TransmissionType, DriveType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create some sample cars
  const cars = [
    {
      make: "Toyota",
      model: "Fortuner",
      year: 2023,
      color: "White",
      transmission: "AUTOMATIC" as TransmissionType,
      driveType: "AWD" as DriveType,
      fuelEfficiency: 26,
      pricePerDay: 150.0,
      imageUrl: "/cars/fortuner.png",
      isAvailable: true,
    },
    {
      make: "Hyundai",
      model: "Creta",
      year: 2023,
      color: "Silver",
      transmission: "AUTOMATIC" as TransmissionType,
      driveType: "FWD" as DriveType,
      fuelEfficiency: 28,
      pricePerDay: 120.0,
      imageUrl: "/cars/creta.png",
      isAvailable: true,
    },
    {
      make: "Nissan",
      model: "X-Trail",
      year: 2023,
      color: "Black",
      transmission: "MANUAL" as TransmissionType,
      driveType: "AWD" as DriveType,
      fuelEfficiency: 25,
      pricePerDay: 140.0,
      imageUrl: "/cars/x-trail.png",
      isAvailable: true,
    },
  ];

  for (const carData of cars) {
    await prisma.car.create({
      data: carData,
    });
  }

  console.log("Cars seeded successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export {};
