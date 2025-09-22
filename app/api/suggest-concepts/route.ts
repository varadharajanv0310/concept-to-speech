import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

export async function POST(request: Request) {
  try {
    const { selectedConcepts, allConceptLabels } = await request.json()

    if (!selectedConcepts || selectedConcepts.length === 0) {
      return Response.json({ suggestions: [] })
    }

    // Don't suggest if user already has 5+ concepts
    if (selectedConcepts.length >= 5) {
      return Response.json({ suggestions: [] })
    }

    const prompt = `You are an AI assistant helping someone with expressive aphasia communicate more effectively. Based on the concepts they've already selected, predict the 3 most likely next concepts they might want to add to complete their message.

Current selected concepts: ${selectedConcepts.join(", ")}

Available concepts to choose from: ${allConceptLabels.join(", ")}

Rules:
1. Only suggest concepts from the available list
2. Consider natural communication patterns and common phrases
3. Think about what would logically complete or enhance their message
4. Return exactly 3 suggestions
5. Return only the concept labels, separated by commas, no explanations

Example: If they selected "I, need" you might suggest "help, doctor, medicine"

Suggestions:`

    const { text } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      prompt,
      maxTokens: 50,
      temperature: 0.3, // Lower temperature for more predictable suggestions
    })

    const suggestions = text
      .trim()
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s && allConceptLabels.includes(s))
      .slice(0, 3)

    return Response.json({ suggestions })
  } catch (error) {
    console.error("Error generating concept suggestions:", error)
    return Response.json({ suggestions: [] })
  }
}
