import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BackButton from "@/components/BackButton";
import ReservationsList from "@/components/admin/reservations/ReservationsList";

async function getReservations() {
  return await prisma.reservation.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      car: {
        select: {
          make: true,
          model: true,
          imageUrl: true,
          isAvailable: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export default async function ReservationsManagementPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return notFound();
  }

  const reservations = await getReservations();

  // Get current date and time in UTC
  const currentDate = new Date().toISOString().replace("T", " ").slice(0, 19);

  // Get current user's name or email
  const userName = session.user.name || session.user.email || "Unknown User";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="space-y-4">
            <BackButton />
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Reservations Management
                </h1>
                <p className="text-sm text-gray-600">
                  Current User's Login: {userName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <ReservationsList reservations={reservations} />
      </div>
    </div>
  );
}
