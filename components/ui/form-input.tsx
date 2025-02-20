import { cn } from "@/lib/utils";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function FormInput({
  label,
  error,
  className,
  ...props
}: FormInputProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <input
        className={cn(
          "w-full px-4 py-2 rounded-lg",
          "border border-gray-200 dark:border-navy-700",
          "bg-white dark:bg-navy-800",
          "text-gray-900 dark:text-white",
          "placeholder:text-gray-500 dark:placeholder:text-gray-400",
          "focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400",
          "focus:border-blue-500 dark:focus:border-blue-400",
          "outline-none transition-colors",
          error && "border-red-500 focus:ring-red-500 focus:border-red-500",
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
