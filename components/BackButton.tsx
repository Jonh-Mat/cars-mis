"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ButtonProps } from "@/components/ui/button";

interface BackButtonProps extends ButtonProps {}

export function BackButton({
  className,
  variant = "outline",
  ...props
}: BackButtonProps) {
  const router = useRouter();

  return (
    <Button
      variant={variant}
      onClick={() => router.back()}
      className={className}
      {...props}
    >
      <svg
        className="w-4 h-4 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      Back
    </Button>
  );
}
