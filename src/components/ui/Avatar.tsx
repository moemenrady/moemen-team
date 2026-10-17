import React from "react";
import Image from "next/image";
import { User } from "lucide-react";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg";
}

export function Avatar({ src, alt = "", fallback, size = "md" }: AvatarProps) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-base",
  };

  return (
    <div className={`${sizes[size]} relative flex items-center justify-center rounded-full bg-gray-800 overflow-hidden shrink-0`}>
      {src ? (
        <Image src={src} alt={alt} fill className="object-cover" />
      ) : fallback ? (
        <span className="font-medium text-gray-300">{fallback}</span>
      ) : (
        <User className="text-gray-500" size={size === "sm" ? 16 : size === "md" ? 20 : 28} />
      )}
    </div>
  );
}
