"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Concept {
  id: string
  label: string
  icon: string
  category: string
}

interface ConceptSearchProps {
  allConcepts: Record<string, { name: string; concepts: Concept[] }>
  onConceptSelect: (conceptId: string) => void
  isVisible: boolean
  onClose: () => void
}

export function ConceptSearch({ allConcepts, onConceptSelect, isVisible, onClose }: ConceptSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const allConceptsList = useMemo(() => {
    const concepts: Concept[] = []
    Object.values(allConcepts).forEach((category) => {
      concepts.push(...category.concepts)
    })
    return concepts
  }, [allConcepts])

  const filteredConcepts = useMemo(() => {
    if (!searchTerm.trim()) return []

    return allConceptsList
      .filter((concept) => concept.label.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 12) // Limit results
  }, [searchTerm, allConceptsList])

  const handleConceptClick = (conceptId: string) => {
    onConceptSelect(conceptId)
    setSearchTerm("")
    onClose()
  }

  if (!isVisible) return null

  return (
    <Card className="p-4 border-2 border-primary/20 bg-primary/5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">Search Concepts</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
          <X className="w-4 h-4" />
        </Button>
      </div>

      <Input
        placeholder="Type to search concepts..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-3"
        autoFocus
      />

      {searchTerm.trim() && (
        <div className="space-y-2">
          {filteredConcepts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {filteredConcepts.map((concept) => (
                <Card
                  key={concept.id}
                  className="p-3 cursor-pointer hover:bg-accent hover:border-accent-foreground/20 transition-all duration-200 border hover:scale-105"
                  onClick={() => handleConceptClick(concept.id)}
                >
                  <div className="text-center space-y-1">
                    <div className="text-2xl" role="img" aria-label={concept.label}>
                      {concept.icon}
                    </div>
                    <p className="font-medium text-foreground text-sm">{concept.label}</p>
                    <p className="text-xs text-muted-foreground capitalize">{concept.category}</p>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-4">No concepts found for "{searchTerm}"</p>
          )}
        </div>
      )}
    </Card>
  )
}
