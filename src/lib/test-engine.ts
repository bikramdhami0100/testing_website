import type {
  PerformanceResult, SeoResult, AccessibilityResult, SecurityResult,
  HtmlCssJsResult, ApiTestResult, LoadTestResult, VisualTestResult,
  FrameworkDetectionResult, FunctionalTestResult, CrossBrowserResult,
  BestPracticesResult, LoginTestResult, RefreshTestResult, NavigationTestResult,
  ScalabilityTestResult, VolumeTestResult, CapacityTestResult,
  ConcurrencyTestResult, ReliabilityTestResult,
} from '@/types'

async function apiTest<T>(type: string, url: string, extra?: Record<string, unknown>): Promise<T> {
  const res = await fetch('/api/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, url, ...extra }),
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.error || 'Test failed')
  return json.data as T
}

export async function runPerformanceTest(url: string): Promise<PerformanceResult> {
  return apiTest<PerformanceResult>('performance', url)
}

export async function runSeoTest(url: string): Promise<SeoResult> {
  return apiTest<SeoResult>('seo', url)
}

export async function runAccessibilityTest(url: string): Promise<AccessibilityResult> {
  return apiTest<AccessibilityResult>('accessibility', url)
}

export async function runSecurityTest(url: string): Promise<SecurityResult> {
  return apiTest<SecurityResult>('security', url)
}

export async function runHtmlCssJsTest(url: string): Promise<HtmlCssJsResult> {
  return apiTest<HtmlCssJsResult>('html-css-js', url)
}

export async function runBestPracticesTest(url: string): Promise<BestPracticesResult> {
  return apiTest<BestPracticesResult>('best-practices', url)
}

export async function runLoginTest(url: string): Promise<LoginTestResult> {
  return apiTest<LoginTestResult>('login', url)
}

export async function runRefreshTest(url: string): Promise<RefreshTestResult> {
  return apiTest<RefreshTestResult>('refresh', url)
}

export async function runNavigationTest(url: string): Promise<NavigationTestResult> {
  return apiTest<NavigationTestResult>('navigation', url)
}

export async function runApiTest(endpoint: string, method: string = 'GET', options?: Record<string, unknown>): Promise<ApiTestResult> {
  return apiTest<ApiTestResult>('api', endpoint, { method, options })
}

export async function runFrameworkDetection(url: string): Promise<FrameworkDetectionResult> {
  return apiTest<FrameworkDetectionResult>('framework-detection', url)
}

export async function runLoadTest(url: string, virtualUsers: number = 50, duration: number = 10): Promise<LoadTestResult> {
  return apiTest<LoadTestResult>('load', url, { virtualUsers, duration })
}

export async function runVisualTest(url: string): Promise<VisualTestResult> {
  return apiTest<VisualTestResult>('visual', url)
}

export async function runFunctionalTest(url: string, testType?: FunctionalTestResult['testType']): Promise<FunctionalTestResult> {
  return apiTest<FunctionalTestResult>('functional', url, { testType })
}

export async function runCrossBrowserTest(url: string): Promise<CrossBrowserResult> {
  return apiTest<CrossBrowserResult>('cross-browser', url)
}

export async function runScalabilityTest(url: string): Promise<ScalabilityTestResult> {
  return apiTest<ScalabilityTestResult>('scalability', url)
}

export async function runVolumeTest(url: string): Promise<VolumeTestResult> {
  return apiTest<VolumeTestResult>('volume', url)
}

export async function runCapacityTest(url: string): Promise<CapacityTestResult> {
  return apiTest<CapacityTestResult>('capacity', url)
}

export async function runConcurrencyTest(url: string): Promise<ConcurrencyTestResult> {
  return apiTest<ConcurrencyTestResult>('concurrency', url)
}

export async function runReliabilityTest(url: string): Promise<ReliabilityTestResult> {
  return apiTest<ReliabilityTestResult>('reliability', url)
}
