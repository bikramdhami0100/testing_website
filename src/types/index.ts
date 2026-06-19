export interface TestResult {
  id: string;
  type: TestType;
  url: string;
  timestamp: number;
  status: 'running' | 'completed' | 'failed';
  score?: number;
  data?: Record<string, unknown>;
  issues?: TestIssue[];
  recommendations?: string[];
}

export interface TestIssue {
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  title: string;
  description: string;
  recommendation?: string;
  line?: number;
  column?: number;
}

export interface FrameworkInfo {
  name: string;
  category: 'frontend' | 'backend' | 'cms' | 'mobile' | 'desktop' | 'api';
  version?: string;
  detected: boolean;
  confidence: number;
}

export interface FrameworkDetectionResult {
  frameworks: FrameworkInfo[];
  language?: string;
  runtime?: string;
  buildTool?: string;
  packageManager?: string;
  server?: string;
  hosting?: string;
  cdn?: string;
  httpVersion?: string;
  ssl: boolean;
  compression: boolean;
  renderingMode?: 'ssr' | 'csr' | 'ssg' | 'isr';
  url: string;
  timestamp: number;
}

export interface PerformanceResult {
  url: string;
  timestamp: number;
  fcp?: number;
  lcp?: number;
  cls?: number;
  inp?: number;
  ttfb?: number;
  tti?: number;
  pageSpeed?: number;
  initialLoadTime?: number;
  refreshTime?: number;
  navigationSpeed?: number;
  bundleSize?: number;
  cacheAnalysis?: CacheInfo;
  compression?: boolean;
  cpuUsage?: number;
  memoryUsage?: number;
  networkWaterfall?: WaterfallEntry[];
  renderBlockingResources?: string[];
  recommendations?: string[];
}

export interface CacheInfo {
  staticCache: boolean;
  dynamicCache: boolean;
  cachePolicy: string;
  etag: boolean;
  lastModified: boolean;
}

export interface WaterfallEntry {
  url: string;
  duration: number;
  size: number;
  type: string;
  startTime: number;
}

export interface SeoResult {
  url: string;
  timestamp: number;
  title?: string;
  titleLength?: number;
  description?: string;
  descriptionLength?: number;
  canonical?: string;
  ogTags?: Record<string, string>;
  twitterCards?: Record<string, string>;
  robotsTxt?: boolean;
  sitemapXml?: boolean;
  structuredData?: StructuredDataInfo[];
  headingStructure?: HeadingInfo[];
  internalLinks?: number;
  externalLinks?: number;
  brokenLinks?: string[];
  altAttributes?: AltAttributeInfo[];
  keywords?: string[];
  duplicateContent?: boolean;
  score?: number;
  recommendations?: string[];
}

export interface StructuredDataInfo {
  type: string;
  valid: boolean;
  errors?: string[];
}

export interface HeadingInfo {
  level: number;
  text: string;
}

export interface AltAttributeInfo {
  tag: string;
  src: string;
  hasAlt: boolean;
  altText?: string;
}

export interface AccessibilityResult {
  url: string;
  timestamp: number;
  score?: number;
  wcagLevel?: 'A' | 'AA' | 'AAA';
  violations?: AccessibilityViolation[];
  passes?: number;
  recommendations?: string[];
}

export interface AccessibilityViolation {
  id: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
  description: string;
  help: string;
  helpUrl: string;
  nodes: number;
}

export interface SecurityResult {
  url: string;
  timestamp: number;
  score?: number;
  headers?: SecurityHeaders;
  ssl?: SSLInfo;
  authentication?: AuthSecurityInfo;
  vulnerabilities?: SecurityVulnerability[];
  recommendations?: string[];
}

export interface SecurityHeaders {
  csp: boolean;
  hsts: boolean;
  xFrameOptions: boolean;
  xContentTypeOptions: boolean;
  referrerPolicy: boolean;
  permissionsPolicy: boolean;
}

export interface SSLInfo {
  valid: boolean;
  issuer?: string;
  expiryDate?: string;
  tlsVersion?: string;
  weakCipher: boolean;
  mixedContent: boolean;
}

export interface AuthSecurityInfo {
  passwordPolicy: boolean;
  jwtValidation: boolean;
  sessionSecurity: boolean;
  cookieSecurity: boolean;
  mfaDetected: boolean;
}

export interface SecurityVulnerability {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  recommendation: string;
}

