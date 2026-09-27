import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { mapIcon } from "@/src/constants/navigation";

const apiKey = process.env.GEMINI_API_KEY?.trim() || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  try {
    if (!apiKey) {
      console.warn("GEMINI_API_KEY ortam değişkeni bulunamadı!");
      return NextResponse.json({ iconName: "HelpCircle" });
    }

    const { label } = await req.json();

    if (!label || typeof label !== "string" || label.trim().length === 0) {
      return NextResponse.json({ iconName: "HelpCircle" });
    }

    const cleanLabel = label.trim();

    const localIcon = mapIcon(cleanLabel);
    if (localIcon) {
      return NextResponse.json({ iconName: localIcon });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
    });

    const prompt = `Task: Match a Lucide React icon name to the label "${cleanLabel}".
Rules:
- Return ONLY the PascalCase icon name (e.g., "Droplets", "Activity", "Search").
- No explanations, no markdown.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    const iconName = response
      .text()
      .trim()
      .replace(/[^a-zA-Z]/g, "");

    return NextResponse.json({
      iconName: iconName || "HelpCircle",
    });
  } catch (error) {
    console.error("Gemini Error:", error);
    return NextResponse.json({ iconName: "HelpCircle" });
  }
}
