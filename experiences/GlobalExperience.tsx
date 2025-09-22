"use client"
import { useState } from "react"
import { Card } from "@/components/ui/card"

// Severe impairment across all functions requires minimal cognitive load
interface GlobalExperienceProps {
  userSettings: any
  onSettingsChange: (settings: any) => void
}

export function GlobalExperience({ userSettings, onSettingsChange }: GlobalExperienceProps) {
  const [activeMessage, setActiveMessage] = useState<string>("")
  const [showFullScreen, setShowFullScreen] = useState(false)

  const urgentNeeds = [
    { id: "pain", icon: "😣", message: "I am in pain", color: "bg-red-100 border-red-300 hover:bg-red-200" },
    { id: "water", icon: "💧", message: "I need water", color: "bg-blue-100 border-blue-300 hover:bg-blue-200" },
    { id: "help", icon: "🤝", message: "I need help", color: "bg-yellow-100 border-yellow-300 hover:bg-yellow-200" },
    {
      id: "bathroom",
      icon: "🚻",
      message: "I need the bathroom",
      color: "bg-green-100 border-green-300 hover:bg-green-200",
    },
    { id: "tired", icon: "😴", message: "I am tired", color: "bg-purple-100 border-purple-300 hover:bg-purple-200" },
    {
      id: "doctor",
      icon: "👨‍⚕️",
      message: "I need a doctor",
      color: "bg-orange-100 border-orange-300 hover:bg-orange-200",
    },
  ]

  const handleNeedSelect = (need: any) => {
    setActiveMessage(need.message)
    setShowFullScreen(true)

    // Immediate audio feedback
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(need.message)
      utterance.rate = 0.6 // Very slow for clarity
      utterance.volume = 1
      speechSynthesis.speak(utterance)
    }

    // Auto-hide after 5 seconds
    setTimeout(() => {
      setShowFullScreen(false)
      setActiveMessage("")
    }, 5000)
  }

  if (showFullScreen && activeMessage) {
    return (
      <div
        className="fixed inset-0 bg-background flex items-center justify-center z-50 cursor-pointer"
        onClick={() => {
          setShowFullScreen(false)
          setActiveMessage("")
        }}
      >
        <div className="text-center space-y-8 p-8">
          <div className="text-9xl animate-pulse">
            {urgentNeeds.find((need) => need.message === activeMessage)?.icon}
          </div>
          <p className="text-6xl font-bold text-foreground text-balance max-w-4xl">{activeMessage}</p>
          <p className="text-2xl text-muted-foreground">Tap anywhere to close</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* Minimal header */}
      <div className="text-center mb-8">
        <div className="text-8xl mb-4">💬</div>
        <h1 className="text-4xl font-bold text-foreground">Tell Someone</h1>
      </div>

      {/* Large, high-contrast buttons for basic needs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {urgentNeeds.map((need) => (
          <Card
            key={need.id}
            className={`cursor-pointer transition-all duration-200 border-4 hover:scale-105 active:scale-95 p-12 ${need.color}`}
            onClick={() => handleNeedSelect(need)}
          >
            <div className="text-center space-y-6">
              <div className="text-9xl" role="img" aria-label={need.message}>
                {need.icon}
              </div>
              {/* No text labels - Global aphasia has severely impaired comprehension */}
            </div>
          </Card>
        ))}
      </div>

      {/* Simple status indicator */}
      <div className="text-center mt-8">
        <p className="text-xl text-muted-foreground">Tap a picture to speak</p>
      </div>
    </div>
  )
}
