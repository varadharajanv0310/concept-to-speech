"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Volume2, Heart, HeartOff } from "lucide-react"
import { InteractiveConceptPill } from "@/components/interactive-concept-pill"

// Focus on clear text labels and full sentence generation
interface BrocaExperienceProps {
  conceptCategories: any
  userSettings: any
  onSettingsChange: (settings: any) => void
}

export function BrocaExperience({ conceptCategories, userSettings, onSettingsChange }: BrocaExperienceProps) {
  const [selectedConcepts, setSelectedConcepts] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState<string>("people")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedSentence, setGeneratedSentence] = useState<string>("")
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [conceptHistory, setConceptHistory] = useState<string[][]>([])

  const handleConceptSelect = (conceptId: string) => {
    setSelectedConcepts((prev) => [...prev, conceptId])
  }

  const handleConceptRemove = (index: number) => {
    setSelectedConcepts((prev) => prev.filter((_, i) => i !== index))
  }

  const clearSelection = () => {
    setSelectedConcepts([])
  }

  const generateSpeech = async () => {
    if (selectedConcepts.length === 0) return

    setIsGenerating(true)
    try {
      const conceptLabels = selectedConcepts.map((conceptId) => {
        for (const category of Object.values(conceptCategories)) {
          const concept = (category as any).concepts.find((c: any) => c.id === conceptId)
          if (concept) return concept.label
        }
        return conceptId
      })

      const response = await fetch("/api/generate-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          concepts: conceptLabels,
          profile: "broca", // Optimized for grammatically correct, complete sentences
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate speech")
      }

      const { sentence } = await response.json()
      setGeneratedSentence(sentence)

      // Immediate speech synthesis for Broca's users
      if ("speechSynthesis" in window) {
        setIsSpeaking(true)
        const utterance = new SpeechSynthesisUtterance(sentence)
        utterance.rate = 0.7 // Slower rate for better comprehension
        utterance.onend = () => setIsSpeaking(false)
        utterance.onerror = () => setIsSpeaking(false)
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

  const handleConceptReorder = (fromIndex: number, toIndex: number) => {
    setSelectedConcepts((prev) => {
      const newConcepts = [...prev]
      const [movedConcept] = newConcepts.splice(fromIndex, 1)
      newConcepts.splice(toIndex, 0, movedConcept)
      return newConcepts
    })
  }

  const toggleFavorite = () => {
    if (!generatedSentence) return
    const isFavorite = userSettings.favoriteMessages?.includes(generatedSentence)
    const newFavorites = isFavorite
      ? userSettings.favoriteMessages.filter((msg: string) => msg !== generatedSentence)
      : [...(userSettings.favoriteMessages || []), generatedSentence]

    onSettingsChange({
      ...userSettings,
      favoriteMessages: newFavorites,
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header optimized for Broca's */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Communication Assistant</h1>
        <p className="text-muted-foreground text-lg">Build your message step by step</p>
      </div>

      {/* Selected Concepts - Enhanced for Broca's with clear text labels */}
      <Card className="p-4 min-h-[80px] border-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">Your Message</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearSelection}
              disabled={selectedConcepts.length === 0}
              className="text-sm bg-transparent"
            >
              Clear All
            </Button>
            <Button
              onClick={generateSpeech}
              disabled={selectedConcepts.length === 0 || isGenerating || isSpeaking}
              className="text-sm font-medium"
            >
              <Volume2 className="w-4 h-4 mr-1" />
              {isGenerating ? "Creating..." : isSpeaking ? "Speaking..." : "Speak"}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 min-h-[40px] items-center">
          {selectedConcepts.length === 0 ? (
            <p className="text-muted-foreground italic">Select concepts below to build your message</p>
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

      {/* Generated Sentence - Full grammatical sentences for Broca's */}
      {generatedSentence && (
        <Card className="p-4 border-2 border-primary/20 bg-primary/5">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Complete Message:</h3>
              <Button variant="ghost" size="sm" onClick={toggleFavorite} className="text-sm">
                {userSettings.favoriteMessages?.includes(generatedSentence) ? (
                  <Heart className="w-4 h-4 fill-current text-red-500" />
                ) : (
                  <HeartOff className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xl font-medium text-foreground text-balance">{generatedSentence}</p>
          </div>
        </Card>
      )}

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 justify-center">
        {Object.entries(conceptCategories).map(([categoryId, category]) => (
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

      {/* Concept Grid - Clear text labels for preserved comprehension */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {conceptCategories[activeCategory as keyof typeof conceptCategories]?.concepts.map(
          (concept: any, index: number) => (
            <Card
              key={concept.id}
              className="cursor-pointer hover:bg-accent hover:border-accent-foreground/20 transition-all duration-200 border-2 hover:scale-105 active:scale-95 p-6"
              onClick={() => handleConceptSelect(concept.id)}
            >
              <div className="text-center space-y-3">
                <div className="text-4xl" role="img" aria-label={concept.label}>
                  {concept.icon}
                </div>
                {/* Always show text labels for Broca's - preserved comprehension */}
                <p className="font-medium text-foreground text-lg">{concept.label}</p>
              </div>
            </Card>
          ),
        )}
      </div>
    </div>
  )
}