export interface HtmlCssJsResult {
  url: string;
  timestamp: number;
  htmlErrors?: number;
  htmlWarnings?: number;
  missingTags?: string[];
  invalidElements?: string[];
  duplicateIds?: string[];
  unusedCss?: string[];
  cssSize?: number;
  flexIssues?: string[];
  gridIssues?: string[];
  animationPerformance?: string[];
  consoleErrors?: number;
  consoleWarnings?: number;
  longTasks?: number;
  deadCode?: boolean;
  bundleSize?: number;
  runtimeErrors?: number;
  score?: number;
  recommendations?: string[];
}

export interface ApiTestResult {
  id: string;
  timestamp: number;
  method: string;
  endpoint: string;
  statusCode?: number;
  responseTime?: number;
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
  payload?: unknown;
  response?: unknown;
  validationErrors?: string[];
  success: boolean;
}

export interface LoadTestResult {
  id: string;
  url: string;
  timestamp: number;
  virtualUsers: number;
  duration: number;
  avgResponseTime?: number;
  peakResponseTime?: number;
  throughput?: number;
  errorRate?: number;
  successRate?: number;
  requestsPerSecond?: number;
  percentiles?: Record<string, number>;
  breakingPoint?: number;
  maxConcurrentUsers?: number;
  recoveryTime?: number;
  memoryLeaks?: boolean;
  stability?: boolean;
  resourceUsage?: ResourceUsage;
}

export interface ResourceUsage {
  cpu: number[];
  memory: number[];
  network: number[];
}

export interface VisualTestResult {
  url: string;
  timestamp: number;
  screenshots?: ScreenshotInfo[];
  visualRegression?: boolean;
  layoutShift?: number;
  themeComparison?: ThemeComparison;
  darkModeValid?: boolean;
}

export interface ScreenshotInfo {
  name: string;
  dataUrl: string;
  width: number;
  height: number;
}

export interface ThemeComparison {
  lightScore: number;
  darkScore: number;
  differences: number;
}

export interface AiAnalysisResult {
  url: string;
  timestamp: number;
  overallHealth: number;
  performanceScore: number;
  securityScore: number;
  accessibilityScore: number;
  seoScore: number;
  qualityScore: number;
  performanceSuggestions: string[];
  securityRecommendations: string[];
  accessibilitySuggestions: string[];
  seoImprovements: string[];
  uxReview: string[];
  uiReview: string[];
  bestPracticeSuggestions: string[];
  optimizationRecommendations: string[];
}

export interface TestFlow {
  id: string;
  name: string;
  description?: string;
  steps: TestFlowStep[];
  createdAt: number;
  updatedAt: number;
}

export interface TestFlowStep {
  id: string;
  type: 'openUrl' | 'wait' | 'click' | 'doubleClick' | 'hover' | 'typeText' | 'keyboard' | 'upload' | 'download' | 'scroll' | 'refresh' | 'navigate' | 'verifyUrl' | 'verifyText' | 'verifyElement' | 'verifyAttribute' | 'verifyCss' | 'verifyApi' | 'executeJs' | 'variable' | 'condition' | 'loop' | 'delay' | 'screenshot' | 'screenshotComparison' | 'endTest';
  params: Record<string, unknown>;
  description?: string;
}

export interface AcceptanceTest {
  id: string;
  name: string;
  type: 'uat' | 'cat' | 'bat' | 'oat' | 'alpha' | 'beta';
  description?: string;
  items: AcceptanceTestItem[];
  createdAt: number;
  status: 'draft' | 'in_progress' | 'completed';
}

export interface AcceptanceTestItem {
  id: string;
  description: string;
  expectedResult: string;
  result: 'pass' | 'fail' | 'pending' | 'na';
  notes?: string;
  screenshot?: string;
}

export type TestType = 'performance' | 'seo' | 'accessibility' | 'security' | 'html-css-js' | 'api' | 'load' | 'visual' | 'framework-detection' | 'full-audit' | 'functional' | 'cross-browser' | 'best-practices' | 'login' | 'refresh' | 'navigation' | 'scalability' | 'volume' | 'capacity' | 'concurrency' | 'reliability';

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  defaultUrl?: string;
  testingModules: TestType[];
  concurrentTests: number;
  notifications: boolean;
  autoSave: boolean;
  reportFormat: 'pdf' | 'json' | 'csv' | 'html';
}

export const DEFAULT_SETTINGS: UserSettings = {
  theme: 'system',
  defaultUrl: '',
  testingModules: ['performance', 'seo', 'accessibility', 'security'],
  concurrentTests: 3,
  notifications: true,
  autoSave: true,
  reportFormat: 'html',
};

