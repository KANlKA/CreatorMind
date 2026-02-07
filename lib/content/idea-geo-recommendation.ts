export function generateIdeaGeoRecommendation(idea: any) {
  if (!idea) return [];

  const recommendations = [];

  const tone = idea?.suggestedStructure?.tone?.toLowerCase() || "";
  const format = idea?.suggestedStructure?.format?.toLowerCase() || "";
  const length = idea?.suggestedStructure?.length?.toLowerCase() || "";

  // Educational content → western + global learning markets
  if (tone.includes("educational")) {
    recommendations.push({
      country: "United States",
      reason: "Educational deep-dive content performs strongly here."
    });

    recommendations.push({
      country: "United Kingdom",
      reason: "High retention for structured educational videos."
    });
  }

  // Beginner-friendly content
  if (format.includes("general") || length.includes("8")) {
    recommendations.push({
      country: "India",
      reason: "Large beginner audience for explanatory content."
    });

    recommendations.push({
      country: "Philippines",
      reason: "High engagement for learning-style videos."
    });
  }

  // fallback (always show something)
  if (recommendations.length === 0) {
    recommendations.push({
      country: "Global Audience",
      reason: "Broad appeal based on topic style."
    });
  }

  return recommendations;
}
