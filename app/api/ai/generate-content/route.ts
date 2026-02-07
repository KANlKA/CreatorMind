import { NextResponse } from "next/server";
import { generateJSON } from "@/lib/ai/gemini";

export async function POST(req: Request) {
  try {
    const { type, idea } = await req.json();

    if (!type || !idea) {
      return NextResponse.json(
        { error: "Missing params" },
        { status: 400 }
      );
    }

    let prompt = "";

    // ✅ NEW — generate everything together
    if (type === "all") {
      prompt = `
You are a YouTube growth expert.

For this idea:

Title: ${idea.title}
Hook: ${idea.suggestedStructure?.hook}
Format: ${idea.suggestedStructure?.format}
Tone: ${idea.suggestedStructure?.tone}

Generate:

1) 15 strong YouTube hashtags
2) 10 viral clickable titles
3) A structured YouTube script

Return JSON ONLY:

{
  "hashtags": ["#example"],
  "titles": ["example title"],
  "script": "full youtube script"
}
`;
    }

    if (type === "hashtags") {
      prompt = `
Generate 15 YouTube hashtags for this idea.

Idea: ${idea.title}

Return JSON:
{
  "hashtags": ["#example"]
}
`;
    }

    if (type === "titles") {
      prompt = `
Generate 10 viral YouTube titles.

Idea: ${idea.title}

Return JSON:
{
  "titles": ["example title"]
}
`;
    }

    if (type === "script") {
      prompt = `
Write a YouTube script.

Idea: ${idea.title}

Return JSON:
{
  "script": "full script text"
}
`;
    }

    const result = await generateJSON(prompt);

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "AI generation failed" },
      { status: 500 }
    );
  }
}
