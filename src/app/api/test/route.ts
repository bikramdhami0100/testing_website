import { NextRequest, NextResponse } from 'next/server'
import {
  realPerformanceTest, realSeoTest, realSecurityTest, realAccessibilityTest,
  realHtmlCssJsTest, realBestPracticesTest, realFrameworkDetection,
  realLoginTest, realRefreshTest, realNavigationTest, realApiTest,
  realLoadTest, realVisualTest, realFunctionalTest, realCrossBrowserTest,
  realScalabilityTest, realVolumeTest, realCapacityTest,
  realConcurrencyTest, realReliabilityTest,
} from '@/lib/server-tests'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { type, url, endpoint, method, options } = body

    if (!url && !endpoint) {
      return NextResponse.json({ error: 'URL or endpoint required' }, { status: 400 })
    }

    const targetUrl = url || endpoint

    let result: unknown
    switch (type) {
      case 'performance':         result = await realPerformanceTest(targetUrl); break
      case 'seo':                 result = await realSeoTest(targetUrl); break
      case 'security':            result = await realSecurityTest(targetUrl); break
      case 'accessibility':       result = await realAccessibilityTest(targetUrl); break
      case 'html-css-js':         result = await realHtmlCssJsTest(targetUrl); break
      case 'best-practices':      result = await realBestPracticesTest(targetUrl); break
      case 'framework-detection': result = await realFrameworkDetection(targetUrl); break
      case 'login':               result = await realLoginTest(targetUrl); break
      case 'refresh':             result = await realRefreshTest(targetUrl); break
      case 'navigation':          result = await realNavigationTest(targetUrl); break
      case 'api':                 result = await realApiTest(targetUrl, method || 'GET', options); break
      case 'load':                result = await realLoadTest(targetUrl); break
      case 'visual':              result = await realVisualTest(targetUrl); break
      case 'functional':          result = await realFunctionalTest(targetUrl); break
      case 'cross-browser':       result = await realCrossBrowserTest(targetUrl); break
      case 'scalability':         result = await realScalabilityTest(targetUrl); break
      case 'volume':              result = await realVolumeTest(targetUrl); break
      case 'capacity':            result = await realCapacityTest(targetUrl); break
      case 'concurrency':         result = await realConcurrencyTest(targetUrl); break
      case 'reliability':         result = await realReliabilityTest(targetUrl); break
      default:                    result = await realPerformanceTest(targetUrl)
    }

    return NextResponse.json({ success: true, data: result })
  } catch (e) {
    const error = e as Error
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
