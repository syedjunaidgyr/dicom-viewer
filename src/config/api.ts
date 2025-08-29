export const API_CONFIG = {
  // Base URLs
  ORTHANC_BASE: 'http://localhost:8080/orthanc',
  ORTHANC_DIRECT: 'http://localhost:8042',
  
  // CORS proxy for development
  CORS_PROXY: 'http://localhost:8080',
  
  // API endpoints
  ENDPOINTS: {
    STUDIES: '/studies',
    PATIENTS: '/patients',
    SERIES: '/series',
    INSTANCES: '/instances',
    TOOLS: {
      FIND: '/tools/find',
      CHANGES: '/changes',
    },
    SYSTEM: {
      INFO: '/system',
      STATISTICS: '/statistics',
      PLUGINS: '/plugins',
    },
    JOBS: '/jobs',
  },
  
  // Default headers
  DEFAULT_HEADERS: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  
  // DICOM specific headers
  DICOM_HEADERS: {
    'Accept': 'application/dicom+json',
  },
  
  // File download headers
  DOWNLOAD_HEADERS: {
    'Accept': 'application/zip',
  },
}

export const CORNERSTONE_CONFIG = {
  // CornerstoneJS configuration
  INIT_OPTIONS: {
    mouseEnabled: true,
    touchEnabled: true,
  },
  
  // Tool configurations
  TOOLS: {
    PAN: { mouseButtonMask: 1 },
    ZOOM: { mouseButtonMask: 2 },
    WWWC: { mouseButtonMask: 1 },
    ROTATE: { mouseButtonMask: 1 },
  },
  
  // Image loading options
  IMAGE_LOADING: {
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
  },
}

export const UI_CONFIG = {
  // Pagination
  PAGINATION: {
    DEFAULT_LIMIT: 50,
    MAX_LIMIT: 1000,
  },
  
  // Search
  SEARCH: {
    DEBOUNCE_MS: 300,
    MIN_CHARS: 2,
  },
  
  // Viewer
  VIEWER: {
    MIN_HEIGHT: 400,
    DEFAULT_HEIGHT: 600,
    ASPECT_RATIO: 16 / 9,
  },
}
