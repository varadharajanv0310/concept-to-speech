import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

export async function POST(request: Request) {
  try {
    const { concepts, profile } = await request.json()

    if (!concepts || concepts.length === 0) {
      return Response.json({ suggestions: [] })
    }

    const prompt = `You are helping someone with Anomic aphasia who struggles with word-finding. They have selected these concepts so far: ${concepts.join(", ")}

Based on these concepts, suggest 4-6 logical next words/concepts that would commonly follow in natural communication. Consider:
- Common sentence patterns
- Logical semantic relationships
- Typical communication needs
- What someone might want to express next

Return a JSON array of suggested concepts with id and label properties. Make the suggestions practical and commonly used.

Example format:
[
  {"id": "please", "label": "Please"},
  {"id": "now", "label": "Now"},
  {"id": "today", "label": "Today"}
]`

    const { text } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      prompt,
      maxTokens: 200,
      temperature: 0.6,
    })

    try {
      const suggestions = JSON.parse(text.trim())
      return Response.json({ suggestions: suggestions.slice(0, 6) })
    } catch (parseError) {
      // Fallback suggestions based on common patterns
      const fallbackSuggestions = [
        { id: "please", label: "Please" },
        { id: "now", label: "Now" },
        { id: "today", label: "Today" },
        { id: "thank-you", label: "Thank You" },
      ]
      return Response.json({ suggestions: fallbackSuggestions })
    }
  } catch (error) {
    console.error("Error generating word suggestions:", error)
    return Response.json({ error: "Failed to generate suggestions" }, { status: 500 })
  }
}
