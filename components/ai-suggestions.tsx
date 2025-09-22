"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"

interface AISuggestionsProps {
  selectedConcepts: string[]
  allConcepts: any
  onConceptSelect: (conceptId: string) => void
  getConceptLabel: (conceptId: string) => string
}

export function AISuggestions({ selectedConcepts, allConcepts, onConceptSelect, getConceptLabel }: AISuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const getSuggestions = async () => {
      if (selectedConcepts.length === 0 || selectedConcepts.length >= 5) {
        setSuggestions([])
        return
      }

      setIsLoading(true)
      try {
        // Get all available concept labels
        const allConceptLabels: string[] = []
        Object.values(allConcepts).forEach((category: any) => {
          category.concepts.forEach((concept: any) => {
            allConceptLabels.push(concept.label)
          })
        })

        const selectedLabels = selectedConcepts.map(getConceptLabel)

        const response = await fetch("/api/suggest-concepts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            selectedConcepts: selectedLabels,
            allConceptLabels,
          }),
        })

        if (response.ok) {
          const { suggestions: newSuggestions } = await response.json()
          setSuggestions(newSuggestions || [])
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }

    // Debounce the API call
    const timeoutId = setTimeout(getSuggestions, 500)
    return () => clearTimeout(timeoutId)
  }, [selectedConcepts, allConcepts, getConceptLabel])

  const findConceptId = (label: string) => {
    for (const category of Object.values(allConcepts)) {
      const concept = (category as any).concepts.find((c: any) => c.label === label)
      if (concept) return concept.id
    }
    return null
  }

  const handleSuggestionClick = (suggestion: string) => {
    const conceptId = findConceptId(suggestion)
    if (conceptId) {
      onConceptSelect(conceptId)
    }
  }

  if (selectedConcepts.length === 0 || selectedConcepts.length >= 5 || suggestions.length === 0) {
    return null
  }

  return (
    <Card className="p-4 border-2 border-blue-200 bg-blue-50/50 animate-in slide-in-from-top duration-300">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-blue-600" />
        <h3 className="text-sm font-medium text-blue-800">AI Suggestions</h3>
        {isLoading && (
          <div className="flex space-x-1">
            <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse delay-100"></div>
            <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse delay-200"></div>
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <Badge
            key={suggestion}
            variant="outline"
            className="cursor-pointer hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 hover:scale-105 active:scale-95 animate-in zoom-in duration-300 text-blue-700 border-blue-300"
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => handleSuggestionClick(suggestion)}
          >
            <Sparkles className="w-3 h-3 mr-1" />
            {suggestion}
          </Badge>
        ))}
      </div>
      <p className="text-xs text-blue-600 mt-2 opacity-80">Click a suggestion to add it to your message</p>
    </Card>
  )
}
