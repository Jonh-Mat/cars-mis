import { cn } from "@/lib/utils";

interface FormSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
  error?: string;
}

export function FormSelect({
  label,
  options,
  error,
  className,
  ...props
}: FormSelectProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <select
        className={cn(
          "w-full px-4 py-2 rounded-lg",
          "border border-gray-200 dark:border-navy-700",
          "bg-white dark:bg-navy-800",
          "text-gray-900 dark:text-white",
          "focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400",
          "focus:border-blue-500 dark:focus:border-blue-400",
          "outline-none transition-colors",
          error && "border-red-500 focus:ring-red-500 focus:border-red-500",
          className
        )}
        {...props}
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
