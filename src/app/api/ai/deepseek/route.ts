import { NextResponse } from "next/server"

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"

interface AnalysisInput {
  url: string
  testData: Record<string, unknown>
}

export async function POST(req: Request) {
  try {
    const { url, testData }: AnalysisInput = await req.json()

    const systemPrompt = `You are an expert web application auditor. Analyze the provided test results and return a JSON object with EXACTLY this structure (no markdown, no code fences, pure JSON):
{
  "overallHealth": number (0-100),
  "performanceScore": number (0-100),
  "securityScore": number (0-100),
  "accessibilityScore": number (0-100),
  "seoScore": number (0-100),
  "qualityScore": number (0-100),
  "performanceSuggestions": string[] (actionable recommendations),
  "securityRecommendations": string[] (actionable recommendations),
  "accessibilitySuggestions": string[] (actionable recommendations),
  "seoImprovements": string[] (actionable recommendations),
  "uxReview": string[] (user experience observations),
  "uiReview": string[] (UI design observations),
  "bestPracticeSuggestions": string[] (best practices),
  "optimizationRecommendations": string[] (optimization tips),
  "summary": string (2-3 sentence executive summary)
}`

    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `URL: ${url}\n\nTest Results:\n${JSON.stringify(testData, null, 2)}` },
        ],
        temperature: 0.3,
        max_tokens: 4096,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("DeepSeek API error:", response.status, errorText)
      return NextResponse.json({ error: "AI analysis failed", details: errorText }, { status: 502 })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      return NextResponse.json({ error: "Empty response from AI" }, { status: 502 })
    }

    const cleaned = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim()
    const parsed = JSON.parse(cleaned)

    return NextResponse.json({
      url,
      timestamp: Date.now(),
      ...parsed,
    })
  } catch (err) {
    console.error("DeepSeek route error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
