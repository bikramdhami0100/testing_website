declare module 'autocannon' {
  interface AutocannonResult {
    latency: { average: number; p50: number; p75: number; p90: number; p95: number; p99: number; min: number; max: number }
    requests: { total: number; average: number; max: number; min: number; send: number }
    throughput: { total: number; average: number; max: number; min: number }
    errors: number
    timeouts: number
    duration: number
    connections: number
    pipelining: number
    non2xx: number
    statusCodeStats: Record<string, { count: number }>
  }

  interface AutocannonOptions {
    url: string
    connections?: number
    duration?: number
    pipelining?: number
    timeout?: number
    method?: string
    headers?: Record<string, string>
    body?: string | Buffer
    maxConnectionRequests?: number
    maxOverallRequests?: number
    connectionRate?: number
    overallRate?: number
    reconnectRate?: number
    workers?: number
    idReplacement?: boolean
    forever?: boolean
    servername?: string
    excludeErrorStats?: boolean
    bailout?: number
    setupClient?: (client: unknown) => void
    title?: string
  }

  function autocannon(options: AutocannonOptions): Promise<AutocannonResult>
  export default autocannon
}
