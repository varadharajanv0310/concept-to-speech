"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Plus, X, Play, Eye, Palette, Volume2, User, Shield } from "lucide-react"
import { useProfile } from "@/contexts/ProfileContext"

interface UserSettings {
  speechRate: number
  speechPitch: number
  speechVolume: number
  selectedVoice: string
  fontSize: number
  fontFamily: string
  themePreset: string
  highContrast: boolean
  focusMode: boolean
  customConcepts: Array<{
    id: string
    label: string
    icon: string
    category: string
  }>
  favoriteMessages: string[]
  caregiverMode: boolean
  progressiveComplexity: number
  colorCoding: boolean
  iconSize: number
  buttonSpacing: number
  audioFeedbackEnabled: boolean
  vibrationEnabled: boolean
  emergencyMode: boolean
}

interface SettingsDialogProps {
  settings: UserSettings
  onSettingsChange: (settings: UserSettings) => void
}

const themePresets = [
  {
    id: "default-dark",
    name: "Default Dark",
    description: "Sophisticated dark theme with blue accents",
    colors: { bg: "#1A202C", accent: "#4299E1", text: "#E2E8F0" },
  },
  {
    id: "high-contrast",
    name: "High Contrast",
    description: "Maximum contrast for Wernicke's and Global aphasia",
    colors: { bg: "#000000", accent: "#F6E05E", text: "#FFFFFF" },
  },
  {
    id: "calm-mode",
    name: "Calm Mode",
    description: "Gentle colors for Broca's aphasia",
    colors: { bg: "#1A202C", accent: "#48BB78", text: "#E2E8F0" },
  },
  {
    id: "safety-yellow",
    name: "Safety Mode",
    description: "High-visibility yellow for Global aphasia",
    colors: { bg: "#ECC94B", accent: "#E53E3E", text: "#000000" },
  },
  {
    id: "practice-mode",
    name: "Practice Mode",
    description: "Neutral theme for Conduction aphasia",
    colors: { bg: "#2D3748", accent: "#805AD5", text: "#E2E8F0" },
  },
]

const fontOptions = [
  { id: "inter", name: "Inter", description: "Clean and professional" },
  { id: "lexend", name: "Lexend", description: "Optimized for reading proficiency" },
  { id: "opendyslexic", name: "OpenDyslexic", description: "Designed for dyslexia" },
  { id: "source-code-pro", name: "Source Code Pro", description: "Monospaced for text comparison" },
  { id: "system", name: "System Default", description: "Your device's default font" },
]

const voiceOptions = [
  { id: "browser-default", name: "Browser Default", description: "Standard system voice" },
  { id: "friendly-female", name: "Friendly Female", description: "Warm and approachable" },
  { id: "calm-male", name: "Calm Male", description: "Steady and reassuring" },
  { id: "professional-female", name: "Professional Female", description: "Clear and articulate" },
  { id: "gentle-male", name: "Gentle Male", description: "Soft and patient" },
  { id: "energetic-female", name: "Energetic Female", description: "Upbeat and encouraging" },
]

