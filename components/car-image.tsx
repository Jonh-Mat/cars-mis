"use client";

import Image from "next/image";
import { useState } from "react";

interface CarImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function CarImage({ src, alt, className = "" }: CarImageProps) {
  const [error, setError] = useState(false);

  return (
    <Image
      src={error ? "/placeholder-car.png" : src}
      alt={alt}
      fill
      style={{ objectFit: "contain" }}
      onError={() => setError(true)}
      className={className}
    />
  );
}
