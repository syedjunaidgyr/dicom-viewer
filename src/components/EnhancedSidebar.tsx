'use client'

import React, { useState, useEffect } from 'react'
import { 
  FileText, 
  Ruler, 
  MessageSquare, 
  Scissors, 
  Settings,
  User,
  Calendar,
  Activity,
  Layers,
  Download,
  Eye,
  EyeOff,
  Trash2,
  Edit3,
  Copy,
  Save,
  FileSpreadsheet
} from 'lucide-react'
import { Instance, StudyInfo, Measurement, Annotation, Series } from '../types/dicom'

interface EnhancedSidebarProps {
  studyInfo: StudyInfo | null
  series: Series[]
  currentSeriesId: string | null
  instances: Instance[]
  currentInstanceIndex: number
  measurements: Measurement[]
  annotations: Annotation[]
  drawingPoints: { x: number; y: number }[]
  tool: string
  showMeasurements: boolean
  setShowMeasurements: (show: boolean) => void
  showAnnotations: boolean
  setShowAnnotations: (show: boolean) => void
  clearMeasurements: () => void
  clearAnnotations: () => void
  deleteMeasurement: (id: string) => void
  deleteAnnotation: (id: string) => void
  setDrawingPoints: (points: { x: number; y: number }[]) => void
  downloadStudy: () => void
  onSeriesSelect?: (seriesId: string) => void
  onGenerateReport?: () => void
  // Combined series viewport functions
  createCombinedSeriesViewport?: (viewportId: string, seriesIds: string[]) => void
  enableCombinedSeriesView?: (viewportId: string, enabled: boolean) => void
  addSeriesToCombinedView?: (viewportId: string, seriesId: string) => void
  removeSeriesFromCombinedView?: (viewportId: string, seriesId: string) => void
  updateSeriesOpacity?: (viewportId: string, seriesId: string, opacity: number) => void
  toggleSeriesVisibility?: (viewportId: string, seriesId: string, visible: boolean) => void
  navigateCombinedSeriesInstance?: (viewportId: string, direction: 'next' | 'previous') => void
  viewports?: any
  // OHIF viewer functions
  generateOHIFViewerUrl?: (seriesId: string) => string
  generateOHIFStudyUrl?: (studyId: string) => string
  openInOHIFViewer?: (seriesId: string) => void
  openStudyInOHIFViewer?: (studyId: string) => void
  copyOHIFViewerUrl?: (seriesId: string) => void
  copyOHIFStudyUrl?: (studyId: string) => void
  generateMultiSeriesOHIFUrl?: (seriesIds: string[]) => string
}

type PanelType = 'study' | 'measurements' | 'annotations' | 'series' | 'tools' | 'reports'

