"use client"

import type React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Brain, Eye, MessageSquare, Repeat, Search, Settings } from "lucide-react"

export type AphasiaType =
  | "Broca's Aphasia"
  | "Wernicke's Aphasia"
  | "Global Aphasia"
  | "Conduction Aphasia"
  | "Anomic Aphasia"
  | "Primary Progressive Aphasia (PPA)"

export interface AphasiaProfile {
  Speaking: string
  "Comprehension (listening)": string
  Repetition: string
  Reading: string
  Writing: string
}

export const aphasiaProfiles: Record<AphasiaType, AphasiaProfile> = {
  "Broca's Aphasia": {
    Speaking: "Severely impaired, broken, effortful speech (non-fluent)",
    "Comprehension (listening)": "Mostly preserved (can understand well)",
    Repetition: "Impaired",
    Reading: "Impaired (mirrors speech problems)",
    Writing: "Impaired (labored, agrammatic)",
  },
  "Wernicke's Aphasia": {
    Speaking: "Fluent but nonsensical (word salad, neologisms)",
    "Comprehension (listening)": "Severely impaired (can't understand spoken language)",
    Repetition: "Impaired",
    Reading: "Impaired (can read aloud but not understand)",
    Writing: "Fluent but meaningless writing",
  },
  "Global Aphasia": {
    Speaking: "Nearly absent",
    "Comprehension (listening)": "Severely impaired",
    Repetition: "Severely impaired",
    Reading: "Severely impaired",
    Writing: "Severely impaired",
  },
  "Conduction Aphasia": {
    Speaking: "Fluent but with many errors, self-correcting attempts",
    "Comprehension (listening)": "Preserved",
    Repetition: "Severely impaired (main feature)",
    Reading: "Preserved comprehension, but errors when reading aloud",
    Writing: "Errors mirror speech errors",
  },
  "Anomic Aphasia": {
    Speaking: "Fluent, but frequent word-finding pauses",
    "Comprehension (listening)": "Preserved",
    Repetition: "Preserved",
    Reading: "Preserved, but with word-finding issues",
    Writing: "Preserved grammar, but struggles with word choice",
  },
  "Primary Progressive Aphasia (PPA)": {
    Speaking: "Gradually worsens (depends on variant: nonfluent, logopenic, semantic)",
    "Comprehension (listening)": "Slowly worsens – logopenic → comprehension loss later",
    Repetition: "Progressive decline",
    Reading: "Progressive decline (semantic variant loses word meaning first)",
    Writing: "Declines over years",
  },
}

const aphasiaTypeData: Array<{
  type: AphasiaType
  description: string
  icon: React.ReactNode
  color: string
}> = [
  {
    type: "Broca's Aphasia",
    description: "Good understanding, difficulty speaking fluently",
    icon: <MessageSquare className="w-8 h-8" />,
    color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
  },
  {
    type: "Wernicke's Aphasia",
    description: "Fluent speech but difficulty understanding",
    icon: <Eye className="w-8 h-8" />,
    color: "bg-green-50 border-green-200 hover:bg-green-100",
  },
  {
    type: "Global Aphasia",
    description: "Significant challenges with all language skills",
    icon: <Brain className="w-8 h-8" />,
    color: "bg-red-50 border-red-200 hover:bg-red-100",
  },
  {
    type: "Conduction Aphasia",
    description: "Good understanding and speech, difficulty repeating",
    icon: <Repeat className="w-8 h-8" />,
    color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
  },
  {
    type: "Anomic Aphasia",
    description: "Difficulty finding specific words, especially nouns",
    icon: <Search className="w-8 h-8" />,
    color: "bg-orange-50 border-orange-200 hover:bg-orange-100",
  },
  {
    type: "Primary Progressive Aphasia (PPA)",
    description: "Language abilities gradually decline over time",
    icon: <Settings className="w-8 h-8" />,
    color: "bg-gray-50 border-gray-200 hover:bg-gray-100",
  },
]

interface AphasiaTypeSelectorProps {
  onTypeSelect: (type: AphasiaType) => void
  onSkip: () => void
}

export function AphasiaTypeSelector({ onTypeSelect, onSkip }: AphasiaTypeSelectorProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 animate-in fade-in duration-500">
          <h1 className="text-4xl font-bold text-foreground text-balance">Personalize Your Experience</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Select the profile that best describes your communication needs. This will customize the interface to work
            better for you.
          </p>
        </div>

        {/* Aphasia Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom duration-700 delay-200">
          {aphasiaTypeData.map(({ type, description, icon, color }, index) => (
            <Card
              key={type}
              className={`p-6 cursor-pointer transition-all duration-300 border-2 hover:scale-105 active:scale-95 hover:shadow-lg ${color} animate-in zoom-in duration-300`}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => onTypeSelect(type)}
              role="button"
              tabIndex={0}
              aria-label={`Select ${type}: ${description}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  onTypeSelect(type)
                }
              }}
            >
              <div className="text-center space-y-4">
                <div className="flex justify-center text-primary">{icon}</div>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-foreground">{type}</h2>
                  <p className="text-sm text-muted-foreground text-balance">{description}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Skip Option */}
        <div className="text-center space-y-4 animate-in fade-in duration-500 delay-500">
          <p className="text-sm text-muted-foreground">
            Not sure which profile fits? You can always change this later in settings.
          </p>
          <Button
            variant="outline"
            onClick={onSkip}
            className="transition-all duration-200 hover:scale-105 active:scale-95 bg-transparent"
          >
            Skip for Now
          </Button>
        </div>
      </div>
    </div>
  )
}
