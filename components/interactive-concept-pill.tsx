"use client"

import type React from "react"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { X, GripVertical } from "lucide-react"

interface InteractiveConceptPillProps {
  conceptId: string
  label: string
  index: number
  onRemove: (index: number) => void
  onReorder?: (fromIndex: number, toIndex: number) => void
  isDragging?: boolean
  onDragStart?: (index: number) => void
  onDragEnd?: () => void
}

export function InteractiveConceptPill({
  conceptId,
  label,
  index,
  onRemove,
  onReorder,
  isDragging = false,
  onDragStart,
  onDragEnd,
}: InteractiveConceptPillProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", index.toString())
    onDragStart?.(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const fromIndex = Number.parseInt(e.dataTransfer.getData("text/plain"))
    if (fromIndex !== index && onReorder) {
      onReorder(fromIndex, index)
    }
    onDragEnd?.()
  }

  return (
    <Badge
      variant="secondary"
      className={`
        group relative text-sm px-3 py-2 cursor-pointer transition-all duration-200 
        hover:scale-105 active:scale-95 animate-in zoom-in duration-300
        ${isDragging ? "opacity-50 scale-95" : ""}
        ${isHovered ? "pr-8" : ""}
      `}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-1">
        <GripVertical className="w-3 h-3 opacity-40 group-hover:opacity-70 transition-opacity" />
        <span>{label}</span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove(index)
          }}
          className={`
            ml-2 p-0.5 rounded-full hover:bg-destructive hover:text-destructive-foreground 
            transition-all duration-200 opacity-0 group-hover:opacity-100
            ${isHovered ? "opacity-100" : ""}
          `}
          aria-label={`Remove ${label}`}
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </Badge>
  )
}
