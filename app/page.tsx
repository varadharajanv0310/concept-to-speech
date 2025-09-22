"use client"

import type React from "react"
import { AphasiaTypeSelector, type AphasiaType } from "@/components/aphasia-type-selector"
import { useProfile } from "@/contexts/ProfileContext"
import { BrocaExperience } from "@/experiences/BrocaExperience"
import { WernickeExperience } from "@/experiences/WernickeExperience"
import { GlobalExperience } from "@/experiences/GlobalExperience"
import { ConductionExperience } from "@/experiences/ConductionExperience"
import { AnomicExperience } from "@/experiences/AnomicExperience"
import { PPAExperience } from "@/experiences/PPAExperience"
import { useState, useEffect } from "react"

// Concept categories shared across all experiences
const conceptCategories = {
  people: {
    name: "People",
    concepts: [
      { id: "i", label: "I", icon: "👤" },
      { id: "you", label: "You", icon: "👥" },
      { id: "family", label: "Family", icon: "👨‍👩‍👧‍👦" },
      { id: "doctor", label: "Doctor", icon: "👨‍⚕️" },
      { id: "friend", label: "Friend", icon: "👫" },
      { id: "nurse", label: "Nurse", icon: "👩‍⚕️" },
    ],
  },
  actions: {
    name: "Actions",
    concepts: [
      { id: "want", label: "Want", icon: "🙏" },
      { id: "need", label: "Need", icon: "❗" },
      { id: "help", label: "Help", icon: "🤝" },
      { id: "go", label: "Go", icon: "🚶" },
      { id: "eat", label: "Eat", icon: "🍽️" },
      { id: "drink", label: "Drink", icon: "🥤" },
    ],
  },
  feelings: {
    name: "Feelings",
    concepts: [
      { id: "happy", label: "Happy", icon: "😊" },
      { id: "sad", label: "Sad", icon: "😢" },
      { id: "pain", label: "Pain", icon: "😣" },
      { id: "tired", label: "Tired", icon: "😴" },
      { id: "worried", label: "Worried", icon: "😟" },
      { id: "angry", label: "Angry", icon: "😠" },
    ],
  },
  places: {
    name: "Places",
    concepts: [
      { id: "home", label: "Home", icon: "🏠" },
      { id: "hospital", label: "Hospital", icon: "🏥" },
      { id: "bathroom", label: "Bathroom", icon: "🚻" },
      { id: "kitchen", label: "Kitchen", icon: "🍳" },
      { id: "bedroom", label: "Bedroom", icon: "🛏️" },
      { id: "outside", label: "Outside", icon: "🌳" },
    ],
  },
}

interface UserSettings {
  speechRate: number
  speechPitch: number
  speechVolume: number
  selectedVoice: string
  fontSize: number
  fontFamily: string
  highContrast: boolean
  focusMode: boolean
  customConcepts: Array<{
    id: string
    label: string
    icon: string
    category: string
  }>
  favoriteMessages: string[]
  gridSize?: string
  showTextLabels?: boolean
}

const defaultSettings: UserSettings = {
  speechRate: 0.8,
  speechPitch: 1,
  speechVolume: 1,
  selectedVoice: "browser-default",
  fontSize: 16,
  fontFamily: "system",
  highContrast: false,
  focusMode: false,
  customConcepts: [],
  favoriteMessages: [],
  gridSize: "medium",
  showTextLabels: true,
}

export default function ConceptToSpeechApp() {
  const { profile, settings, loading, setProfile, updateSettings } = useProfile()
  const [showAphasiaSelector, setShowAphasiaSelector] = useState(false)
  const [userSettings, setUserSettings] = useState<UserSettings>(defaultSettings)

  useEffect(() => {
    const savedSettings = localStorage.getItem("concept-to-speech-settings")
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setUserSettings(settings)
    }

    if (!loading && !profile) {
      setShowAphasiaSelector(true)
    }
  }, [loading, profile])

  const handleSettingsChange = (newSettings: UserSettings) => {
    setUserSettings(newSettings)
    localStorage.setItem("concept-to-speech-settings", JSON.stringify(newSettings))
  }

  const handleAphasiaTypeSelect = (type: AphasiaType) => {
    setProfile(type)
    setShowAphasiaSelector(false)
  }

  const handleSkipAphasiaSelector = () => {
    setShowAphasiaSelector(false)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Hub: Show aphasia type selector if no profile selected
  if (showAphasiaSelector || !profile) {
    return <AphasiaTypeSelector onTypeSelect={handleAphasiaTypeSelect} onSkip={handleSkipAphasiaSelector} />
  }

  // Spokes: Route to specific experience based on profile
  const renderExperience = () => {
    const commonProps = {
      conceptCategories,
      userSettings,
      onSettingsChange: handleSettingsChange,
    }

    switch (profile) {
      case "broca":
        return <BrocaExperience {...commonProps} />
      case "wernicke":
        return <WernickeExperience {...commonProps} />
      case "global":
        return <GlobalExperience {...commonProps} />
      case "conduction":
        return <ConductionExperience {...commonProps} />
      case "anomic":
        return <AnomicExperience {...commonProps} />
      case "ppa":
        return <PPAExperience {...commonProps} />
      default:
        return <BrocaExperience {...commonProps} />
    }
  }

  const getAppStyles = () => {
    const styles: React.CSSProperties = {
      fontSize: `${userSettings.fontSize}px`,
    }

    if (userSettings.fontFamily === "opendyslexic") {
      styles.fontFamily = "OpenDyslexic, sans-serif"
    } else if (userSettings.fontFamily === "arial") {
      styles.fontFamily = "Arial, sans-serif"
    } else if (userSettings.fontFamily === "verdana") {
      styles.fontFamily = "Verdana, sans-serif"
    }

    return styles
  }

  const getAppClasses = () => {
    let classes = "min-h-screen bg-background p-4"

    if (userSettings.highContrast || settings?.highContrast) {
      classes += " contrast-more"
    }

    if (profile === "global" || profile === "wernicke") {
      classes += " text-lg"
    }

    return classes
  }

  const getProfileDisplayName = (profileType: string) => {
    const names = {
      broca: "Broca's Aphasia",
      wernicke: "Wernicke's Aphasia",
      global: "Global Aphasia",
      conduction: "Conduction Aphasia",
      anomic: "Anomic Aphasia",
      ppa: "Primary Progressive Aphasia",
    }
    return names[profileType as keyof typeof names] || profileType
  }

  return (
    <div className={getAppClasses()} style={getAppStyles()} data-profile={profile}>
      {/* Profile indicator - clickable to change */}
      {profile && (
        <div className="text-center mb-4">
          <button
            onClick={() => setShowAphasiaSelector(true)}
            className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full inline-block hover:bg-muted/80 transition-colors duration-200 cursor-pointer border border-transparent hover:border-border"
            aria-label="Change aphasia type optimization"
          >
            Optimized for {getProfileDisplayName(profile)} • Click to change
          </button>
        </div>
      )}

      {/* Render the appropriate experience */}
      {renderExperience()}
    </div>
  )
}
