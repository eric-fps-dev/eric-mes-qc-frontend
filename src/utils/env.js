/**
 * Centralized Environment Configuration Utility
 * Provides a single source of truth for all environment variables
 */

// Get the processed environment variables (available at runtime)
const env = import.meta.env

/**
 * Environment configuration object with type safety and defaults
 */
export const ENV_CONFIG = {
  // API Configuration
  BACKEND_URL: env.VITE_BACKEND_URL || 'http://localhost:8090',
  QC_SUMMARY_API: env.VITE_QC_SUMMARY_API || 'http://localhost:8010',
  PROXY_DOMAIN : env.VITE_PROXY_DOMAIN || '/api',
  PROXY_DOMAIN_REAL : env.VITE_PROXY_DOMAIN_REAL || '',

  // MinIO Configuration
  MINIO_URL: env.VITE_MINIO_URL || 'http://10.10.12.12:8086',
  DEFAULT_BUCKET_NAME: env.VITE_DEFAULT_BUCKET_NAME || 'sv-file-bucket',

  // Environment Detection
  MODE: env.MODE || 'development',
  DEV: env.DEV || false,
  PROD: env.PROD || false
}

/**
 * Environment helper functions
 */
export const ENV_UTILS = {
  /**
   * Check if running in development mode
   */
  isDev: () => ENV_CONFIG.MODE === 'development',

  /**
   * Check if running in production mode
   */
  isProd: () => ENV_CONFIG.MODE === 'production',

  /**
   * Get full MinIO URL for file operations
   */
  getMinioUrl: (path = '') => {
    return `${ENV_CONFIG.MINIO_URL}${path}`
  },

  /**
   * Get environment-specific configuration
   */
  getEnvConfig: (key) => {
    return ENV_CONFIG[key]
  },

  getApiBaseUrl : () => {
    if ( ENV_CONFIG.MODE === 'development' ) {
      return ENV_CONFIG.PROXY_DOMAIN // '/api' - proxied by Vite
    }
    return ENV_CONFIG.BACKEND_URL // Direct backend URL in production
  },
}

// Export individual values for convenience
export const {
  BACKEND_URL,
  QC_SUMMARY_URL,
  MINIO_URL,
  DEFAULT_BUCKET_NAME,
  MODE,
  DEV,
  PROD
} = ENV_CONFIG

// Default export
export default ENV_CONFIG
