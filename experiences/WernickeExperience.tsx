"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowDown } from "lucide-react"

// Severely impaired comprehension requires visual-only interface
interface WernickeExperienceProps {
  conceptCategories: any
  userSettings: any
  onSettingsChange: (settings: any) => void
}

export function WernickeExperience({ conceptCategories, userSettings, onSettingsChange }: WernickeExperienceProps) {
  const [inputSentence, setInputSentence] = useState<string>("")
  const [deconstructedIcons, setDeconstructedIcons] = useState<any[]>([])
  const [isDeconstructing, setIsDeconstructing] = useState(false)

  const deconstructSentence = async () => {
    if (!inputSentence.trim()) return

    setIsDeconstructing(true)
    try {
      const response = await fetch("/api/deconstruct-sentence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sentence: inputSentence,
          profile: "wernicke",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to deconstruct sentence")
      }

      const { icons } = await response.json()
      setDeconstructedIcons(icons)
    } catch (error) {
      console.error("Error deconstructing sentence:", error)
      // Fallback: simple word-to-icon mapping
      const words = inputSentence.toLowerCase().split(" ")
      const mappedIcons = words.map((word) => {
        // Simple mapping - in real implementation, this would be more sophisticated
        const iconMap: { [key: string]: string } = {
          i: "👤",
          need: "❗",
          help: "🤝",
          water: "💧",
          food: "🍽️",
          pain: "😣",
          tired: "😴",
          home: "🏠",
          bathroom: "🚻",
        }
        return { word, icon: iconMap[word] || "❓", id: Math.random().toString() }
      })
      setDeconstructedIcons(mappedIcons)
    } finally {
      setIsDeconstructing(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Minimal header - no complex text for Wernicke's */}
      <div className="text-center space-y-4">
        <div className="text-6xl">💬➡️🎨</div>
        <h1 className="text-2xl font-bold text-foreground">Words to Pictures</h1>
      </div>

      {/* Large text input for sentence deconstruction */}
      <Card className="p-6 border-2">
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-4xl mb-2">✍️</div>
            <h2 className="text-xl font-semibold">Type your sentence</h2>
          </div>

          <Input
            value={inputSentence}
            onChange={(e) => setInputSentence(e.target.value)}
            placeholder="I need help..."
            className="text-xl p-4 text-center"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                deconstructSentence()
              }
            }}
          />

          <Button
            onClick={deconstructSentence}
            disabled={!inputSentence.trim() || isDeconstructing}
            className="w-full text-lg py-3"
            size="lg"
          >
            <ArrowDown className="w-6 h-6 mr-2" />
            {isDeconstructing ? "Converting..." : "Convert to Pictures"}
          </Button>
        </div>
      </Card>

      {/* Visual output - icons only, no text */}
      {deconstructedIcons.length > 0 && (
        <Card className="p-6 border-2 border-primary/20 bg-primary/5">
          <div className="text-center space-y-4">
            <div className="text-4xl">🎨</div>
            <h3 className="text-xl font-semibold">Your Pictures</h3>

            <div className="flex flex-wrap justify-center gap-4 mt-6">
              {deconstructedIcons.map((item, index) => (
                <div key={item.id || index} className="text-center">
                  <Card className="p-4 bg-background border-2 hover:scale-105 transition-transform">
                    <div className="text-6xl mb-2">{item.icon}</div>
                    {/* No text labels for Wernicke's - severely impaired comprehension */}
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* Emergency communication icons - large, high contrast */}
      <Card className="p-6 border-2">
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">🚨</div>
          <h3 className="text-xl font-semibold">Quick Help</h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { icon: "😣", id: "pain" },
            { icon: "💧", id: "water" },
            { icon: "🤝", id: "help" },
            { icon: "🚻", id: "bathroom" },
            { icon: "🏠", id: "home" },
            { icon: "👨‍⚕️", id: "doctor" },
          ].map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer hover:bg-accent transition-all duration-200 border-2 hover:scale-105 p-8"
              onClick={() => {
                // Immediate visual feedback and audio
                if ("speechSynthesis" in window) {
                  const utterance = new SpeechSynthesisUtterance(item.id)
                  speechSynthesis.speak(utterance)
                }
              }}
            >
              <div className="text-center">
                <div className="text-8xl">{item.icon}</div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  )
}
