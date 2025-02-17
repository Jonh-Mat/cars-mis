import Link from "next/link";

export default function AdminQuickAtcions() {
  const actions = [
    {
      title: "Manage Users",
      description: "View and manage user accounts",
      href: "/admin/users",
      icon: "users",
    },
    {
      title: "Pending Reservations",
      description: "Review and approve reservations",
      href: "/admin/reservations",
      icon: "calendar",
    },
    {
      title: "Reports",
      description: "View financial and usage reports",
      href: "/admin/reports",
      icon: "chart",
    },
    {
      title: "Settings",
      description: "Configure system settings",
      href: "/admin/settings",
      icon: "settings",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      <div className="space-y-4">
        {actions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="flex items-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {/* Icon here */}
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">
                {action.title}
              </h3>
              <p className="text-sm text-gray-500">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
