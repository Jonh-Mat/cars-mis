import { BackButton } from "./BackButton";

interface PageHeaderProps {
  title: string;
  username: string;
  currentDate: string;
}

export function PageHeader({ title, username, currentDate }: PageHeaderProps) {
  return (
    <div className="bg-gradient-primary rounded-t-2xl text-white">
      <div className="px-6 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BackButton
                variant="ghost"
                className="text-white hover:bg-white/20"
              />
              <h1 className="text-3xl font-bold">{title}</h1>
            </div>
            <div className="flex items-center gap-2 text-blue-100">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <span>Logged in as: {username}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-blue-100 text-sm">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {currentDate}
          </div>
        </div>
      </div>
    </div>
  );
}
