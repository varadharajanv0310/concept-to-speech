"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type AphasiaProfile = "broca" | "wernicke" | "global" | "conduction" | "anomic" | "ppa"

export interface ProfileSettings {
  showTextLabels?: boolean
  gridSize?: "small" | "medium" | "large"
  displayMode?: "text" | "icon" | "mixed"
  fontSize?: "small" | "medium" | "large"
  highContrast?: boolean
  audioFeedback?: boolean
  simplifiedLayout?: boolean
}

interface ProfileContextType {
  profile: AphasiaProfile | null
  settings: ProfileSettings | null
  loading: boolean
  setProfile: (profile: AphasiaProfile) => void
  updateSettings: (settings: Partial<ProfileSettings>) => void
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined)

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<AphasiaProfile | null>(null)
  const [settings, setSettings] = useState<ProfileSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load profile and settings from localStorage
    const savedProfile = localStorage.getItem("aphasia-profile") as AphasiaProfile | null
    const savedSettings = localStorage.getItem("profile-settings")

    if (savedProfile) {
      setProfileState(savedProfile)
    }

    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (error) {
        console.error("Failed to parse saved settings:", error)
      }
    } else {
      // Set default settings based on profile
      setSettings(getDefaultSettings(savedProfile))
    }

    setLoading(false)
  }, [])

  const setProfile = (newProfile: AphasiaProfile) => {
    setProfileState(newProfile)
    localStorage.setItem("aphasia-profile", newProfile)

    // Update settings with profile-specific defaults
    const defaultSettings = getDefaultSettings(newProfile)
    setSettings(defaultSettings)
    localStorage.setItem("profile-settings", JSON.stringify(defaultSettings))
  }

  const updateSettings = (newSettings: Partial<ProfileSettings>) => {
    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)
    localStorage.setItem("profile-settings", JSON.stringify(updatedSettings))
  }

  return (
    <ProfileContext.Provider
      value={{
        profile,
        settings,
        loading,
        setProfile,
        updateSettings,
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider")
  }
  return context
}

function getDefaultSettings(profile: AphasiaProfile | null): ProfileSettings {
  if (!profile) return {}

  switch (profile) {
    case "broca":
      return {
        showTextLabels: true,
        gridSize: "medium",
        displayMode: "text",
        fontSize: "medium",
        audioFeedback: false,
        simplifiedLayout: false,
      }
    case "wernicke":
      return {
        showTextLabels: false,
        gridSize: "large",
        displayMode: "icon",
        fontSize: "large",
        audioFeedback: true,
        simplifiedLayout: true,
      }
    case "global":
      return {
        showTextLabels: false,
        gridSize: "large",
        displayMode: "icon",
        fontSize: "large",
        highContrast: true,
        audioFeedback: true,
        simplifiedLayout: true,
      }
    case "conduction":
      return {
        showTextLabels: true,
        gridSize: "medium",
        displayMode: "mixed",
        fontSize: "medium",
        audioFeedback: false,
        simplifiedLayout: false,
      }
    case "anomic":
      return {
        showTextLabels: true,
        gridSize: "medium",
        displayMode: "mixed",
        fontSize: "medium",
        audioFeedback: true,
        simplifiedLayout: false,
      }
    case "ppa":
      return {
        showTextLabels: true,
        gridSize: "medium",
        displayMode: "mixed",
        fontSize: "medium",
        audioFeedback: false,
        simplifiedLayout: false,
      }
    default:
      return {}
  }
}
