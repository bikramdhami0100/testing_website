import type { FrameworkDetectionResult, FrameworkInfo } from '@/types'

interface DetectionPattern {
  name: string
  category: FrameworkInfo['category']
  patterns: RegExp[]
  versionPattern?: RegExp
  confidence: number
}

const DETECTION_PATTERNS: DetectionPattern[] = [
  { name: 'React', category: 'frontend', patterns: [/react/i, /__REACT_DEVTOOLS_GLOBAL_HOOK__/i, /react\.js/i, /react-dom/i], versionPattern: /react@?([\d.]+)/i, confidence: 0.95 },
  { name: 'Next.js', category: 'frontend', patterns: [/__NEXT_DATA__/i, /next\.js/i, /\/_next\//i, /__NEXT_LOADED_PAGES__/i], versionPattern: /next@?([\d.]+)/i, confidence: 0.98 },
  { name: 'Angular', category: 'frontend', patterns: [/ng-version/i, /ng-app/i, /angular/i, /Zone\.js/i], versionPattern: /ng-version="([\d.]+)"/i, confidence: 0.95 },
  { name: 'Vue', category: 'frontend', patterns: [/vue\.js/i, /__VUE_DEVTOOLS_GLOBAL_HOOK__/i, /data-v-/i, /v-bind|v-model|v-if|v-for/i], versionPattern: /vue@?([\d.]+)/i, confidence: 0.92 },
  { name: 'Nuxt', category: 'frontend', patterns: [/__NUXT__/i, /nuxt/i, /\.nuxt\//i], versionPattern: /nuxt@?([\d.]+)/i, confidence: 0.93 },
  { name: 'Svelte', category: 'frontend', patterns: [/svelte/i, /__svelte/i, /svelte\.js/i], versionPattern: /svelte@?([\d.]+)/i, confidence: 0.9 },
  { name: 'SvelteKit', category: 'frontend', patterns: [/sveltekit/i, /__SVELTEKIT__/i, /\/_sveltekit\//i], versionPattern: /@sveltejs\/kit@?([\d.]+)/i, confidence: 0.94 },
  { name: 'Astro', category: 'frontend', patterns: [/astro/i, /__ASTRO__/i, /astro\.js/i], versionPattern: /astro@?([\d.]+)/i, confidence: 0.92 },
  { name: 'Remix', category: 'frontend', patterns: [/remix/i, /__remix/i, /@remix-run/i], versionPattern: /@remix-run\/(?:react|node)@?([\d.]+)/i, confidence: 0.93 },
  { name: 'Gatsby', category: 'frontend', patterns: [/gatsby/i, /__GATSBY/i, /gatsby\.js/i], versionPattern: /gatsby@?([\d.]+)/i, confidence: 0.92 },
  { name: 'SolidJS', category: 'frontend', patterns: [/solidjs/i, /solid-js/i, /__SOLID__/i], versionPattern: /solid-js@?([\d.]+)/i, confidence: 0.85 },
  { name: 'Qwik', category: 'frontend', patterns: [/qwik/i, /__QWIK__/i, /qwikloader\.js/i], versionPattern: /qwik@?([\d.]+)/i, confidence: 0.85 },
  { name: 'Preact', category: 'frontend', patterns: [/preact/i, /__PREACT_DEVTOOLS__/i, /preact\.js/i], versionPattern: /preact@?([\d.]+)/i, confidence: 0.88 },
  { name: 'Alpine.js', category: 'frontend', patterns: [/alpine.*js/i, /x-data/i, /x-init|x-show|x-bind|x-on/i], versionPattern: /alpinejs@?([\d.]+)/i, confidence: 0.85 },
  { name: 'Laravel', category: 'backend', patterns: [/laravel/i, /livewire/i, /csrf-token/i, /__laravel/i], versionPattern: /laravel[\/\s]v?([\d.]+)/i, confidence: 0.9 },
  { name: 'Symfony', category: 'backend', patterns: [/symfony/i, /_sf2_attributes/i, /sf_/i], versionPattern: /symfony[\/\s]v?([\d.]+)/i, confidence: 0.88 },
  { name: 'Express.js', category: 'backend', patterns: [/express/i, /x-powered-by: express/i, /connect\.sid/i], versionPattern: /express@?([\d.]+)/i, confidence: 0.85 },
  { name: 'NestJS', category: 'backend', patterns: [/nestjs/i, /@nestjs/i, /nest\.js/i], versionPattern: /@nestjs\/core@?([\d.]+)/i, confidence: 0.88 },
  { name: 'Django', category: 'backend', patterns: [/django/i, /csrftoken/i, /__django/i, /django\.js/i], versionPattern: /django[\/\s]v?([\d.]+)/i, confidence: 0.9 },
  { name: 'Flask', category: 'backend', patterns: [/flask/i, /flask\.session/i, /__flask/i], versionPattern: /flask[\/\s]v?([\d.]+)/i, confidence: 0.85 },
  { name: 'FastAPI', category: 'backend', patterns: [/fastapi/i, /openapi\.json/i, /docs\/oauth2/i], versionPattern: /fastapi[\/\s]v?([\d.]+)/i, confidence: 0.87 },
  { name: 'Spring Boot', category: 'backend', patterns: [/spring/i, /spring-boot/i, /x-application-context/i], versionPattern: /spring-boot[\/\s]v?([\d.]+)/i, confidence: 0.85 },
  { name: 'Ruby on Rails', category: 'backend', patterns: [/rails/i, /ruby on rails/i, /csrf-param/i, /_rails/i], versionPattern: /rails[\/\s]v?([\d.]+)/i, confidence: 0.88 },
  { name: 'WordPress', category: 'cms', patterns: [/wp-content/i, /wp-includes/i, /wordpress/i, /wp-json/i, /wp-admin/i], versionPattern: /wordpress[\/\s]v?([\d.]+)/i, confidence: 0.98 },
  { name: 'Shopify', category: 'cms', patterns: [/shopify/i, /myshopify\.com/i, /\/cdn\/shop\//i, /shopify\.js/i], versionPattern: /shopify@?([\d.]+)/i, confidence: 0.95 },
  { name: 'Magento', category: 'cms', patterns: [/magento/i, /mage\/|_mage_/i, /form_key/i, /x-magento/i], versionPattern: /magento[\/\s]v?([\d.]+)/i, confidence: 0.92 },
  { name: 'Drupal', category: 'cms', patterns: [/drupal/i, /drupal\.settings/i, /drupal\.js/i, /sites\/default\//i], versionPattern: /drupal[\/\s]v?([\d.]+)/i, confidence: 0.92 },
  { name: 'Joomla', category: 'cms', patterns: [/joomla/i, /joomla\.js/i, /com_content/i, /\/media\/jui\//i], versionPattern: /joomla[\/\s]v?([\d.]+)/i, confidence: 0.9 },
  { name: 'Ghost', category: 'cms', patterns: [/ghost/i, /ghost\-/i, /tryghost/i, /ghost\.io/i], versionPattern: /ghost@?([\d.]+)/i, confidence: 0.88 },
  { name: 'Strapi', category: 'cms', patterns: [/strapi/i, /strapi-admin/i, /_strapi/i], versionPattern: /strapi@?([\d.]+)/i, confidence: 0.87 },
  { name: 'Payload CMS', category: 'cms', patterns: [/payload/i, /payload-cms/i, /payload\.js/i], versionPattern: /payload@?([\d.]+)/i, confidence: 0.8 },
  { name: 'Directus', category: 'cms', patterns: [/directus/i, /directus\.js/i, /directus\/api/i], versionPattern: /directus@?([\d.]+)/i, confidence: 0.82 },
  { name: 'React Native', category: 'mobile', patterns: [/react-native/i, /\/react-native\//i, /native-stack/i], versionPattern: /react-native@?([\d.]+)/i, confidence: 0.88 },
  { name: 'Expo', category: 'mobile', patterns: [/expo/i, /expo\.js/i, /expo-dev/i, /__expo__/i], versionPattern: /expo@?([\d.]+)/i, confidence: 0.85 },
  { name: 'Flutter', category: 'mobile', patterns: [/flutter/i, /flutter\.js/i, /flutter_service_worker/i], versionPattern: /flutter@?([\d.]+)/i, confidence: 0.9 },
  { name: 'Ionic', category: 'mobile', patterns: [/ionic/i, /\/ionic\//i, /ion-\w+/i, /@ionic/i], versionPattern: /ionic@?([\d.]+)/i, confidence: 0.85 },
  { name: 'Capacitor', category: 'mobile', patterns: [/capacitor/i, /@capacitor/i, /capacitor\.js/i], versionPattern: /@capacitor\/core@?([\d.]+)/i, confidence: 0.82 },
  { name: 'Electron', category: 'desktop', patterns: [/electron/i, /node_modules\/electron/i, /electron\.js/i], versionPattern: /electron@?([\d.]+)/i, confidence: 0.88 },
  { name: 'Tauri', category: 'desktop', patterns: [/tauri/i, /__TAURI__/i, /tauri\.js/i], versionPattern: /tauri@?([\d.]+)/i, confidence: 0.85 },
  { name: 'GraphQL', category: 'api', patterns: [/graphql/i, /__graphql/i, /\/graphql/i, /apollo/i], versionPattern: /graphql@?([\d.]+)/i, confidence: 0.88 },
  { name: 'REST', category: 'api', patterns: [/rest/i, /api\/v\d/i, /restful/i], versionPattern: undefined, confidence: 0.6 },
  { name: 'SOAP', category: 'api', patterns: [/soap/i, /\/soap\//i, /soap:envelope/i], versionPattern: undefined, confidence: 0.8 },
  { name: 'gRPC', category: 'api', patterns: [/grpc/i, /\/grpc\//i, /grpc-web/i], versionPattern: /grpc@?([\d.]+)/i, confidence: 0.82 },
]

const LANGUAGE_PATTERNS: { name: string; patterns: RegExp[] }[] = [
  { name: 'JavaScript', patterns: [/\.js/i, /javascript/i] },
  { name: 'TypeScript', patterns: [/\.tsx?/i, /typescript/i, /@types\//i] },
  { name: 'Python', patterns: [/\.py/i, /python/i, /django|flask|fastapi/i] },
  { name: 'PHP', patterns: [/\.php/i, /php/i, /laravel|wordpress/i] },
  { name: 'Java', patterns: [/\.java/i, /java/i, /spring/i] },
  { name: 'Ruby', patterns: [/\.rb/i, /ruby/i, /rails/i] },
  { name: 'Go', patterns: [/\.go/i, /golang/i, /go\.\d+/i] },
  { name: 'Rust', patterns: [/\.rs/i, /rust/i, /cargo/i] },
  { name: 'C#', patterns: [/\.cs/i, /c#|csharp/i, /\.net/i] },
  { name: 'Swift', patterns: [/\.swift/i, /swift/i] },
  { name: 'Kotlin', patterns: [/\.kt/i, /kotlin/i] },
  { name: 'Dart', patterns: [/\.dart/i, /dart/i, /flutter/i] },
]

const RUNTIME_PATTERNS: { name: string; patterns: RegExp[] }[] = [
  { name: 'Node.js', patterns: [/node/i, /nodejs/i, /commonjs/i, /esmodule/i] },
  { name: 'Deno', patterns: [/deno/i, /deno\.land/i] },
  { name: 'Bun', patterns: [/bun/i, /bun\.sh/i] },
]

const BUILD_TOOL_PATTERNS: { name: string; patterns: RegExp[] }[] = [
  { name: 'webpack', patterns: [/webpack/i, /__webpack_require__/i, /webpackJsonp/i] },
  { name: 'Vite', patterns: [/vite/i, /vite\.js/i, /\/@vite\//i] },
  { name: 'Rollup', patterns: [/rollup/i, /\/rollup\//i] },
  { name: 'ESBuild', patterns: [/esbuild/i, /esbuild\.js/i] },
  { name: 'Parcel', patterns: [/parcel/i, /parcel\.js/i] },
  { name: 'Turbopack', patterns: [/turbopack/i, /__turbopack/i] },
  { name: 'SWC', patterns: [/swc/i, /\.swcrc/i] },
  { name: 'Babel', patterns: [/babel/i, /@babel/i, /babel-polyfill/i] },
]

const PACKAGE_MANAGER_PATTERNS: { name: string; patterns: RegExp[] }[] = [
  { name: 'npm', patterns: [/package-lock\.json/i, /node_modules/i, /npm\//i] },
  { name: 'yarn', patterns: [/yarn\.lock/i, /\.yarn\//i, /\byarn\b/i] },
  { name: 'pnpm', patterns: [/pnpm-lock\.yaml/i, /\.pnpm\//i] },
  { name: 'bun', patterns: [/bun\.lockb/i, /bun\.lock/i] },
]

const SERVER_PATTERNS: { name: string; patterns: RegExp[] }[] = [
  { name: 'Nginx', patterns: [/nginx/i, /nginx\/[\d.]+/i] },
  { name: 'Apache', patterns: [/apache/i, /apache\/[\d.]+/i, /\.htaccess/i] },
  { name: 'Caddy', patterns: [/caddy/i, /caddy\/[\d.]+/i] },
  { name: 'IIS', patterns: [/iis/i, /iis\/[\d.]+/i, /x-aspnet/i] },
  { name: 'Cloudflare', patterns: [/cloudflare/i, /__cfduid/i, /cf-ray/i] },
  { name: 'Netlify', patterns: [/netlify/i, /x-nf-request-id/i] },
  { name: 'Vercel', patterns: [/vercel/i, /x-vercel/i] },
  { name: 'AWS', patterns: [/aws/i, /amazonaws\.com/i, /s3\.amazonaws/i, /cloudfront/i] },
  { name: 'Firebase', patterns: [/firebase/i, /firebase\.js/i, /firebaseio\.com/i] },
  { name: 'GitHub Pages', patterns: [/github\.io/i, /404\.html.*github/i] },
]

const HOSTING_PATTERNS: { name: string; patterns: RegExp[] }[] = [
  { name: 'Vercel', patterns: [/vercel/i, /x-vercel/i] },
  { name: 'Netlify', patterns: [/netlify/i, /x-nf-request-id/i] },
  { name: 'Cloudflare Pages', patterns: [/cloudflare.*pages/i] },
  { name: 'AWS Amplify', patterns: [/aws.*amplify/i] },
  { name: 'Railway', patterns: [/railway/i, /x-railway/i] },
  { name: 'Render', patterns: [/render\.com/i, /x-render/i] },
  { name: 'Heroku', patterns: [/heroku/i, /x-heroku/i] },
  { name: 'Fly.io', patterns: [/fly\.io/i, /x-fly/i] },
]

const CDN_PATTERNS: { name: string; patterns: RegExp[] }[] = [
  { name: 'Cloudflare', patterns: [/cdn\.cloudflare/i, /cloudflare\.com.*cdn/i] },
  { name: 'Fastly', patterns: [/fastly/i, /x-fastly/i] },
  { name: 'Akamai', patterns: [/akamai/i, /akamai\.net/i] },
  { name: 'CloudFront', patterns: [/cloudfront\.net/i, /d\d+\.cloudfront/i] },
  { name: 'jsDelivr', patterns: [/cdn\.jsdelivr/i, /jsdelivr/i] },
  { name: 'unpkg', patterns: [/unpkg\.com/i] },
  { name: 'cdnjs', patterns: [/cdnjs\.cloudflare/i] },
]

function detectPattern(content: string, patterns: DetectionPattern[]): FrameworkInfo[] {
  const results: FrameworkInfo[] = []
  for (const detector of patterns) {
    let detected = false
    for (const pattern of detector.patterns) {
      if (pattern.test(content)) {
        detected = true
        break
      }
    }
    if (detected) {
      let version: string | undefined
      if (detector.versionPattern) {
        const match = content.match(detector.versionPattern)
        if (match?.[1]) {
          version = match[1]
        }
      }
      results.push({
        name: detector.name,
        category: detector.category,
        version,
        detected: true,
        confidence: detector.confidence,
      })
    }
  }
  return results
}

function detectSimple(patterns: { name: string; patterns: RegExp[] }[], content: string): string | undefined {
  for (const entry of patterns) {
    for (const pattern of entry.patterns) {
      if (pattern.test(content)) {
        return entry.name
      }
    }
  }
  return undefined
}

function detectAllSimple(patterns: { name: string; patterns: RegExp[] }[], content: string): string[] {
  const results: string[] = []
  for (const entry of patterns) {
    for (const pattern of entry.patterns) {
      if (pattern.test(content)) {
        results.push(entry.name)
        break
      }
    }
  }
  return results
}

export function detectFrameworks(html: string, scripts: string[], metaTags: Record<string, string>, windowGlobals: string[]): FrameworkDetectionResult {
  const content = [html, ...scripts, ...windowGlobals, ...Object.values(metaTags)].join('\n')

  const frameworks = detectPattern(content, DETECTION_PATTERNS)

  const language = detectSimple(LANGUAGE_PATTERNS, content)
  const runtime = detectSimple(RUNTIME_PATTERNS, content)
  const buildTool = detectSimple(BUILD_TOOL_PATTERNS, content)
  const packageManager = detectSimple(PACKAGE_MANAGER_PATTERNS, content)
  const server = detectSimple(SERVER_PATTERNS, content)
  const hosting = detectSimple(HOSTING_PATTERNS, content)
  const cdn = detectSimple(CDN_PATTERNS, content)

  const ssl = html.includes('https://') || metaTags['ssl'] === 'true' || false
  const compression = html.includes('gzip') || html.includes('br ') || html.includes('deflate') || false

  let httpVersion = 'HTTP/2'
  if (metaTags['http-version']) {
    httpVersion = metaTags['http-version']
  } else if (content.includes('HTTP/3') || content.includes('h3-')) {
    httpVersion = 'HTTP/3'
  } else if (content.includes('HTTP/1.1') || content.includes('http/1.1')) {
    httpVersion = 'HTTP/1.1'
  }

  let renderingMode: 'ssr' | 'csr' | 'ssg' | 'isr' = 'csr'
  if (content.includes('__NEXT_DATA__') || content.includes('__NUXT__') || content.includes('__SVELTEKIT__')) {
    if (content.includes('getStaticProps') || content.includes('generateStaticParams')) {
      renderingMode = 'ssg'
    } else if (content.includes('Incremental') || content.includes('revalidate')) {
      renderingMode = 'isr'
    } else {
      renderingMode = 'ssr'
    }
  }

  return {
    frameworks,
    language,
    runtime,
    buildTool,
    packageManager,
    server,
    hosting,
    cdn,
    httpVersion,
    ssl,
    compression,
    renderingMode,
    url: '',
    timestamp: Date.now(),
  }
}

export function detectFrameworksFromUrl(url: string): FrameworkDetectionResult {
  const result: FrameworkDetectionResult = {
    frameworks: [],
    language: 'JavaScript',
    runtime: 'Node.js',
    ssl: url.startsWith('https://'),
    compression: true,
    httpVersion: 'HTTP/2',
    renderingMode: 'csr',
    url,
    timestamp: Date.now(),
  }

  try {
    const hostname = new URL(url).hostname.toLowerCase()

    if (hostname.includes('vercel') || hostname.includes('now.sh')) {
      result.hosting = 'Vercel'
      result.server = 'Vercel'
    } else if (hostname.includes('netlify')) {
      result.hosting = 'Netlify'
      result.server = 'Netlify'
    } else if (hostname.includes('cloudflare')) {
      result.hosting = 'Cloudflare'
      result.server = 'Cloudflare'
    } else if (hostname.includes('github.io')) {
      result.hosting = 'GitHub Pages'
    } else if (hostname.includes('firebase')) {
      result.hosting = 'Firebase'
    } else if (hostname.includes('aws') || hostname.includes('amazon')) {
      result.hosting = 'AWS'
      result.server = 'AWS'
    } else if (hostname.includes('heroku')) {
      result.hosting = 'Heroku'
    } else if (hostname.includes('fly.dev')) {
      result.hosting = 'Fly.io'
    }

    const fullUrl = url.toLowerCase()
    if (fullUrl.includes('next')) {
      result.buildTool = 'Turbopack'
      result.packageManager = 'npm'
    } else if (fullUrl.includes('gatsby')) {
      result.buildTool = 'webpack'
    } else if (fullUrl.includes('vite') || fullUrl.includes('vue') || fullUrl.includes('svelte')) {
      result.buildTool = 'Vite'
    } else if (fullUrl.includes('angular')) {
      result.buildTool = 'webpack'
    } else {
      result.buildTool = 'Vite'
    }

    if (fullUrl.includes('shopify')) {
      result.frameworks.push({ name: 'Shopify', category: 'cms', detected: true, confidence: 0.9 })
    } else if (fullUrl.includes('wordpress') || fullUrl.includes('wp')) {
      result.frameworks.push({ name: 'WordPress', category: 'cms', detected: true, confidence: 0.9 })
    } else if (fullUrl.includes('drupal')) {
      result.frameworks.push({ name: 'Drupal', category: 'cms', detected: true, confidence: 0.9 })
    } else if (fullUrl.includes('magento')) {
      result.frameworks.push({ name: 'Magento', category: 'cms', detected: true, confidence: 0.9 })
    } else if (fullUrl.includes('laravel') || fullUrl.includes('livewire')) {
      result.frameworks.push({ name: 'Laravel', category: 'backend', detected: true, confidence: 0.85 })
    } else if (fullUrl.includes('django') || fullUrl.includes('python')) {
      result.frameworks.push({ name: 'Django', category: 'backend', detected: true, confidence: 0.8 })
    } else if (fullUrl.includes('rails') || fullUrl.includes('ruby')) {
      result.frameworks.push({ name: 'Ruby on Rails', category: 'backend', detected: true, confidence: 0.85 })
    } else if (fullUrl.includes('php') || fullUrl.includes('symfony')) {
      result.frameworks.push({ name: 'Symfony', category: 'backend', detected: true, confidence: 0.8 })
    } else if (fullUrl.includes('strapi') || fullUrl.includes('admin')) {
      result.frameworks.push({ name: 'Strapi', category: 'cms', detected: true, confidence: 0.75 })
    }

    if (!result.packageManager) {
      result.packageManager = 'npm'
    }

  } catch {
    result.language = 'JavaScript'
    result.runtime = 'Node.js'
    result.buildTool = 'Vite'
    result.packageManager = 'npm'
  }

  return result
}
