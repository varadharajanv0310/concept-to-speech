"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Volume2, Users, Minus, Plus } from "lucide-react"
import { InteractiveConceptPill } from "@/components/interactive-concept-pill"

// Adaptable complexity over time with caregiver controls
interface PPAExperienceProps {
  conceptCategories: any
  userSettings: any
  onSettingsChange: (settings: any) => void
}

interface CaregiverSettings {
  showTextLabels: boolean
  gridSize: "small" | "medium" | "large"
  maxConcepts: number
  simplifiedCategories: boolean
  audioPrompts: boolean
  largeIcons: boolean
  highContrast: boolean
}

export function PPAExperience({ conceptCategories, userSettings, onSettingsChange }: PPAExperienceProps) {
  const [selectedConcepts, setSelectedConcepts] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState<string>("people")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedSentence, setGeneratedSentence] = useState<string>("")
  const [caregiverSettings, setCaregiverSettings] = useState<CaregiverSettings>({
    showTextLabels: true,
    gridSize: "medium",
    maxConcepts: 6,
    simplifiedCategories: false,
    audioPrompts: false,
    largeIcons: false,
    highContrast: false,
  })
  const [showCaregiverDialog, setShowCaregiverDialog] = useState(false)

  useEffect(() => {
    // Load caregiver settings from localStorage
    const saved = localStorage.getItem("ppa-caregiver-settings")
    if (saved) {
      try {
        setCaregiverSettings(JSON.parse(saved))
      } catch (error) {
        console.error("Failed to load caregiver settings:", error)
      }
    }
  }, [])

  const saveCaregiverSettings = (newSettings: CaregiverSettings) => {
    setCaregiverSettings(newSettings)
    localStorage.setItem("ppa-caregiver-settings", JSON.stringify(newSettings))
  }

  const handleConceptSelect = (conceptId: string) => {
    if (selectedConcepts.length >= caregiverSettings.maxConcepts) {
      // Audio feedback when limit reached
      if (caregiverSettings.audioPrompts && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance("Maximum concepts selected")
        utterance.rate = 0.7
        speechSynthesis.speak(utterance)
      }
      return
    }
    setSelectedConcepts((prev) => [...prev, conceptId])
  }

  const handleConceptRemove = (index: number) => {
    setSelectedConcepts((prev) => prev.filter((_, i) => i !== index))
  }

  const generateSpeech = async () => {
    if (selectedConcepts.length === 0) return

    setIsGenerating(true)
    try {
      const conceptLabels = selectedConcepts.map(getConceptLabel)
      const response = await fetch("/api/generate-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          concepts: conceptLabels,
          profile: "ppa",
          complexity: caregiverSettings.gridSize, // Adaptive complexity
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate speech")
      }

      const { sentence } = await response.json()
      setGeneratedSentence(sentence)

      // Automatic speech with caregiver-controlled settings
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(sentence)
        utterance.rate = 0.6 // Slower for PPA users
        speechSynthesis.speak(utterance)
      }
    } catch (error) {
      console.error("Error generating speech:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const getConceptLabel = (conceptId: string) => {
    for (const category of Object.values(conceptCategories)) {
      const concept = (category as any).concepts.find((c: any) => c.id === conceptId)
      if (concept) return concept.label
    }
    return conceptId
  }

  const getFilteredCategories = () => {
    if (caregiverSettings.simplifiedCategories) {
      // Reduce to essential categories
      const essential = ["people", "actions", "feelings"]
      return Object.fromEntries(Object.entries(conceptCategories).filter(([key]) => essential.includes(key)))
    }
    return conceptCategories
  }

  const getFilteredConcepts = (concepts: any[]) => {
    // Limit concepts based on caregiver settings
    const maxItems = caregiverSettings.gridSize === "small" ? 4 : caregiverSettings.gridSize === "medium" ? 6 : 8
    return concepts.slice(0, maxItems)
  }

  const getGridClasses = () => {
    const base = "grid gap-4"
    if (caregiverSettings.gridSize === "small") {
      return `${base} grid-cols-1 md:grid-cols-2`
    } else if (caregiverSettings.gridSize === "large") {
      return `${base} grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
    }
    return `${base} grid-cols-2 md:grid-cols-3`
  }

  const getIconSize = () => {
    return caregiverSettings.largeIcons ? "text-6xl" : "text-4xl"
  }

  const getAppClasses = () => {
    let classes = "max-w-4xl mx-auto space-y-6"
    if (caregiverSettings.highContrast) {
      classes += " contrast-more"
    }
    return classes
  }

  const handleConceptReorder = (fromIndex: number, toIndex: number) => {
    setSelectedConcepts((prev) => {
      const newConcepts = [...prev]
      const [movedConcept] = newConcepts.splice(fromIndex, 1)
      newConcepts.splice(toIndex, 0, movedConcept)
      return newConcepts
    })
  }

  const filteredCategories = getFilteredCategories()

  return (
    <div className={getAppClasses()}>
      {/* Header with Caregiver Controls */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-4">
          <h1 className="text-3xl font-bold text-foreground">Personal Communicator</h1>
          <Dialog open={showCaregiverDialog} onOpenChange={setShowCaregiverDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                <Users className="w-4 h-4" />
                Caregiver Settings
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Caregiver Controls</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="text-labels">Show Text Labels</Label>
                    <Switch
                      id="text-labels"
                      checked={caregiverSettings.showTextLabels}
                      onCheckedChange={(checked) =>
                        saveCaregiverSettings({ ...caregiverSettings, showTextLabels: checked })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Grid Size</Label>
                    <div className="flex gap-2">
                      {["small", "medium", "large"].map((size) => (
                        <Button
                          key={size}
                          variant={caregiverSettings.gridSize === size ? "default" : "outline"}
                          size="sm"
                          onClick={() => saveCaregiverSettings({ ...caregiverSettings, gridSize: size as any })}
                        >
                          {size}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Maximum Concepts: {caregiverSettings.maxConcepts}</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          saveCaregiverSettings({
                            ...caregiverSettings,
                            maxConcepts: Math.max(1, caregiverSettings.maxConcepts - 1),
                          })
                        }
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center">{caregiverSettings.maxConcepts}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          saveCaregiverSettings({
                            ...caregiverSettings,
                            maxConcepts: Math.min(10, caregiverSettings.maxConcepts + 1),
                          })
                        }
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="simplified">Simplified Categories</Label>
                    <Switch
                      id="simplified"
                      checked={caregiverSettings.simplifiedCategories}
                      onCheckedChange={(checked) =>
                        saveCaregiverSettings({ ...caregiverSettings, simplifiedCategories: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="audio-prompts">Audio Prompts</Label>
                    <Switch
                      id="audio-prompts"
                      checked={caregiverSettings.audioPrompts}
                      onCheckedChange={(checked) =>
                        saveCaregiverSettings({ ...caregiverSettings, audioPrompts: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="large-icons">Large Icons</Label>
                    <Switch
                      id="large-icons"
                      checked={caregiverSettings.largeIcons}
                      onCheckedChange={(checked) =>
                        saveCaregiverSettings({ ...caregiverSettings, largeIcons: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="high-contrast">High Contrast</Label>
                    <Switch
                      id="high-contrast"
                      checked={caregiverSettings.highContrast}
                      onCheckedChange={(checked) =>
                        saveCaregiverSettings({ ...caregiverSettings, highContrast: checked })
                      }
                    />
                  </div>
                </div>

                <Button onClick={() => setShowCaregiverDialog(false)} className="w-full">
                  Save Settings
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-muted-foreground text-lg">Personalized for your communication needs</p>
      </div>

      {/* Selected Concepts with Limit Indicator */}
      <Card className="p-4 min-h-[80px] border-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">Your Message</h2>
            <span className="text-sm text-muted-foreground">
              ({selectedConcepts.length}/{caregiverSettings.maxConcepts})
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedConcepts([])}
              disabled={selectedConcepts.length === 0}
            >
              Clear All
            </Button>
            <Button
              onClick={generateSpeech}
              disabled={selectedConcepts.length === 0 || isGenerating}
              className="text-sm font-medium"
            >
              <Volume2 className="w-4 h-4 mr-1" />
              {isGenerating ? "Creating..." : "Speak"}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 min-h-[40px] items-center">
          {selectedConcepts.length === 0 ? (
            <p className="text-muted-foreground italic">Select up to {caregiverSettings.maxConcepts} concepts</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedConcepts.map((conceptId, index) => (
                <InteractiveConceptPill
                  key={`${conceptId}-${index}`}
                  conceptId={conceptId}
                  label={getConceptLabel(conceptId)}
                  index={index}
                  onRemove={handleConceptRemove}
                  onReorder={handleConceptReorder}
                  isDragging={false}
                  onDragStart={() => {}}
                  onDragEnd={() => {}}
                />
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Generated Sentence */}
      {generatedSentence && (
        <Card className="p-4 border-2 border-primary/20 bg-primary/5">
          <div className="text-center">
            <p className="text-xl font-medium text-foreground text-balance">{generatedSentence}</p>
          </div>
        </Card>
      )}

      {/* Category Tabs - Simplified if enabled */}
      <div className="flex flex-wrap gap-2 justify-center">
        {Object.entries(filteredCategories).map(([categoryId, category]) => (
          <Button
            key={categoryId}
            variant={activeCategory === categoryId ? "default" : "outline"}
            onClick={() => setActiveCategory(categoryId)}
            className="text-sm font-medium"
          >
            {(category as any).name}
          </Button>
        ))}
      </div>

      {/* Concept Grid - Adaptive based on caregiver settings */}
      <div className={getGridClasses()}>
        {getFilteredConcepts(filteredCategories[activeCategory as keyof typeof filteredCategories]?.concepts || []).map(
          (concept: any) => (
            <Card
              key={concept.id}
              className={`cursor-pointer hover:bg-accent hover:border-accent-foreground/20 transition-all duration-200 border-2 hover:scale-105 active:scale-95 p-6 ${
                selectedConcepts.length >= caregiverSettings.maxConcepts ? "opacity-50" : ""
              }`}
              onClick={() => handleConceptSelect(concept.id)}
            >
              <div className="text-center space-y-3">
                <div className={getIconSize()} role="img" aria-label={concept.label}>
                  {concept.icon}
                </div>
                {caregiverSettings.showTextLabels && (
                  <p className="font-medium text-foreground text-lg">{concept.label}</p>
                )}
              </div>
            </Card>
          ),
        )}
      </div>
    </div>
  )
}
