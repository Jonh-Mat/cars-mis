import { cn } from "@/lib/utils";
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
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "COMPLETED":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <div
      className={cn(
        "rounded-xl",
        "bg-white/60 dark:bg-navy-800/60",
        "backdrop-blur-sm",
        "border border-gray-200 dark:border-navy-700",
        "shadow-sm",
        "dark:shadow-navy-900/50",
        "p-6"
      )}
    >
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Recent Activities
      </h2>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className={cn(
              "flex items-center justify-between p-4 rounded-lg",
              "bg-gray-50 dark:bg-navy-900/50",
              "transition-colors duration-300"
            )}
          >
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {activity.user.name || "Anonymous"} reserved {activity.car.make}{" "}
                {activity.car.model}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatDistanceToNow(activity.createdAt, { addSuffix: true })}
              </p>
            </div>
            <span
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium",
                getStatusStyle(activity.status)
              )}
            >
              {activity.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
