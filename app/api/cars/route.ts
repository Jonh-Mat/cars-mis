import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    const car = await prisma.car.create({
      data: {
        make: data.make,
        model: data.model,
        year: data.year,
        color: data.color,
        transmission: data.transmission,
        driveType: data.driveType,
        fuelEfficiency: data.fuelEfficiency,
        pricePerDay: data.pricePerDay,
        imageUrl: data.imageUrl,
        isAvailable: true,
      },
    });

    return NextResponse.json(car);
  } catch (error) {
    console.error("Error creating car: ", error);
    return NextResponse.json({ error: "Error creating car" }, { status: 500 });
  }
}
