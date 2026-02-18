"use client"

import { memo, type ElementType, type ReactNode } from "react"
import { cn } from "@/lib/utils"

interface ShimmerProps {
  children: ReactNode
  as?: ElementType
  duration?: number
  className?: string
}

export const Shimmer = memo(function Shimmer({
  children,
  as: Tag = "span",
  duration = 2,
  className,
}: ShimmerProps) {
  return (
    <Tag
      className={cn(
        "inline-block bg-[length:200%_100%] bg-clip-text text-transparent",
        "bg-gradient-to-r from-current via-current/40 to-current",
        "animate-[shimmer_var(--shimmer-duration)_ease-in-out_infinite]",
        className
      )}
      style={
        {
          "--shimmer-duration": `${duration}s`,
        } as React.CSSProperties
      }
    >
      {children}
    </Tag>
  )
})
