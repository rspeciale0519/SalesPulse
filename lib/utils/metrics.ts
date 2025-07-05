// Simple metrics tracking for auth operations
// In production, integrate with your preferred metrics provider (DataDog, New Relic, etc.)
//
// WARNING: This implementation uses global state to store metrics which has significant limitations:
// - In serverless environments, metrics will be reset between invocations
// - In multi-instance deployments, each instance will have its own isolated metrics
// - During development with hot reloading, metrics may reset unexpectedly
//
// For production use, replace this with a proper metrics backend such as:
// - Prometheus/OpenTelemetry for self-hosted solutions
// - DataDog/New Relic/CloudWatch for managed services

interface MetricsCounter {
  [key: string]: number
}

interface MetricsHistogram {
  [key: string]: number[]
}

// In-memory metrics store (replace with proper metrics backend in production)
const _metrics: {
  counters: MetricsCounter
  histograms: MetricsHistogram
} = (global as any)._metrics || { counters: {}, histograms: {} }
;(global as any)._metrics = _metrics

export function incrementCounter(name: string, value: number = 1) {
  try {
    if (!isMetricsEnabled()) return
    
    _metrics.counters[name] = (_metrics.counters[name] || 0) + value
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 [METRICS] Counter ${name}: ${_metrics.counters[name]}`)
    }
  } catch (error) {
    // Silently fail to prevent metrics issues from affecting core functionality
    if (process.env.NODE_ENV === 'development') {
      console.error(`Error incrementing metric ${name}:`, error)
    }
  }
}

export function recordHistogram(name: string, value: number) {
  try {
    if (!isMetricsEnabled()) return
    
    if (!_metrics.histograms[name]) {
      _metrics.histograms[name] = []
    }
    
    _metrics.histograms[name].push(value)
    
    // Keep only last 100 values to prevent memory bloat
    if (_metrics.histograms[name].length > 100) {
      _metrics.histograms[name] = _metrics.histograms[name].slice(-100)
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 [METRICS] Histogram ${name}: ${value}ms`)
    }
  } catch (error) {
    // Silently fail to prevent metrics issues from affecting core functionality
    if (process.env.NODE_ENV === 'development') {
      console.error(`Error recording histogram ${name}:`, error)
    }
  }
}

export function getMetrics() {
  try {
    return {
      counters: { ..._metrics.counters },
      histograms: Object.fromEntries(
        Object.entries(_metrics.histograms).map(([key, values]) => [
          key,
          {
            count: values.length,
            // Handle empty arrays to prevent Infinity/-Infinity and NaN
            min: values.length ? Math.min(...values) : 0,
            max: values.length ? Math.max(...values) : 0,
            avg: values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0
          }
        ])
      )
    }
  } catch (error) {
    // Return empty metrics on error to prevent crashes
    if (process.env.NODE_ENV === 'development') {
      console.error('Error getting metrics:', error)
    }
    return { counters: {}, histograms: {} }
  }
}

function isMetricsEnabled(): boolean {
  return process.env.METRICS_ENABLED === 'true'
}
