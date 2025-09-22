import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

export async function POST(request: Request) {
  try {
    const { sentence, profile } = await request.json()

    if (!sentence || sentence.trim().length === 0) {
      return Response.json({ error: "No sentence provided" }, { status: 400 })
    }

    const prompt = `You are helping someone with Wernicke's aphasia who has severely impaired comprehension but needs visual communication. Break down this sentence into simple visual concepts that can be represented by emojis/icons.

Sentence: "${sentence}"

For each important word, provide:
1. The word
2. An appropriate emoji/icon
3. Keep it simple and visual

Return a JSON array of objects with "word" and "icon" properties. Focus on concrete, visual concepts. Limit to 6 items maximum.

Example format:
[
  {"word": "I", "icon": "👤"},
  {"word": "need", "icon": "❗"},
  {"word": "help", "icon": "🤝"}
]`

    const { text } = await generateText({
      model: groq("llama-3.1-8b-instant"),
      prompt,
      maxTokens: 200,
      temperature: 0.3,
    })

    try {
      const icons = JSON.parse(text.trim())
      return Response.json({ icons })
    } catch (parseError) {
      // Fallback if JSON parsing fails
      const words = sentence.toLowerCase().split(" ").slice(0, 6)
      const fallbackIcons = words.map((word) => ({
        word,
        icon: getIconForWord(word),
        id: Math.random().toString(),
      }))
      return Response.json({ icons: fallbackIcons })
    }
  } catch (error) {
    console.error("Error deconstructing sentence:", error)
    return Response.json({ error: "Failed to deconstruct sentence" }, { status: 500 })
  }
}

function getIconForWord(word: string): string {
  const iconMap: { [key: string]: string } = {
    i: "👤",
    me: "👤",
    myself: "👤",
    you: "👥",
    your: "👥",
    need: "❗",
    want: "🙏",
    require: "❗",
    help: "🤝",
    assist: "🤝",
    support: "🤝",
    water: "💧",
    drink: "🥤",
    thirsty: "💧",
    food: "🍽️",
    eat: "🍽️",
    hungry: "🍽️",
    pain: "😣",
    hurt: "😣",
    ache: "😣",
    tired: "😴",
    sleep: "😴",
    rest: "😴",
    home: "🏠",
    house: "🏠",
    bathroom: "🚻",
    toilet: "🚻",
    doctor: "👨‍⚕️",
    nurse: "👩‍⚕️",
    family: "👨‍👩‍👧‍👦",
    mom: "👩",
    dad: "👨",
    happy: "😊",
    sad: "😢",
    angry: "😠",
    go: "🚶",
    walk: "🚶",
    move: "🚶",
    call: "📞",
    phone: "📞",
    medicine: "💊",
    pill: "💊",
  }

  return iconMap[word.toLowerCase()] || "❓"
}
