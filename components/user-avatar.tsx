"use client"

import React from "react"
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar"
import { cn } from "@/lib/utils"

interface UserAvatarProps {
  name: string
  email: string
  image?: string | null
  size?: "default" | "sm" | "lg"
  orientation?: "horizontal" | "vertical"
  className?: string
  showEmail?: boolean
}

const UserAvatar = ({
  name,
  email,
  image,
  size = "default",
  orientation = "horizontal",
  className,
  showEmail = true,
}: UserAvatarProps) => {
  // Get initials from name
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.charAt(0).toUpperCase()
  }

  const avatarContent = (
    <Avatar
      size={size}
      className={cn(orientation === "vertical" && "mx-auto", className)}
    >
      <AvatarImage src={image || ""} alt={name} />
      <AvatarFallback>{getInitials(name)}</AvatarFallback>
    </Avatar>
  )

  const textContent = (
    <div
      className={cn(
        "grid text-sm leading-tight",
        orientation === "horizontal" ? "flex-1 text-start" : "text-center"
      )}
    >
      <span className="truncate font-semibold">{name}</span>
      {showEmail && (
        <span className="text-muted-foreground truncate text-xs">{email}</span>
      )}
    </div>
  )

  if (orientation === "vertical") {
    return (
      <div className={cn("flex flex-col items-center gap-2 py-1", className)}>
        {avatarContent}
        {textContent}
      </div>
    )
  }

  return (
    <div className={cn("flex items-center gap-3 py-1", className)}>
      {avatarContent}
      {textContent}
    </div>
  )
}

export default UserAvatar
