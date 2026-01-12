"use client"

import React, { useMemo, useRef, useEffect } from "react"
import { useDroppable } from "@dnd-kit/core"

import { cn } from "@/lib/utils"
import { useCalendarDndActiveEvent } from "@/components/event-calendar"

interface DroppableCellProps {
  id: string
  date: Date
  time?: number // For week/day views, represents hours (e.g., 9.25 for 9:15)
  children?: React.ReactNode
  className?: string
  onClick?: () => void
}

function DroppableCellComponent({
  id,
  date,
  time,
  children,
  className,
  onClick,
}: DroppableCellProps) {
  // Use the optimized hook that only subscribes to activeEvent
  // This prevents re-renders when currentTime changes during drag
  const { activeEvent } = useCalendarDndActiveEvent()

  // Memoize the data object to prevent useDroppable from re-rendering unnecessarily
  // Convert date to timestamp for stable comparison
  const dateTimestamp = useMemo(() => date.getTime(), [date])
  const droppableData = useMemo(
    () => ({
      date: new Date(dateTimestamp), // Create new Date from timestamp
      time,
    }),
    [dateTimestamp, time]
  )

  const { setNodeRef, isOver } = useDroppable({
    id,
    data: droppableData,
  })

  // Use ref to track previous isOver state and only update DOM when it changes
  const prevIsOverRef = useRef(isOver)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (prevIsOverRef.current !== isOver && elementRef.current) {
      // Only update the data attribute when isOver actually changes
      const isDragging = isOver && activeEvent !== null
      if (isDragging) {
        elementRef.current.setAttribute("data-dragging", "true")
      } else {
        elementRef.current.removeAttribute("data-dragging")
      }
      prevIsOverRef.current = isOver
    }
  }, [isOver, activeEvent])

  // Format time for display in tooltip (only for debugging)
  const formattedTime = useMemo(
    () =>
      time !== undefined
        ? `${Math.floor(time)}:${Math.round((time - Math.floor(time)) * 60)
            .toString()
            .padStart(2, "0")}`
        : null,
    [time]
  )

  // Calculate initial isDragging state
  const isDragging = isOver && activeEvent !== null

  return (
    <div
      ref={(node) => {
        setNodeRef(node)
        if (node) {
          elementRef.current = node
          // Set initial state
          if (isDragging) {
            node.setAttribute("data-dragging", "true")
          } else {
            node.removeAttribute("data-dragging")
          }
        }
      }}
      onClick={onClick}
      className={cn(
        "data-dragging:bg-accent flex h-full flex-col overflow-hidden px-0.5 py-1 sm:px-1",
        className
      )}
      title={formattedTime ? `${formattedTime}` : undefined}
    >
      {children}
    </div>
  )
}

// Memoize the component with custom comparison to prevent unnecessary re-renders
// Only re-render when props change OR when isOver state actually changes
export const DroppableCell = React.memo(
  DroppableCellComponent,
  (prevProps, nextProps) => {
    // Re-render if any prop changes
    if (
      prevProps.id !== nextProps.id ||
      prevProps.date.getTime() !== nextProps.date.getTime() ||
      prevProps.time !== nextProps.time ||
      prevProps.className !== nextProps.className ||
      prevProps.onClick !== nextProps.onClick ||
      prevProps.children !== nextProps.children
    ) {
      return false // Props changed, allow re-render
    }
    // Props are the same, prevent re-render
    // Note: isOver changes will still trigger re-renders from useDroppable,
    // but this prevents re-renders from parent component updates
    return true
  }
)
