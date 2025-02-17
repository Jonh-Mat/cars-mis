import { Reservation, User, Car } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";

type ActivityType = Reservation & {
  user: Pick<User, "name" | "email">;
  car: Pick<Car, "make" | "model">;
};

type RecentActivitiesProps = {
  activities: ActivityType[];
};

export default function RecentActivities({
  activities,
}: RecentActivitiesProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center justify-between p-4 rounded-lg bg-gray-50"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">
                {activity.user.name || "Anonymous"} reserved {activity.car.make}{" "}
                {activity.car.model}
              </p>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(activity.createdAt, { addSuffix: true })}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                activity.status === "PENDING"
                  ? "bg-yellow-100 text-yellow-800"
                  : activity.status === "COMPLETED"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {activity.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
