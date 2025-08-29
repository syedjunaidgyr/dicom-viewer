'use client'

import React from 'react'
import { 
  ZoomIn, 
  ZoomOut,
  RotateCw, 
  Move, 
  Grid3X3,
  RefreshCw,
  Download,
  Ruler,
  Type,
  Plus,
  Minus,
  Circle,
  Square,
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react'

interface ToolbarProps {
  tool: string
  setActiveTool: (tool: string) => void
  zoom: number
  setZoom: (zoom: number) => void
  rotation: number
  setRotation: (rotation: number) => void
  windowCenter: number
  setWindowCenter: (center: number) => void
  windowWidth: number
  setWindowWidth: (width: number) => void
  showMeasurements: boolean
  setShowMeasurements: (show: boolean) => void
  showAnnotations: boolean
  setShowAnnotations: (show: boolean) => void
  measurementColor: string
  setMeasurementColor: (color: string) => void
  annotationColor: string
  setAnnotationColor: (color: string) => void
  resetView: () => void
  changeInstance: (direction: 'next' | 'previous') => void
  currentInstanceIndex: number
  instancesLength: number
  downloadStudy: () => void
}

const Toolbar: React.FC<ToolbarProps> = ({
  tool,
  setActiveTool,
  zoom,
  setZoom,
  rotation,
  setRotation,
  windowCenter,
  setWindowCenter,
  windowWidth,
  setWindowWidth,
  showMeasurements,
  setShowMeasurements,
  showAnnotations,
  setShowAnnotations,
  measurementColor,
  setMeasurementColor,
  annotationColor,
  setAnnotationColor,
  resetView,
  changeInstance,
  currentInstanceIndex,
  instancesLength,
  downloadStudy
}) => {
  return (
    <div className="border-b border-gray-200 p-4 bg-gray-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Basic Tools */}
          <button
            onClick={() => setActiveTool('pan')}
            className={`p-2 rounded-lg transition-colors ${
              tool === 'pan' ? 'bg-blue-100 text-blue-600 border border-blue-300' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
            }`}
            title="Pan Tool - Click and drag to move image"
          >
            <Move className="h-5 w-5" />
          </button>
          <button
            onClick={() => setActiveTool('zoom')}
            className={`p-2 rounded-lg transition-colors ${
              tool === 'zoom' ? 'bg-blue-100 text-blue-600 border border-blue-300' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
            }`}
            title="Zoom Tool - Use mouse wheel to zoom"
          >
            <ZoomIn className="h-5 w-5" />
          </button>
          <button
            onClick={() => setActiveTool('wwwc')}
            className={`p-2 rounded-lg transition-colors ${
              tool === 'wwwc' ? 'bg-blue-100 text-blue-600 border border-blue-300' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
            }`}
            title="Window/Level Tool - Click and drag to adjust contrast"
          >
            <Grid3X3 className="h-5 w-5" />
          </button>
          
          {/* Measurement Tools */}
          <div className="border-l border-gray-300 mx-2 h-6"></div>
          <button
            onClick={() => setActiveTool('distance')}
            className={`p-2 rounded-lg transition-colors ${
              tool === 'distance' ? 'bg-green-100 text-green-600 border border-green-300' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
            }`}
            title="Distance Measurement - Click two points to measure"
          >
            <Ruler className="h-5 w-5" />
          </button>
          <button
            onClick={() => setActiveTool('angle')}
            className={`p-2 rounded-lg transition-colors ${
              tool === 'angle' ? 'bg-green-100 text-green-600 border border-green-300' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
            }`}
            title="Angle Measurement - Click three points to measure angle"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
          <button
            onClick={() => setActiveTool('area')}
            className={`p-2 rounded-lg transition-colors ${
              tool === 'area' ? 'bg-green-100 text-green-600 border border-green-300' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
            }`}
            title="Area Measurement - Click multiple points to measure area"
          >
            <Square className="h-5 w-5" />
          </button>
          
          {/* Annotation Tools */}
          <div className="border-l border-gray-300 mx-2 h-6"></div>
          <button
            onClick={() => setActiveTool('text')}
            className={`p-2 rounded-lg transition-colors ${
              tool === 'text' ? 'bg-purple-100 text-purple-600 border border-purple-300' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
            }`}
            title="Text Annotation - Click to add text"
          >
            <Type className="h-5 w-5" />
          </button>
          <button
            onClick={() => setActiveTool('circle')}
            className={`p-2 rounded-lg transition-colors ${
              tool === 'circle' ? 'bg-purple-100 text-purple-600 border border-purple-300' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
            }`}
            title="Circle Annotation - Click to add circle"
          >
            <Circle className="h-5 w-5" />
          </button>
          <button
            onClick={() => setActiveTool('rectangle')}
            className={`p-2 rounded-lg transition-colors ${
              tool === 'rectangle' ? 'bg-purple-100 text-purple-600 border border-purple-300' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
            }`}
            title="Rectangle Annotation - Click to add rectangle"
          >
            <Square className="h-5 w-5" />
          </button>
          
          {/* Image Manipulation */}
          <div className="border-l border-gray-300 mx-2 h-6"></div>
          <button
            onClick={() => setRotation(prev => prev + 90)}
            className="p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800 rounded-lg transition-colors"
            title="Rotate 90°"
          >
            <RotateCw className="h-5 w-5" />
          </button>
          <button
            onClick={() => setZoom(prev => Math.max(0.1, prev * 0.9))}
            className="p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800 rounded-lg transition-colors"
            title="Zoom Out"
          >
            <Minus className="h-5 w-5" />
          </button>
          <button
            onClick={() => setZoom(prev => Math.min(5, prev * 1.1))}
            className="p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-800 rounded-lg transition-colors"
            title="Zoom In"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={resetView}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            title="Reset View"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          <button
            onClick={() => changeInstance('previous')}
            disabled={instancesLength === 0 || currentInstanceIndex === 0}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            title="Previous Image"
          >
            ←
          </button>
          <span className="text-sm text-gray-600">
            {instancesLength > 0 && currentInstanceIndex < instancesLength 
              ? `${currentInstanceIndex + 1} / ${instancesLength}` 
              : '0 / 0'}
          </span>
          <button
            onClick={() => changeInstance('next')}
            disabled={instancesLength === 0 || currentInstanceIndex >= instancesLength - 1}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            title="Next Image"
          >
            →
          </button>
        </div>
      </div>

      {/* Enhanced Controls */}
      <div className="flex items-center space-x-4 mt-3">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Window Center:</span>
          <input
            type="range"
            min="0"
            max="255"
            value={windowCenter}
            onChange={(e) => setWindowCenter(parseInt(e.target.value))}
            className="w-24"
          />
          <span className="text-sm text-gray-600 w-12">{Math.round(windowCenter)}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Window Width:</span>
          <input
            type="range"
            min="1"
            max="255"
            value={windowWidth}
            onChange={(e) => setWindowWidth(parseInt(e.target.value))}
            className="w-24"
          />
          <span className="text-sm text-gray-600 w-12">{Math.round(windowWidth)}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Zoom:</span>
          <span className="text-sm text-gray-600 w-12">{zoom.toFixed(1)}x</span>
        </div>
        
        {/* Measurement and Annotation Controls */}
        <div className="border-l border-gray-300 mx-2 h-6"></div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Measurement Color:</span>
          <input
            type="color"
            value={measurementColor}
            onChange={(e) => setMeasurementColor(e.target.value)}
            className="w-8 h-6 rounded border"
          />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Annotation Color:</span>
          <input
            type="color"
            value={annotationColor}
            onChange={(e) => setAnnotationColor(e.target.value)}
            className="w-8 h-6 rounded border"
          />
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowMeasurements(!showMeasurements)}
            className={`p-1 rounded text-xs ${showMeasurements ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}
          >
            {showMeasurements ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          </button>
          <button
            onClick={() => setShowAnnotations(!showAnnotations)}
            className={`p-1 rounded text-xs ${showAnnotations ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}
          >
            {showAnnotations ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Toolbar
