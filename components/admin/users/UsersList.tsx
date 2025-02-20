"use client";

import { User, Reservation } from "@prisma/client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

type UserWithDetails = User & {
  _count: {
    reservations: number;
  };
  reservations: Reservation[];
};

export default function UsersList({
  users: initialUsers,
}: {
  users: UserWithDetails[];
}) {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState<string | null>(null); // Track which user is being updated
  const router = useRouter();

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const handleRoleChange = async (
    userId: string,
    newRole: "USER" | "ADMIN"
  ) => {
    try {
      setIsLoading(userId);

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update user role");
      }

      if (data.success) {
        setUsers(
          users.map((user) =>
            user.id === userId ? { ...user, role: newRole } : user
          )
        );
        toast.success("User role updated successfully");
      } else {
        throw new Error(data.message || "Failed to update user role");
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update user role"
      );
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white dark:bg-navy-800 rounded-lg shadow-sm border border-gray-200 dark:border-navy-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setSearchTerm("")}
            disabled={!searchTerm}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-navy-800 rounded-lg shadow-sm border border-gray-200 dark:border-navy-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-navy-900/50">
                {["User", "Role", "Reservations", "Joined", "Actions"].map(
                  (header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-navy-700">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 dark:hover:bg-navy-900/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-400 font-medium">
                            {(user.name || user.email)[0].toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.name || "Anonymous"}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(
                          user.id,
                          e.target.value as "USER" | "ADMIN"
                        )
                      }
                      disabled={isLoading === user.id}
                      className={cn(
                        "text-sm rounded-md border-gray-300 dark:border-navy-700",
                        "bg-white dark:bg-navy-800",
                        "text-gray-900 dark:text-white",
                        "focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        "transition-colors"
                      )}
                    >
                      <option value="USER">User</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {user._count.reservations} reservations
                    </div>
                    {user.reservations[0] && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Last:{" "}
                        {new Date(
                          user.reservations[0].createdAt
                        ).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Button
                      variant="ghost"
                      onClick={() => router.push(`/admin/users/${user.id}`)}
                    >
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400">
              No users found matching your search.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
