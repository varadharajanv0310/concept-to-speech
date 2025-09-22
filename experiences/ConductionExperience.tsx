"use client"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mic, Play, Square, Volume2 } from "lucide-react"

// Preserved comprehension and fluent speech, but severely impaired repetition
interface ConductionExperienceProps {
  conceptCategories: any
  userSettings: any
  onSettingsChange: (settings: any) => void
}

export function ConductionExperience({ conceptCategories, userSettings, onSettingsChange }: ConductionExperienceProps) {
  const [selectedConcepts, setSelectedConcepts] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState<string>("people")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedSentence, setGeneratedSentence] = useState<string>("")
  const [practiceMode, setPracticeMode] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordedAudio, setRecordedAudio] = useState<string>("")
  const [practicePhrase, setPracticePhrase] = useState<string>("")
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)

  const practiceTargets = [
    "I want to go home",
    "Please help me",
    "I need water",
    "Call my family",
    "I feel better today",
  ]

  const handleConceptSelect = (conceptId: string) => {
    setSelectedConcepts((prev) => [...prev, conceptId])
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
          profile: "conduction", // Fluent speech with word-finding support
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

  const startPracticeSession = () => {
    const randomPhrase = practiceTargets[Math.floor(Math.random() * practiceTargets.length)]
    setPracticePhrase(randomPhrase)
    setPracticeMode(true)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      const chunks: BlobPart[] = []
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/wav" })
        const url = URL.createObjectURL(blob)
        setRecordedAudio(url)
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error starting recording:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const playTargetPhrase = () => {
    if ("speechSynthesis" in window && practicePhrase) {
      const utterance = new SpeechSynthesisUtterance(practicePhrase)
      utterance.rate = 0.7
      speechSynthesis.speak(utterance)
    }
  }

  const getConceptLabel = (conceptId: string) => {
    for (const category of Object.values(conceptCategories)) {
      const concept = (category as any).concepts.find((c: any) => c.id === conceptId)
      if (concept) return concept.label
    }
    return conceptId
  }

  if (practiceMode) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Speech Practice</h1>
          <p className="text-muted-foreground">Listen and speak naturally - no repetition required</p>
        </div>

        <Card className="p-6 border-2">
          <div className="text-center space-y-6">
            <h2 className="text-xl font-semibold">Target Phrase</h2>
            <div className="bg-primary/10 p-6 rounded-lg">
              <p className="text-2xl font-medium text-foreground">{practicePhrase}</p>
            </div>

            <Button onClick={playTargetPhrase} className="text-lg px-6 py-3" size="lg">
              <Volume2 className="w-5 h-5 mr-2" />
              Listen to Target
            </Button>
          </div>
        </Card>

        <Card className="p-6 border-2">
          <div className="text-center space-y-6">
            <h3 className="text-xl font-semibold">Your Response</h3>
            <p className="text-muted-foreground">Speak naturally in your own words</p>

            <div className="flex justify-center gap-4">
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                variant={isRecording ? "destructive" : "default"}
                size="lg"
                className="text-lg px-6 py-3"
              >
                {isRecording ? (
                  <>
                    <Square className="w-5 h-5 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 mr-2" />
                    Start Speaking
                  </>
                )}
              </Button>

              {recordedAudio && (
                <Button
                  onClick={() => {
                    const audio = new Audio(recordedAudio)
                    audio.play()
                  }}
                  variant="outline"
                  size="lg"
                  className="text-lg px-6 py-3"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Play Back
                </Button>
              )}
            </div>
          </div>
        </Card>

        <div className="flex justify-center gap-4">
          <Button onClick={() => setPracticeMode(false)} variant="outline" size="lg">
            Back to Communication
          </Button>
          <Button onClick={startPracticeSession} size="lg">
            New Practice Phrase
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Communication Assistant</h1>
        <p className="text-muted-foreground">Express yourself naturally</p>
      </div>

      <div className="flex justify-center gap-4">
        <Button onClick={startPracticeSession} variant="outline" size="lg" className="text-lg px-6 py-3 bg-transparent">
          <Mic className="w-5 h-5 mr-2" />
          Practice Speaking
        </Button>
      </div>

      {/* Standard concept selection interface */}
      <Card className="p-4 min-h-[80px] border-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-foreground">Your Message</h2>
          <Button
            onClick={generateSpeech}
            disabled={selectedConcepts.length === 0 || isGenerating}
            className="text-sm font-medium"
          >
            <Volume2 className="w-4 h-4 mr-1" />
            {isGenerating ? "Creating..." : "Generate"}
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 min-h-[40px] items-center">
          {selectedConcepts.length === 0 ? (
            <p className="text-muted-foreground italic">Select concepts to build your message</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selectedConcepts.map((conceptId, index) => (
                <span
                  key={`${conceptId}-${index}`}
                  className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm"
                >
                  {getConceptLabel(conceptId)}
                </span>
              ))}
            </div>
          )}
        </div>
      </Card>

      {generatedSentence && (
        <Card className="p-4 border-2 border-primary/20 bg-primary/5">
          <div className="text-center">
            <p className="text-xl font-medium text-foreground">{generatedSentence}</p>
          </div>
        </Card>
      )}

      {/* Category selection and concept grid */}
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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {conceptCategories[activeCategory as keyof typeof conceptCategories]?.concepts.map((concept: any) => (
          <Card
            key={concept.id}
            className="cursor-pointer hover:bg-accent transition-all duration-200 border-2 hover:scale-105 p-6"
            onClick={() => handleConceptSelect(concept.id)}
          >
            <div className="text-center space-y-3">
              <div className="text-4xl">{concept.icon}</div>
              <p className="font-medium text-foreground text-lg">{concept.label}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
