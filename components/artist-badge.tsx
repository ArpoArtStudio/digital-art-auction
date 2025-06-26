"use client"

import { cn } from "@/lib/utils"
import { ArtistBadge as ArtistBadgeType } from "@/lib/artist-utils"

interface ArtistBadgeProps {
  badge: ArtistBadgeType
  size?: "sm" | "md" | "lg"
  className?: string
}

export function ArtistBadge({ badge, size = "md", className }: ArtistBadgeProps) {
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5", 
    lg: "text-base px-4 py-2"
  }

  const iconSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  }

  const badgeStyles = {
    blue: "bg-blue-500 text-white border-blue-600",
    red: "bg-red-500 text-white border-red-600", 
    gold: "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-yellow-500",
    platinum: "bg-gradient-to-r from-slate-200 via-white to-slate-200 text-slate-800 border-slate-300"
  }

  const glowClasses = badge.glowEffect 
    ? "shadow-lg shadow-white/50 animate-pulse ring-2 ring-white/30" 
    : ""

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 rounded-full border font-medium transition-all",
      sizeClasses[size],
      badgeStyles[badge.type],
      glowClasses,
      className
    )}
    title={badge.description}>
      <span className={iconSizes[size]}>
        {badge.icon}
      </span>
      <span>{badge.label}</span>
    </div>
  )
}
