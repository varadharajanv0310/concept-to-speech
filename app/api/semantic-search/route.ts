import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

export async function POST(request: Request) {
  try {
    const { query, concepts, profile } = await request.json()

    if (!query || query.trim().length === 0) {
      return Response.json({ suggestions: [] })
    }

    const prompt = `You are helping someone with Anomic aphasia who has difficulty finding words. They are searching for: "${query}"

Available concepts: ${JSON.stringify(concepts.map((c: any) => ({ id: c.id, label: c.label, category: c.category })))}

Based on their search query, suggest the most relevant concepts that match what they might be looking for. Consider:
- Semantic similarity (meaning-based matches)
- Contextual relevance
- Synonyms and related concepts
- Common communication needs

Return a JSON array of the most relevant concept objects (maximum 8). Include the full concept object with id, label, icon, and category.

Example format:
[
  {"id": "water", "label": "Water", "icon": "💧", "category": "Actions"},
  {"id": "thirsty", "label": "Thirsty", "icon": "🥤", "category": "Feelings"}
]`

    const { text } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      prompt,
      maxTokens: 300,
      temperature: 0.4,
    })

    try {
      const suggestions = JSON.parse(text.trim())
      return Response.json({ suggestions: suggestions.slice(0, 8) })
    } catch (parseError) {
      // Fallback to simple text matching
      const queryLower = query.toLowerCase()
      const matches = concepts
        .filter(
          (concept: any) =>
            concept.label.toLowerCase().includes(queryLower) || concept.id.toLowerCase().includes(queryLower),
        )
        .slice(0, 8)

      return Response.json({ suggestions: matches })
    }
  } catch (error) {
    console.error("Error in semantic search:", error)
    return Response.json({ error: "Failed to perform semantic search" }, { status: 500 })
  }
}