export function SettingsDialog({ settings, onSettingsChange }: SettingsDialogProps) {
  const { profile } = useProfile()
  const [newConceptLabel, setNewConceptLabel] = useState("")
  const [newConceptIcon, setNewConceptIcon] = useState("")
  const [newConceptCategory, setNewConceptCategory] = useState("people")
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const [isTestingVoice, setIsTestingVoice] = useState(false)

  useEffect(() => {
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices()
      setAvailableVoices(voices)
    }

    loadVoices()
    speechSynthesis.onvoiceschanged = loadVoices
  }, [])

  const addCustomConcept = () => {
    if (!newConceptLabel.trim() || !newConceptIcon.trim()) return

    const newConcept = {
      id: `custom-${Date.now()}`,
      label: newConceptLabel.trim(),
      icon: newConceptIcon.trim(),
      category: newConceptCategory,
    }

    onSettingsChange({
      ...settings,
      customConcepts: [...settings.customConcepts, newConcept],
    })

    setNewConceptLabel("")
    setNewConceptIcon("")
  }

  const removeCustomConcept = (conceptId: string) => {
    onSettingsChange({
      ...settings,
      customConcepts: settings.customConcepts.filter((c) => c.id !== conceptId),
    })
  }

  const updateSpeechSettings = (key: keyof UserSettings, value: number | string | boolean) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    })
  }

  const getProfileRecommendations = () => {
    switch (profile) {
      case "broca":
        return {
          themePreset: "calm-mode",
          fontFamily: "inter",
          fontSize: 16,
          highContrast: false,
          iconSize: 24,
        }
      case "wernicke":
        return {
          themePreset: "high-contrast",
          fontFamily: "system",
          fontSize: 18,
          highContrast: true,
          iconSize: 32,
        }
      case "global":
        return {
          themePreset: "safety-yellow",
          fontFamily: "inter",
          fontSize: 20,
          highContrast: true,
          iconSize: 48,
        }
      case "conduction":
        return {
          themePreset: "practice-mode",
          fontFamily: "source-code-pro",
          fontSize: 16,
          highContrast: false,
          iconSize: 24,
        }
      case "anomic":
        return {
          themePreset: "default-dark",
          fontFamily: "lexend",
          fontSize: 16,
          highContrast: false,
          iconSize: 28,
        }
      case "ppa":
        return {
          themePreset: "default-dark",
          fontFamily: "inter",
          fontSize: 16,
          highContrast: false,
          iconSize: 24,
        }
      default:
        return {}
    }
  }

  const applyProfileRecommendations = () => {
    const recommendations = getProfileRecommendations()
    onSettingsChange({
      ...settings,
      ...recommendations,
    })
  }

  const testVoice = async () => {
    if (isTestingVoice) return

    setIsTestingVoice(true)
    const testText = "Hello! This is how I sound when speaking your messages."

    try {
      if (settings.selectedVoice === "browser-default") {
        // Use browser default
        const utterance = new SpeechSynthesisUtterance(testText)
        utterance.rate = settings.speechRate
        utterance.pitch = settings.speechPitch
        utterance.volume = settings.speechVolume

        utterance.onend = () => setIsTestingVoice(false)
        utterance.onerror = () => setIsTestingVoice(false)

        speechSynthesis.speak(utterance)
      } else {
        // Find matching system voice or use a fallback
        const selectedSystemVoice = availableVoices.find(
          (voice) =>
            voice.name.toLowerCase().includes(settings.selectedVoice.split("-")[1]) ||
            voice.name.toLowerCase().includes(settings.selectedVoice.split("-")[0]),
        )

        const utterance = new SpeechSynthesisUtterance(testText)
        if (selectedSystemVoice) {
          utterance.voice = selectedSystemVoice
        }
        utterance.rate = settings.speechRate
        utterance.pitch = settings.speechPitch
        utterance.volume = settings.speechVolume

        utterance.onend = () => setIsTestingVoice(false)
        utterance.onerror = () => setIsTestingVoice(false)

        speechSynthesis.speak(utterance)
      }
    } catch (error) {
      console.error("Error testing voice:", error)
      setIsTestingVoice(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-sm bg-transparent">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Personalization Settings</DialogTitle>
          <DialogDescription>
            Customize your communication experience
            {profile && (
              <span className="ml-2 text-sm font-medium">
                • Optimized for {profile.charAt(0).toUpperCase() + profile.slice(1)} Aphasia
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {profile && (
          <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-900 dark:text-blue-100">Profile-Optimized Settings Available</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Apply recommended settings for {profile} aphasia based on clinical research
                </p>
              </div>
              <Button onClick={applyProfileRecommendations} size="sm" variant="outline">
                Apply Recommendations
              </Button>
            </div>
          </Card>
        )}

        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="accessibility" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Accessibility
            </TabsTrigger>
            <TabsTrigger value="speech" className="flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Speech
            </TabsTrigger>
            <TabsTrigger value="personalization" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Personal
            </TabsTrigger>
            {profile === "ppa" && (
              <TabsTrigger value="caregiver" className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Caregiver
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="appearance" className="space-y-6">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Theme & Colors
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="theme-preset">Theme Preset</Label>
                  <Select
                    value={settings.themePreset || "default-dark"}
                    onValueChange={(value) => updateSpeechSettings("themePreset", value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select a theme" />
                    </SelectTrigger>
                    <SelectContent>
                      {themePresets.map((theme) => (
                        <SelectItem key={theme.id} value={theme.id}>
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded border" style={{ backgroundColor: theme.colors.accent }} />
                            <div>
                              <div className="font-medium">{theme.name}</div>
                              <div className="text-xs text-muted-foreground">{theme.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="color-coding">Color Coding</Label>
                    <p className="text-xs text-muted-foreground">Use colors to categorize concepts</p>
                  </div>
                  <Switch
                    id="color-coding"
                    checked={settings.colorCoding || false}
                    onCheckedChange={(checked) => updateSpeechSettings("colorCoding", checked)}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="accessibility" className="space-y-6">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Visual Accessibility
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="font-family">Font Family</Label>
                  <Select
                    value={settings.fontFamily || "inter"}
                    onValueChange={(value) => updateSpeechSettings("fontFamily", value)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select a font" />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map((font) => (
                        <SelectItem key={font.id} value={font.id}>
                          <div>
                            <div className="font-medium">{font.name}</div>
                            <div className="text-xs text-muted-foreground">{font.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="font-size">Font Size: {settings.fontSize || 16}px</Label>
                  <Slider
                    id="font-size"
                    min={12}
                    max={32}
                    step={2}
                    value={[settings.fontSize || 16]}
                    onValueChange={([value]) => updateSpeechSettings("fontSize", value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="icon-size">Icon Size: {settings.iconSize || 24}px</Label>
                  <Slider
                    id="icon-size"
                    min={16}
                    max={64}
                    step={4}
                    value={[settings.iconSize || 24]}
                    onValueChange={([value]) => updateSpeechSettings("iconSize", value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="button-spacing">Button Spacing: {settings.buttonSpacing || 8}px</Label>
                  <Slider
                    id="button-spacing"
                    min={4}
                    max={24}
                    step={2}
                    value={[settings.buttonSpacing || 8]}
                    onValueChange={([value]) => updateSpeechSettings("buttonSpacing", value)}
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="high-contrast">High Contrast Mode</Label>
                    <p className="text-xs text-muted-foreground">Maximum contrast for better visibility</p>
                  </div>
                  <Switch
                    id="high-contrast"
                    checked={settings.highContrast || false}
                    onCheckedChange={(checked) => updateSpeechSettings("highContrast", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="focus-mode">Focus Mode</Label>
                    <p className="text-xs text-muted-foreground">Simplifies interface to reduce distractions</p>
                  </div>
                  <Switch
                    id="focus-mode"
                    checked={settings.focusMode || false}
                    onCheckedChange={(checked) => updateSpeechSettings("focusMode", checked)}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="speech" className="space-y-6">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Speech Settings</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="voice-select">Voice Selection</Label>
                  <div className="flex gap-2 mt-2">
                    <Select
                      value={settings.selectedVoice || "browser-default"}
                      onValueChange={(value) => updateSpeechSettings("selectedVoice", value)}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select a voice" />
                      </SelectTrigger>
                      <SelectContent>
                        {voiceOptions.map((voice) => (
                          <SelectItem key={voice.id} value={voice.id}>
                            <div>
                              <div className="font-medium">{voice.name}</div>
                              <div className="text-xs text-muted-foreground">{voice.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={testVoice}
                      disabled={isTestingVoice}
                      className="px-3 bg-transparent"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isTestingVoice ? "Playing voice sample..." : "Click play to test the selected voice"}
                  </p>
                </div>

                <div>
                  <Label htmlFor="speech-rate">Speech Rate: {settings.speechRate}</Label>
                  <Slider
                    id="speech-rate"
                    min={0.5}
                    max={2}
                    step={0.1}
                    value={[settings.speechRate]}
                    onValueChange={([value]) => updateSpeechSettings("speechRate", value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="speech-pitch">Speech Pitch: {settings.speechPitch}</Label>
                  <Slider
                    id="speech-pitch"
                    min={0.5}
                    max={2}
                    step={0.1}
                    value={[settings.speechPitch]}
                    onValueChange={([value]) => updateSpeechSettings("speechPitch", value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="speech-volume">Speech Volume: {settings.speechVolume}</Label>
                  <Slider
                    id="speech-volume"
                    min={0.1}
                    max={1}
                    step={0.1}
                    value={[settings.speechVolume]}
                    onValueChange={([value]) => updateSpeechSettings("speechVolume", value)}
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="audio-feedback">Audio Feedback</Label>
                    <p className="text-xs text-muted-foreground">Play sounds for button presses and actions</p>
                  </div>
                  <Switch
                    id="audio-feedback"
                    checked={settings.audioFeedbackEnabled || false}
                    onCheckedChange={(checked) => updateSpeechSettings("audioFeedbackEnabled", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="vibration">Vibration Feedback</Label>
                    <p className="text-xs text-muted-foreground">Vibrate on touch (mobile devices)</p>
                  </div>
                  <Switch
                    id="vibration"
                    checked={settings.vibrationEnabled || false}
                    onCheckedChange={(checked) => updateSpeechSettings("vibrationEnabled", checked)}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="personalization" className="space-y-6">
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Custom Concepts</h3>
              <div className="space-y-3 mb-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="concept-label">Label</Label>
                    <Input
                      id="concept-label"
                      placeholder="e.g., Medicine"
                      value={newConceptLabel}
                      onChange={(e) => setNewConceptLabel(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="concept-icon">Icon (emoji)</Label>
                    <Input
                      id="concept-icon"
                      placeholder="e.g., 💊"
                      value={newConceptIcon}
                      onChange={(e) => setNewConceptIcon(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="concept-category">Category</Label>
                  <select
                    id="concept-category"
                    value={newConceptCategory}
                    onChange={(e) => setNewConceptCategory(e.target.value)}
                    className="w-full p-2 border rounded-md bg-background"
                  >
                    <option value="people">People</option>
                    <option value="actions">Actions</option>
                    <option value="feelings">Feelings</option>
                    <option value="places">Places</option>
                  </select>
                </div>
                <Button onClick={addCustomConcept} size="sm" className="w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Custom Concept
                </Button>
              </div>

              {settings.customConcepts.length > 0 && (
                <div className="space-y-2">
                  <Label>Your Custom Concepts:</Label>
                  <div className="flex flex-wrap gap-2">
                    {settings.customConcepts.map((concept) => (
                      <Badge
                        key={concept.id}
                        variant="secondary"
                        className="text-sm px-3 py-2 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        onClick={() => removeCustomConcept(concept.id)}
                      >
                        {concept.icon} {concept.label}
                        <X className="w-3 h-3 ml-2" />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Favorite Messages</h3>
              {settings.favoriteMessages.length === 0 ? (
                <p className="text-muted-foreground italic">
                  Your favorite messages will appear here after you generate and save them.
                </p>
              ) : (
                <div className="space-y-2">
                  {settings.favoriteMessages.map((message, index) => (
                    <div key={index} className="p-3 bg-accent rounded-md text-sm">
                      {message}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {profile === "ppa" && (
            <TabsContent value="caregiver" className="space-y-6">
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Caregiver Controls
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="caregiver-mode">Caregiver Mode</Label>
                      <p className="text-xs text-muted-foreground">Enable advanced configuration options</p>
                    </div>
                    <Switch
                      id="caregiver-mode"
                      checked={settings.caregiverMode || false}
                      onCheckedChange={(checked) => updateSpeechSettings("caregiverMode", checked)}
                    />
                  </div>

                  {settings.caregiverMode && (
                    <>
                      <div>
                        <Label htmlFor="progressive-complexity">
                          Interface Complexity: {settings.progressiveComplexity || 5}/10
                        </Label>
                        <Slider
                          id="progressive-complexity"
                          min={1}
                          max={10}
                          step={1}
                          value={[settings.progressiveComplexity || 5]}
                          onValueChange={([value]) => updateSpeechSettings("progressiveComplexity", value)}
                          className="mt-2"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Adjust interface complexity as abilities change over time
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="emergency-mode">Emergency Mode</Label>
                          <p className="text-xs text-muted-foreground">Quick access to essential communication</p>
                        </div>
                        <Switch
                          id="emergency-mode"
                          checked={settings.emergencyMode || false}
                          onCheckedChange={(checked) => updateSpeechSettings("emergencyMode", checked)}
                        />
                      </div>
                    </>
                  )}
                </div>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
