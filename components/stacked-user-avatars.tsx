"use client"

import React from "react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarGroup,
  AvatarGroupCount,
} from "@/components/ui/avatar"
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export type StackedUserAvatarsUser = {
  id: string
  name: string
  image?: string | null
  email?: string | null
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export type StackedUserAvatarsProps = {
  users: StackedUserAvatarsUser[]
  size?: "sm" | "default" | "lg"
  maxVisible?: number
  className?: string
  popoverTitle?: string
}

export function StackedUserAvatars({
  users,
  size = "sm",
  maxVisible = 3,
  className,
  popoverTitle,
}: StackedUserAvatarsProps) {
  if (users.length === 0) return null

  const visible = users.slice(0, maxVisible)
  const overflowCount = users.length - maxVisible

  const avatarSizeClass =
    size === "sm"
      ? "size-6"
      : size === "lg"
        ? "size-10"
        : "size-8"

  return (
    <Popover>
      <PopoverTrigger
        type="button"
        className={cn(
          "focus-visible:ring-ring inline-flex cursor-pointer items-center rounded-full focus-visible:outline-none focus-visible:ring-2",
          className
        )}
        aria-label={
          users.length === 1
            ? `Assigned to ${users[0].name}`
            : `Assigned to ${users.length} people`
        }
      >
        <AvatarGroup className="*:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background">
            {visible.map((user) => (
              <Avatar
                key={user.id}
                size={size}
                className={cn(avatarSizeClass, "ring-2 ring-background")}
              >
                {user.image ? (
                  <AvatarImage src={user.image} alt={user.name} />
                ) : null}
                <AvatarFallback className="text-xs">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
            ))}
            {overflowCount > 0 && (
              <AvatarGroupCount
                className={cn(
                  "ring-2 ring-background text-xs font-medium",
                  size === "sm" && "size-6",
                  size === "lg" && "size-10"
                )}
              >
                +{overflowCount}
              </AvatarGroupCount>
            )}
          </AvatarGroup>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-0" sideOffset={8}>
        {popoverTitle && (
          <PopoverHeader className="border-b px-3 py-2">
            <PopoverTitle className="text-xs font-medium text-muted-foreground">
              {popoverTitle}
            </PopoverTitle>
          </PopoverHeader>
        )}
        <ul className="max-h-56 overflow-auto py-2">
          {users.map((user) => (
            <li
              key={user.id}
              className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted/50"
            >
              <Avatar size="sm" className="size-8 shrink-0">
                {user.image ? (
                  <AvatarImage src={user.image} alt={user.name} />
                ) : null}
                <AvatarFallback className="text-xs">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{user.name}</p>
                {user.email && (
                  <p className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
