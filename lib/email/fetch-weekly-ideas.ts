import GeneratedIdea from "@/models/GeneratedIdea"

export async function fetchWeeklyIdeas(userId: string, count: number) {
  const doc = await GeneratedIdea.findOne({ userId })
    .sort({ weekOf: -1 })
    .lean()

  if (!doc || !doc.ideas?.length) return null

  return {
    doc,
    ideas: doc.ideas.slice(0, count),
  }
}
