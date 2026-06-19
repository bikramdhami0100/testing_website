import type {
  PerformanceResult,
  SeoResult,
  AccessibilityResult,
  SecurityResult,
  HtmlCssJsResult,
  LoadTestResult,
  VisualTestResult,
  AiAnalysisResult,
  FrameworkDetectionResult,
} from '@/types'

const API_URL = "/api/ai/deepseek"

export async function analyzeResults(
  url: string,
  performance: PerformanceResult | null,
  seo: SeoResult | null,
  accessibility: AccessibilityResult | null,
  security: SecurityResult | null,
  htmlCssJs: HtmlCssJsResult | null,
  loadTest: LoadTestResult | null,
  visual: VisualTestResult | null,
  _framework: FrameworkDetectionResult | null
): Promise<AiAnalysisResult> {
  const testData: Record<string, unknown> = {}
  if (performance) testData.performance = performance
  if (seo) testData.seo = seo
  if (accessibility) testData.accessibility = accessibility
  if (security) testData.security = security
  if (htmlCssJs) testData.htmlCssJs = htmlCssJs
  if (loadTest) testData.loadTest = loadTest
  if (visual) testData.visual = visual

  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, testData }),
  })

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}))
    throw new Error(errData.error || "AI analysis request failed")
  }

  const result: AiAnalysisResult = await response.json()

  return {
    url,
    timestamp: Date.now(),
    overallHealth: result.overallHealth ?? 0,
    performanceScore: result.performanceScore ?? 0,
    securityScore: result.securityScore ?? 0,
    accessibilityScore: result.accessibilityScore ?? 0,
    seoScore: result.seoScore ?? 0,
    qualityScore: result.qualityScore ?? 0,
    performanceSuggestions: result.performanceSuggestions ?? [],
    securityRecommendations: result.securityRecommendations ?? [],
    accessibilitySuggestions: result.accessibilitySuggestions ?? [],
    seoImprovements: result.seoImprovements ?? [],
    uxReview: result.uxReview ?? [],
    uiReview: result.uiReview ?? [],
    bestPracticeSuggestions: result.bestPracticeSuggestions ?? [],
    optimizationRecommendations: result.optimizationRecommendations ?? [],
  }
}

export function generateSummary(analysis: AiAnalysisResult): string {
  const health = analysis.overallHealth
  if (health >= 90) {
    return `Excellent overall health at ${health}%. The application demonstrates strong performance across all testing dimensions.`
  } else if (health >= 75) {
    return `Good overall health at ${health}%. Some areas need attention but the foundation is solid.`
  } else if (health >= 50) {
    return `Fair overall health at ${health}%. Several areas require improvement to meet industry standards.`
  }
  return `Poor overall health at ${health}%. Significant improvements needed across multiple categories.`
}

export function prioritizeRecommendations(analysis: AiAnalysisResult, maxCount: number = 5): { priority: 'critical' | 'high' | 'medium' | 'low'; text: string }[] {
  const all: { priority: 'critical' | 'high' | 'medium' | 'low'; text: string }[] = []

  for (const rec of analysis.securityRecommendations) {
    all.push({
      priority: rec.toLowerCase().includes('critical') || rec.toLowerCase().includes('immediate') ? 'critical' : 'high',
      text: rec,
    })
  }
  for (const rec of analysis.accessibilitySuggestions) {
    all.push({
      priority: rec.toLowerCase().includes('critical') || rec.toLowerCase().includes('immediate') ? 'critical' : 'high',
      text: rec,
    })
  }
  for (const rec of analysis.performanceSuggestions) {
    all.push({ priority: 'medium', text: rec })
  }
  for (const rec of analysis.seoImprovements) {
    all.push({ priority: 'medium', text: rec })
  }
  for (const rec of analysis.uxReview) all.push({ priority: 'low', text: rec })
  for (const rec of analysis.uiReview) all.push({ priority: 'low', text: rec })
  for (const rec of analysis.bestPracticeSuggestions) all.push({ priority: 'low', text: rec })
  for (const rec of analysis.optimizationRecommendations) all.push({ priority: 'low', text: rec })

  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
  all.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
  return all.slice(0, maxCount)
}

export function calculateHealthTrend(scores: { timestamp: number; health: number }[]): { direction: 'up' | 'down' | 'stable'; change: number } {
  if (scores.length < 2) return { direction: 'stable', change: 0 }
  const recent = scores.slice(-5)
  const change = recent[recent.length - 1].health - recent[0].health
  if (change > 3) return { direction: 'up', change: Math.round(change * 10) / 10 }
  if (change < -3) return { direction: 'down', change: Math.round(change * 10) / 10 }
  return { direction: 'stable', change: 0 }
}

export function getGradeLabel(score: number): string {
  if (score >= 95) return 'A+'
  if (score >= 90) return 'A'
  if (score >= 85) return 'A-'
  if (score >= 80) return 'B+'
  if (score >= 75) return 'B'
  if (score >= 70) return 'B-'
  if (score >= 65) return 'C+'
  if (score >= 60) return 'C'
  if (score >= 55) return 'C-'
  if (score >= 50) return 'D+'
  if (score >= 40) return 'D'
  return 'F'
}