export interface TestHistoryItem {
  id: string;
  url: string;
  type: TestType;
  timestamp: number;
  score?: number;
  status: 'running' | 'completed' | 'failed';
}

export interface FunctionalTestResult {
  url: string;
  timestamp: number;
  testType: 'smoke' | 'sanity' | 'regression' | 'integration' | 'system' | 'e2e' | 'workflow' | 'business-logic' | 'navigation' | 'form-validation' | 'search';
  score: number;
  passed: number;
  failed: number;
  totalTests: number;
  testCases: FunctionalTestCase[];
  recommendations: string[];
}

export interface FunctionalTestCase {
  id: string;
  name: string;
  description: string;
  status: 'pass' | 'fail' | 'skip';
  duration: number;
  error?: string;
}

export interface CrossBrowserResult {
  url: string;
  timestamp: number;
  browsers: BrowserResult[];
  overallScore: number;
  recommendations: string[];
}

export interface BrowserResult {
  name: 'Chromium' | 'Firefox' | 'WebKit';
  supported: boolean;
  score: number;
  issues: string[];
  renderingScore: number;
  featureSupport: number;
}

export interface BestPracticesResult {
  url: string;
  timestamp: number;
  score: number;
  lazyLoading: boolean;
  cachePolicy: string;
  compression: boolean;
  deprecatedApis: string[];
  imageOptimization: ImageOptimizationInfo;
  httpPractices: HttpPractice[];
  recommendations: string[];
}

export interface ImageOptimizationInfo {
  totalImages: number;
  optimizedCount: number;
  webpSupported: boolean;
  avifSupported: boolean;
  lazyLoaded: number;
  oversizedImages: string[];
}

export interface HttpPractice {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  detail: string;
}

export interface LoginTestResult {
  url: string;
  timestamp: number;
  authSpeed: number;
  loginSuccess: boolean;
  loginFailure: boolean;
  redirects: string[];
  sessionCreated: boolean;
  cookieCreated: boolean;
  tokenValidated: boolean;
  score: number;
  recommendations: string[];
}

export interface RefreshTestResult {
  url: string;
  timestamp: number;
  reloadTimes: number[];
  averageReloadTime: number;
  cacheEffectiveness: number;
  stability: boolean;
  memoryGrowth: number;
  errors: number;
  score: number;
  recommendations: string[];
}

export interface NavigationTestResult {
  url: string;
  timestamp: number;
  pagesTested: number;
  brokenNavigation: BrokenNavEntry[];
  redirectLoops: string[];
  missingPages: string[];
  brokenButtons: string[];
  missingRoutes: string[];
  score: number;
  recommendations: string[];
}

export interface BrokenNavEntry {
  from: string;
  to: string;
  error: string;
}

export interface ScalabilityTestResult {
  url: string;
  timestamp: number;
  stages: ScalabilityStage[];
  linearityScore: number;
  saturationPoint: number;
  score: number;
  recommendations: string[];
}

export interface ScalabilityStage {
  users: number;
  avgResponse: number;
  errorRate: number;
  throughput: number;
}

export interface VolumeTestResult {
  url: string;
  timestamp: number;
  datasetSize: string;
  avgResponseTime: number;
  peakMemoryUsage: number;
  processingTime: number;
  throughput: number;
  successRate: number;
  score: number;
  recommendations: string[];
}

export interface CapacityTestResult {
  url: string;
  timestamp: number;
  maxSustainableLoad: number;
  peakLoad: number;
  avgResponseAtPeak: number;
  errorRateAtPeak: number;
  resourceSaturation: ResourceSaturation;
  score: number;
  recommendations: string[];
}

export interface ResourceSaturation {
  cpu: number;
  memory: number;
  network: number;
  disk: number;
}

export interface ConcurrencyTestResult {
  url: string;
  timestamp: number;
  concurrentUsers: number;
  avgResponseTime: number;
  maxResponseTime: number;
  errorRate: number;
  deadlockDetected: boolean;
  raceConditions: string[];
  score: number;
  recommendations: string[];
}

export interface ReliabilityTestResult {
  url: string;
  timestamp: number;
  uptime: number;
  recoveryTime: number;
  failoverTime: number;
  crashCount: number;
  stabilityScore: number;
  recoverySuccess: boolean;
  failoverSupported: boolean;
  crashDetected: boolean;
  score: number;
  recommendations: string[];
}
