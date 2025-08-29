'use client'

import React from 'react'
import { FileText, Ruler, MessageSquare, Scissors, Settings } from 'lucide-react'

interface Instance {
  ID: string
  FileSize: number
  FileUuid: string
  IndexInSeries: number
  Labels: string[]
  MainDicomTags: {
    AcquisitionNumber?: string
    InstanceCreationDate?: string
    InstanceCreationTime?: string
    InstanceNumber?: string
    NumberOfFrames?: string
    SOPInstanceUID?: string
  }
  ParentSeries: string
  Type: string
}

interface StudyInfo {
  ID: string
  MainDicomTags: {
    StudyDate?: string
    StudyDescription?: string
    PatientName?: string
    PatientID?: string
    ModalitiesInStudy?: string
  }
  Series: string[]
  Instances: string[]
}

interface Measurement {
  id: string
  type: 'distance' | 'angle' | 'area' | 'roi'
  points: { x: number; y: number }[]
  value?: number
  unit?: string
  label?: string
  color: string
}

interface Annotation {
  id: string
  type: 'text' | 'arrow' | 'circle' | 'rectangle' | 'line'
  position: { x: number; y: number }
  text?: string
  color: string
  size?: number
  points?: { x: number; y: number }[]
}

interface SidebarProps {
  studyInfo: StudyInfo | null
  instances: Instance[]
  currentInstanceIndex: number
  measurements: Measurement[]
  annotations: Annotation[]
  drawingPoints: { x: number; y: number }[]
  tool: string
  showMeasurements: boolean
  showAnnotations: boolean
  clearMeasurements: () => void
  clearAnnotations: () => void
  deleteMeasurement: (id: string) => void
  deleteAnnotation: (id: string) => void
  setDrawingPoints: (points: { x: number; y: number }[]) => void
}

const Sidebar: React.FC<SidebarProps> = ({
  studyInfo,
  instances,
  currentInstanceIndex,
  measurements,
  annotations,
  drawingPoints,
  tool,
  showMeasurements,
  showAnnotations,
  clearMeasurements,
  clearAnnotations,
  deleteMeasurement,
  deleteAnnotation,
  setDrawingPoints
}) => {
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

  return (
    <div className="lg:col-span-1">
      <div className="space-y-4">
        {/* Study Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <FileText className="h-4 w-4 mr-2 text-blue-600" />
            Study Summary
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Series:</span>
              <span className="font-medium">{studyInfo?.Series?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Instances:</span>
              <span className="font-medium">{instances.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Size:</span>
              <span className="font-medium">{formatFileSize(getTotalFileSize())}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Current:</span>
              <span className="font-medium">
                {instances.length > 0 && currentInstanceIndex < instances.length 
                  ? currentInstanceIndex + 1 
                  : 0}
              </span>
            </div>
            {instances.length > 0 && instances[currentInstanceIndex] && (
              <div className="flex justify-between">
                <span className="text-gray-600">Instance #:</span>
                <span className="font-medium">
                  {instances[currentInstanceIndex].MainDicomTags.InstanceNumber || 'N/A'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Measurements Panel */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <Ruler className="h-4 w-4 mr-2 text-green-600" />
            Measurements
          </h4>
          <div className="space-y-2">
            {measurements.length === 0 ? (
              <p className="text-sm text-gray-500">No measurements yet</p>
            ) : (
              measurements.map(measurement => (
                <div key={measurement.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: measurement.color }}
                    ></div>
                    <span className="text-sm">
                      {measurement.type}: {measurement.value?.toFixed(1)} {measurement.unit}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteMeasurement(measurement.id)}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
            <button
              onClick={clearMeasurements}
              className="w-full p-2 text-sm text-red-600 hover:bg-red-50 rounded border border-red-200"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Annotations Panel */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <MessageSquare className="h-4 w-4 mr-2 text-purple-600" />
            Annotations
          </h4>
          <div className="space-y-2">
            {annotations.length === 0 ? (
              <p className="text-sm text-gray-500">No annotations yet</p>
            ) : (
              annotations.map(annotation => (
                <div key={annotation.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: annotation.color }}
                    ></div>
                    <span className="text-sm capitalize">
                      {annotation.type}
                      {annotation.text && `: ${annotation.text}`}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteAnnotation(annotation.id)}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
            <button
              onClick={clearAnnotations}
              className="w-full p-2 text-sm text-red-600 hover:bg-red-50 rounded border border-red-200"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Drawing Status */}
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
              className="p-1 text-xs text-blue-600 hover:bg-blue-100 rounded border border-blue-300"
            >
              Cancel Drawing
            </button>
          </div>
        )}

        {/* Active Tool Indicator */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200" data-current-tool={tool}>
          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
            <Settings className="h-4 w-4 mr-2 text-gray-600" />
            Active Tool
          </h4>
          <div className="text-sm">
            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
              tool === 'pan' ? 'bg-blue-100 text-blue-700' :
              tool === 'zoom' ? 'bg-blue-100 text-blue-700' :
              tool === 'wwwc' ? 'bg-blue-100 text-blue-700' :
              tool === 'distance' || tool === 'angle' || tool === 'area' ? 'bg-green-100 text-green-700' :
              'bg-purple-100 text-purple-700'
            }`}>
              {tool.charAt(0).toUpperCase() + tool.slice(1)}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
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
      </div>
    </div>
  )
}

export default Sidebar
