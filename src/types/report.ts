export interface ReportData {
  id: string
  studyId: string
  patientId: string
  patientName: string
  studyDate: string
  studyDescription: string
  modality: string
  seriesCount: number
  instanceCount: number
  measurements: Measurement[]
  annotations: Annotation[]
  findings: Finding[]
  conclusion: string
  recommendations: string
  radiologistName: string
  reportDate: string
  status: 'draft' | 'final' | 'preliminary'
}

export interface Finding {
  id: string
  type: 'normal' | 'abnormal' | 'critical'
  location: string
  description: string
  measurements: Measurement[]
  confidence: 'low' | 'medium' | 'high'
  priority: 'low' | 'medium' | 'high' | 'urgent'
}

export interface ReportTemplate {
  id: string
  name: string
  description: string
  modality: string[]
  sections: ReportSection[]
  isDefault: boolean
}

export interface ReportSection {
  id: string
  title: string
  type: 'text' | 'measurements' | 'findings' | 'images' | 'table' | 'signature'
  required: boolean
  order: number
  template?: string
}

export interface Measurement {
  id: string
  type: 'distance' | 'angle' | 'area' | 'roi' | 'ellipse'
  points: { x: number; y: number }[]
  value?: number
  unit?: string
  label?: string
  color: string
  seriesId?: string
  instanceId?: string
}

export interface Annotation {
  id: string
  type: 'text' | 'arrow' | 'circle' | 'rectangle' | 'line'
  position: { x: number; y: number }
  text?: string
  color: string
  size?: number
  points?: { x: number; y: number }[]
  seriesId?: string
  instanceId?: string
}

export interface ReportExportOptions {
  format: 'pdf' | 'html' | 'docx' | 'txt'
  includeImages: boolean
  includeMeasurements: boolean
  includeAnnotations: boolean
  template: string
}
