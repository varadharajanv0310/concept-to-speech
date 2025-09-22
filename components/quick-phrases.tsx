"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Volume2, Zap } from "lucide-react"

interface QuickPhrasesProps {
  onPhraseSelect: (phrase: string) => void
  onPhraseSpeak: (phrase: string) => void
  userSettings: {
    speechRate: number
    speechPitch: number
    speechVolume: number
    favoriteMessages: string[]
  }
}

const commonPhrases = [
  { id: "help", text: "I need help", category: "urgent" },
  { id: "pain", text: "I am in pain", category: "urgent" },
  { id: "bathroom", text: "I need to use the bathroom", category: "urgent" },
  { id: "water", text: "I want some water", category: "basic" },
  { id: "food", text: "I am hungry", category: "basic" },
  { id: "tired", text: "I am tired", category: "basic" },
  { id: "thank-you", text: "Thank you", category: "social" },
  { id: "yes", text: "Yes", category: "social" },
  { id: "no", text: "No", category: "social" },
  { id: "hello", text: "Hello", category: "social" },
]

export function QuickPhrases({ onPhraseSelect, onPhraseSpeak, userSettings }: QuickPhrasesProps) {
  const handlePhraseSpeak = (phrase: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(phrase)
      utterance.rate = userSettings.speechRate
      utterance.pitch = userSettings.speechPitch
      utterance.volume = userSettings.speechVolume
      speechSynthesis.speak(utterance)
    }
    onPhraseSpeak(phrase)
  }

  const urgentPhrases = commonPhrases.filter((p) => p.category === "urgent")
  const basicPhrases = commonPhrases.filter((p) => p.category === "basic")
  const socialPhrases = commonPhrases.filter((p) => p.category === "social")

  return (
    <Card className="p-4 border-2">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Quick Phrases</h2>
      </div>

      <div className="space-y-4">
        {/* Urgent Phrases */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Urgent</h3>
          <div className="flex flex-wrap gap-2">
            {urgentPhrases.map((phrase) => (
              <div key={phrase.id} className="flex items-center gap-1">
                <Badge
                  variant="destructive"
                  className="cursor-pointer hover:bg-destructive/80 transition-colors px-3 py-2"
                  onClick={() => onPhraseSelect(phrase.text)}
                >
                  {phrase.text}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handlePhraseSpeak(phrase.text)}
                >
                  <Volume2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Basic Needs */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Basic Needs</h3>
          <div className="flex flex-wrap gap-2">
            {basicPhrases.map((phrase) => (
              <div key={phrase.id} className="flex items-center gap-1">
                <Badge
                  variant="secondary"
                  className="cursor-pointer hover:bg-secondary/80 transition-colors px-3 py-2"
                  onClick={() => onPhraseSelect(phrase.text)}
                >
                  {phrase.text}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handlePhraseSpeak(phrase.text)}
                >
                  <Volume2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Social */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Social</h3>
          <div className="flex flex-wrap gap-2">
            {socialPhrases.map((phrase) => (
              <div key={phrase.id} className="flex items-center gap-1">
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-accent transition-colors px-3 py-2"
                  onClick={() => onPhraseSelect(phrase.text)}
                >
                  {phrase.text}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handlePhraseSpeak(phrase.text)}
                >
                  <Volume2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Favorite Messages */}
        {userSettings.favoriteMessages.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Your Favorites</h3>
            <div className="flex flex-wrap gap-2">
              {userSettings.favoriteMessages.slice(0, 5).map((message, index) => (
                <div key={index} className="flex items-center gap-1">
                  <Badge
                    variant="default"
                    className="cursor-pointer hover:bg-primary/80 transition-colors px-3 py-2 max-w-[200px] truncate"
                    onClick={() => onPhraseSelect(message)}
                  >
                    {message}
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handlePhraseSpeak(message)}>
                    <Volume2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
