import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { notFound } from "next/navigation";
import BackButton from "@/components/BackButton";
import CarCreateForm from "@/components/CarCreateForm";

export default async function CarCreatePage() {
  const session = await getServerSession(authOptions);
  const currentDate = "2025-02-13 20:07:06";
  const userName = "Jonh-Mat";

  // Check if user is admin
  if (!session?.user || session.user.role !== "ADMIN") {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <BackButton />
          </div>

          {/* Car Creation Form */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h1 className="text-2xl font-bold mb-6">Create New Car</h1>
            <CarCreateForm />
          </div>
        </div>
      </div>
    </div>
  );
}
