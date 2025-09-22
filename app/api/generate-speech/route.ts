import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

export async function POST(request: Request) {
  try {
    const { concepts, profile } = await request.json()

    if (!concepts || concepts.length === 0) {
      return Response.json({ error: "No concepts provided" }, { status: 400 })
    }

    const getPromptForProfile = (profile: string, concepts: string[]) => {
      const conceptList = concepts.join(", ")

      switch (profile) {
        case "broca":
          return `You are helping someone with Broca's aphasia who has preserved comprehension but non-fluent speech. Create a complete, grammatically correct sentence from these concepts. The person understands complex language but struggles to produce it.

Concepts: ${conceptList}

Generate a full, well-structured sentence that clearly expresses what they want to communicate.`

        case "wernicke":
          return `You are helping someone with Wernicke's aphasia who has severely impaired comprehension. This should not be used for sentence generation - redirect to visual deconstruction instead.

Concepts: ${conceptList}

Generate a simple acknowledgment that these concepts were received.`

        case "global":
          return `You are helping someone with Global aphasia who has severe impairments across all language functions. Create a very simple, urgent message using basic words.

Concepts: ${conceptList}

Generate a short, simple sentence using only essential words. Keep it under 5 words.`

        case "conduction":
          return `You are helping someone with Conduction aphasia who has fluent speech and preserved comprehension but impaired repetition. Create a natural, flowing sentence.

Concepts: ${conceptList}

Generate a fluent, natural sentence that flows well and doesn't require repetition or copying.`

        case "anomic":
          return `You are helping someone with Anomic aphasia who has fluent speech and preserved comprehension but struggles with word-finding. Create a sentence that includes helpful word choices.

Concepts: ${conceptList}

Generate a complete sentence that demonstrates good word choices and helps with word retrieval.`

        case "ppa":
          return `You are helping someone with Primary Progressive Aphasia. Adapt the complexity based on their current stage. Create a clear, supportive sentence.

Concepts: ${conceptList}

Generate a sentence that is clear and appropriately complex for someone with progressive language decline.`

        default:
          return `You are an assistive communication AI helping someone with expressive aphasia. Convert these selected concepts into a natural, helpful sentence.

Concepts: ${conceptList}

Generate a natural sentence that combines these concepts meaningfully.`
      }
    }

    const prompt = getPromptForProfile(profile || "default", concepts)

    const { text } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      prompt,
      maxTokens: profile === "global" ? 50 : 100,
      temperature: profile === "global" ? 0.3 : 0.7,
    })

    return Response.json({ sentence: text.trim() })
  } catch (error) {
    console.error("Error generating speech:", error)
    return Response.json({ error: "Failed to generate speech" }, { status: 500 })
  }
}