const EnhancedSidebar: React.FC<EnhancedSidebarProps> = ({
  studyInfo,
  series,
  currentSeriesId,
  instances,
  currentInstanceIndex,
  measurements,
  annotations,
  drawingPoints,
  tool,
  showMeasurements,
  setShowMeasurements,
  showAnnotations,
  setShowAnnotations,
  clearMeasurements,
  clearAnnotations,
  deleteMeasurement,
  deleteAnnotation,
  setDrawingPoints,
  downloadStudy,
  onSeriesSelect,
  onGenerateReport,
  // Combined series viewport functions
  createCombinedSeriesViewport,
  enableCombinedSeriesView,
  addSeriesToCombinedView,
  removeSeriesFromCombinedView,
  updateSeriesOpacity,
  toggleSeriesVisibility,
  navigateCombinedSeriesInstance,
  viewports,
  // OHIF viewer functions
  generateOHIFViewerUrl,
  generateOHIFStudyUrl,
  openInOHIFViewer,
  openStudyInOHIFViewer,
  copyOHIFViewerUrl,
  copyOHIFStudyUrl,
  generateMultiSeriesOHIFUrl
}) => {
  const [activePanel, setActivePanel] = useState<PanelType>('study')
  const [editingMeasurement, setEditingMeasurement] = useState<string | null>(null)
  const [editingAnnotation, setEditingAnnotation] = useState<string | null>(null)

  // Debug logging for series data
  useEffect(() => {
    console.log('EnhancedSidebar received series:', series)
    console.log('Series length:', series.length)
    console.log('Current series ID:', currentSeriesId)
    console.log('Available panels:', panels.map(p => p.name))
    console.log('Active panel:', activePanel)
  }, [series, currentSeriesId, activePanel])

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getTotalFileSize = () => {
    if (instances.length === 0) return 0
    return instances.reduce((total, instance) => total + instance.FileSize, 0)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown'
    try {
      const year = dateString.substring(0, 4)
      const month = dateString.substring(4, 6)
      const day = dateString.substring(6, 8)
      return `${month}/${day}/${year}`
    } catch {
      return dateString
    }
  }

  const panels = [
    { id: 'study', name: 'Study Info', icon: FileText, color: 'text-blue-600' },
    { id: 'series', name: 'Series', icon: Layers, color: 'text-green-600' },
    { id: 'measurements', name: 'Measurements', icon: Ruler, color: 'text-purple-600' },
    { id: 'annotations', name: 'Annotations', icon: MessageSquare, color: 'text-orange-600' },
    { id: 'tools', name: 'Tools', icon: Settings, color: 'text-gray-600' },
    { id: 'reports', name: 'Reports', icon: FileSpreadsheet, color: 'text-red-600' },
  ]

  const renderStudyPanel = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-3 flex items-center">
          <User className="h-4 w-4 mr-2" />
          Patient Information
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-blue-700">Name:</span>
            <span className="font-medium">{studyInfo?.MainDicomTags?.PatientName || 'Unknown'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">ID:</span>
            <span className="font-medium">{studyInfo?.MainDicomTags?.PatientID || 'Unknown'}</span>
          </div>
        </div>
      </div>

      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
        <h4 className="font-medium text-green-900 mb-3 flex items-center">
          <Calendar className="h-4 w-4 mr-2" />
          Study Information
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-green-700">Date:</span>
            <span className="font-medium">{formatDate(studyInfo?.MainDicomTags?.StudyDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-700">Description:</span>
            <span className="font-medium">{studyInfo?.MainDicomTags?.StudyDescription || 'Unnamed Study'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-700">Modality:</span>
            <span className="font-medium">{studyInfo?.MainDicomTags?.ModalitiesInStudy || 'Unknown'}</span>
          </div>
        </div>
      </div>

      <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
        <h4 className="font-medium text-purple-900 mb-3 flex items-center">
          <Activity className="h-4 w-4 mr-2" />
          Study Statistics
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-purple-700">Series:</span>
            <span className="font-medium">{studyInfo?.Series?.length || 0}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-purple-700">Instances:</span>
            <span className="font-medium">{instances.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-purple-700">Total Size:</span>
            <span className="font-medium">{formatFileSize(getTotalFileSize())}</span>
          </div>
        </div>
      </div>

      <button
        onClick={downloadStudy}
        className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
      >
        <Download className="h-4 w-4 mr-2" />
        Download Study
      </button>
    </div>
  )

  const renderSeriesPanel = () => (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-900 mb-3">Series Navigation</h4>
      {series.length > 0 ? (
        <div className="space-y-2">
          {series.map((seriesItem) => {
            const isSelected = currentSeriesId === seriesItem.ID
            return (
              <div
                key={seriesItem.ID}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => onSeriesSelect?.(seriesItem.ID)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">
                      {seriesItem.MainDicomTags?.SeriesDescription || 
                       `Series ${seriesItem.MainDicomTags?.SeriesNumber || 'Unknown'}`}
                    </span>
                    <span className="text-xs text-gray-500">
                      {seriesItem.Instances?.length || 0} images
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {seriesItem.MainDicomTags?.Modality || 'Unknown'}
                  </span>
                </div>
                {seriesItem.MainDicomTags?.ProtocolName && (
                  <div className="text-xs text-gray-500 mt-1">
                    Protocol: {seriesItem.MainDicomTags.ProtocolName}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No instances available</p>
      )}
    </div>
  )

  const renderMeasurementsPanel = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Measurements</h4>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowMeasurements(!showMeasurements)}
            className={`p-1 rounded text-xs ${showMeasurements ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}
            title="Toggle Measurements"
          >
            {showMeasurements ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          </button>
          <button
            onClick={clearMeasurements}
            className="p-1 text-red-500 hover:bg-red-50 rounded text-xs"
            title="Clear All"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {measurements.length === 0 ? (
        <p className="text-sm text-gray-500">No measurements yet</p>
      ) : (
        <div className="space-y-2">
          {measurements.map(measurement => (
            <div key={measurement.id} className="p-3 bg-white rounded border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: measurement.color }}
                  ></div>
                  <span className="text-sm font-medium capitalize">{measurement.type}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setEditingMeasurement(measurement.id)}
                    className="p-1 text-blue-500 hover:bg-blue-50 rounded text-xs"
                    title="Edit"
                  >
                    <Edit3 className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => deleteMeasurement(measurement.id)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded text-xs"
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <div>Value: {measurement.value?.toFixed(2) || 'N/A'} {measurement.unit}</div>
                <div>Points: {measurement.points.length}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderAnnotationsPanel = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Annotations</h4>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAnnotations(!showAnnotations)}
            className={`p-1 rounded text-xs ${showAnnotations ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}
            title="Toggle Annotations"
          >
            {showAnnotations ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          </button>
          <button
            onClick={clearAnnotations}
            className="p-1 text-red-500 hover:bg-red-50 rounded text-xs"
            title="Clear All"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>

      {annotations.length === 0 ? (
        <p className="text-sm text-gray-500">No annotations yet</p>
      ) : (
        <div className="space-y-2">
          {annotations.map(annotation => (
            <div key={annotation.id} className="p-3 bg-white rounded border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: annotation.color }}
                  ></div>
                  <span className="text-sm font-medium capitalize">{annotation.type}</span>
                  {annotation.text && (
                    <span className="text-xs text-gray-500">: {annotation.text}</span>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setEditingAnnotation(annotation.id)}
                    className="p-1 text-blue-500 hover:bg-blue-50 rounded text-xs"
                    title="Edit"
                  >
                    <Edit3 className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => deleteAnnotation(annotation.id)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded text-xs"
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderToolsPanel = () => (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
          <Settings className="h-4 w-4 mr-2" />
          Active Tool
        </h4>
        <div className="text-sm">
          <span className={`inline-block px-3 py-2 rounded text-sm font-medium ${
            tool === 'pan' ? 'bg-blue-100 text-blue-700' :
            tool === 'zoom' ? 'bg-blue-100 text-blue-700' :
            tool === 'wwwc' ? 'bg-blue-100 text-blue-700' :
            tool === 'distance' || tool === 'angle' || tool === 'area' ? 'bg-green-100 text-green-700' :
            'bg-purple-100 text-purple-700'
          }`}>
            {tool.charAt(0).toUpperCase() + tool.slice(1)}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {tool === 'pan' && 'Click and drag to move image'}
          {tool === 'zoom' && 'Use mouse wheel to zoom'}
          {tool === 'wwwc' && 'Click and drag to adjust contrast'}
          {tool === 'distance' && 'Click two points to measure distance'}
          {tool === 'angle' && 'Click three points to measure angle'}
          {tool === 'area' && 'Click multiple points to measure area'}
          {tool === 'text' && 'Click to add text annotation'}
          {tool === 'circle' && 'Click to add circle annotation'}
          {tool === 'rectangle' && 'Click to add rectangle annotation'}
        </p>
      </div>

      {drawingPoints.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2 flex items-center">
            <Scissors className="h-4 w-4 mr-2" />
            Drawing in Progress
          </h4>
          <p className="text-sm text-blue-700">
            {tool === 'distance' && drawingPoints.length === 1 && 'Click to set second point'}
            {tool === 'angle' && drawingPoints.length === 1 && 'Click to set second point'}
            {tool === 'angle' && drawingPoints.length === 2 && 'Click to set third point'}
            {tool === 'area' && drawingPoints.length >= 2 && 'Click to add more points or double-click to finish'}
          </p>
          <div className="text-xs text-blue-600 mb-2">
            Points: {drawingPoints.length}
          </div>
          <button
            onClick={() => setDrawingPoints([])}
            className="p-2 text-xs text-blue-600 hover:bg-blue-100 rounded border border-blue-300"
          >
            Cancel Drawing
          </button>
        </div>
      )}
    </div>
  )

  const renderReportsPanel = () => (
    <div className="space-y-4">
      <div className="bg-red-50 rounded-lg p-4 border border-red-200">
        <h4 className="font-medium text-red-900 mb-3 flex items-center">
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Report Generation
        </h4>
        <p className="text-sm text-red-700 mb-4">
          Generate comprehensive reports based on the current study, measurements, and annotations.
        </p>
        <button
          onClick={onGenerateReport}
          className="w-full p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center"
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Generate Report
        </button>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-3">Report Templates</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-blue-700">Available Templates:</span>
            <span className="font-medium">5</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Current Modality:</span>
            <span className="font-medium">{series[0]?.MainDicomTags?.Modality || 'Unknown'}</span>
          </div>
        </div>
      </div>

      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
        <h4 className="font-medium text-green-900 mb-3">Report Data</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-green-700">Measurements:</span>
            <span className="font-medium">{measurements.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-700">Annotations:</span>
            <span className="font-medium">{annotations.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-green-700">Series:</span>
            <span className="font-medium">{series.length}</span>
          </div>
        </div>
      </div>
    </div>
  )

  const renderPanelContent = () => {
    switch (activePanel) {
      case 'study':
        return renderStudyPanel()
      case 'series':
        return renderSeriesPanel()
      case 'measurements':
        return renderMeasurementsPanel()
      case 'annotations':
        return renderAnnotationsPanel()
      case 'tools':
        return renderToolsPanel()
      case 'reports':
        return renderReportsPanel()
      default:
        return renderStudyPanel()
    }
  }

  return (
    <div className="lg:col-span-1">
      {/* Panel Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 mb-4">
        <div className="flex border-b border-gray-200">
          {panels.map((panel) => {
            const Icon = panel.icon
            const isActive = activePanel === panel.id
            
            console.log(`Rendering panel: ${panel.name} (${panel.id})`)
            
            return (
              <button
                key={panel.id}
                onClick={() => setActivePanel(panel.id as PanelType)}
                className={`flex-1 p-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <Icon className={`h-4 w-4 mx-auto mb-1 ${panel.color}`} />
                <span className="block text-xs">{panel.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Panel Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        {renderPanelContent()}
      </div>
    </div>
  )
}

export default EnhancedSidebar
