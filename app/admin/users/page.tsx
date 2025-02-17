import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BackButton from "@/components/BackButton";
import UsersList from "@/components/admin/users/UsersList";

async function getUsers() {
  return await prisma.user.findMany({
    include: {
      _count: {
        select: {
          reservations: true,
        },
      },
      reservations: {
        take: 1,
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export default async function UsersManagementPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return notFound();
  }

  const users = await getUsers();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-6">
          <div className="space-y-4">
            <BackButton />
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Users Management
                </h1>
                <p className="text-sm text-gray-600">
                  Current User's Login: {session.user.name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <UsersList users={users} />
      </div>
    </div>
  );
}
