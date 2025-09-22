"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Volume2, Search, Lightbulb, Star } from "lucide-react"
import { InteractiveConceptPill } from "@/components/interactive-concept-pill"

// Preserved comprehension and fluent speech, but impaired word-finding
interface AnomicExperienceProps {
  conceptCategories: any
  userSettings: any
  onSettingsChange: (settings: any) => void
}

export function AnomicExperience({ conceptCategories, userSettings, onSettingsChange }: AnomicExperienceProps) {
  const [selectedConcepts, setSelectedConcepts] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState<string>("people")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedSentence, setGeneratedSentence] = useState<string>("")
  const [isSearching, setIsSearching] = useState(false)

  // Enhanced search for word-finding assistance
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      // Search through all concepts
      const allConcepts = Object.values(conceptCategories).flatMap((category: any) =>
        category.concepts.map((concept: any) => ({
          ...concept,
          category: category.name,
        })),
      )

      const results = allConcepts.filter(
        (concept: any) =>
          concept.label.toLowerCase().includes(query.toLowerCase()) ||
          concept.id.toLowerCase().includes(query.toLowerCase()),
      )

      // AI-powered semantic search for better word-finding
      const response = await fetch("/api/semantic-search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          concepts: allConcepts,
          profile: "anomic",
        }),
      })

      if (response.ok) {
        const { suggestions } = await response.json()
        setSearchResults([...results, ...suggestions])
      } else {
        setSearchResults(results)
      }
    } catch (error) {
      console.error("Search error:", error)
      // Fallback to simple text matching
      const allConcepts = Object.values(conceptCategories).flatMap((category: any) =>
        category.concepts.map((concept: any) => ({
          ...concept,
          category: category.name,
        })),
      )
      const results = allConcepts.filter((concept: any) => concept.label.toLowerCase().includes(query.toLowerCase()))
      setSearchResults(results)
    } finally {
      setIsSearching(false)
    }
  }

  // AI-powered next-word suggestions
  const generateSuggestions = async () => {
    if (selectedConcepts.length === 0) return

    try {
      const conceptLabels = selectedConcepts.map(getConceptLabel)
      const response = await fetch("/api/word-suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          concepts: conceptLabels,
          profile: "anomic",
        }),
      })

      if (response.ok) {
        const { suggestions } = await response.json()
        setAiSuggestions(suggestions)
      }
    } catch (error) {
      console.error("Suggestion error:", error)
    }
  }

  useEffect(() => {
    generateSuggestions()
  }, [selectedConcepts])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      performSearch(searchQuery)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  const handleConceptSelect = (conceptId: string) => {
    setSelectedConcepts((prev) => [...prev, conceptId])
    setSearchQuery("") // Clear search after selection
    setSearchResults([])
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
          profile: "anomic", // Enhanced word-finding support
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate speech")
      }

      const { sentence } = await response.json()
      setGeneratedSentence(sentence)
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Word-Finding Assistant</h1>
        <p className="text-muted-foreground text-lg">Enhanced search and suggestions to help find the right words</p>
      </div>

      {/* Prominent Search Bar - Always visible for Anomic users */}
      <Card className="p-4 border-2 border-primary/30 bg-primary/5">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Find Words</h2>
          </div>

          <div className="relative">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type what you're looking for... (e.g., 'something to drink', 'feeling sad')"
              className="text-lg p-4 pr-12"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              </div>
            )}
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-60 overflow-y-auto">
              {searchResults.slice(0, 12).map((concept, index) => (
                <Card
                  key={`search-${concept.id}-${index}`}
                  className="cursor-pointer hover:bg-accent transition-all duration-200 border hover:scale-105 p-3"
                  onClick={() => handleConceptSelect(concept.id)}
                >
                  <div className="text-center space-y-2">
                    <div className="text-3xl">{concept.icon}</div>
                    <p className="font-medium text-sm">{concept.label}</p>
                    <p className="text-xs text-muted-foreground">{concept.category}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Selected Concepts */}
      <Card className="p-4 min-h-[80px] border-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">Your Message</h2>
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
            <p className="text-muted-foreground italic">Search and select words above, or browse categories below</p>
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

      {/* AI Suggestions - Highlighted for word-finding assistance */}
      {aiSuggestions.length > 0 && (
        <Card className="p-4 border-2 border-yellow-300 bg-yellow-50">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              <h3 className="text-lg font-semibold text-foreground">Suggested Next Words</h3>
            </div>

            <div className="flex flex-wrap gap-2">
              {aiSuggestions.map((suggestion, index) => (
                <Button
                  key={`suggestion-${index}`}
                  variant="outline"
                  size="sm"
                  onClick={() => handleConceptSelect(suggestion.id)}
                  className="bg-yellow-100 border-yellow-300 hover:bg-yellow-200 text-yellow-800"
                >
                  <Star className="w-3 h-3 mr-1" />
                  {suggestion.label}
                </Button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Generated Sentence */}
      {generatedSentence && (
        <Card className="p-4 border-2 border-primary/20 bg-primary/5">
          <div className="text-center">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Your Complete Message:</h3>
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

      {/* Concept Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {conceptCategories[activeCategory as keyof typeof conceptCategories]?.concepts.map((concept: any) => (
          <Card
            key={concept.id}
            className="cursor-pointer hover:bg-accent hover:border-accent-foreground/20 transition-all duration-200 border-2 hover:scale-105 active:scale-95 p-6"
            onClick={() => handleConceptSelect(concept.id)}
          >
            <div className="text-center space-y-3">
              <div className="text-4xl" role="img" aria-label={concept.label}>
                {concept.icon}
              </div>
              <p className="font-medium text-foreground text-lg">{concept.label}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
