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
  API_URL: env.VITE_API_URL || 'http://localhost:8090',
  QC_SUMMARY_API: env.VITE_QC_SUMMARY_API || 'http://localhost:8010',

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
  }
}

// Export individual values for convenience
export const {
  API_URL,
  QC_SUMMARY_API,
  MINIO_URL,
  DEFAULT_BUCKET_NAME,
  MODE,
  DEV,
  PROD
} = ENV_CONFIG

// Default export
export default ENV_CONFIG
