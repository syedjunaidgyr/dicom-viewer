// Environment Configuration
export const ENV_CONFIG = {
  // Orthanc PACS Server URLs
  ORTHANC_BASE_URL: process.env.NEXT_PUBLIC_ORTHANC_BASE_URL || 'http://192.168.1.2/orthanc',
  ORTHANC_DIRECT_URL: process.env.NEXT_PUBLIC_ORTHANC_DIRECT_URL || 'http://l192.168.1.2:8042',
  CORS_PROXY_URL: process.env.NEXT_PUBLIC_CORS_PROXY_URL || 'http://192.168.1.2:8080',
  
  // Application Settings
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'DICOM Viewer',
  APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  
  // Debug Mode
  DEBUG: process.env.NEXT_PUBLIC_DEBUG === 'true',
  
  // API Configuration
  API_TIMEOUT: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000'),
  MAX_RETRY_ATTEMPTS: parseInt(process.env.NEXT_PUBLIC_MAX_RETRY_ATTEMPTS || '3'),
}

// Development vs Production
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development'
export const IS_PRODUCTION = process.env.NODE_ENV === 'production'
