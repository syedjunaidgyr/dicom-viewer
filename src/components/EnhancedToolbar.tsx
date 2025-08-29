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
  EyeOff,
  Scissors,
  Palette,
  Layers,
  Settings,
  MousePointer,
  Target,
  LineChart,
  Image as ImageIcon,
  FileText,
  User,
  Calendar,
  Activity
} from 'lucide-react'

interface EnhancedToolbarProps {
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
  onWindowPresetChange: (preset: string) => void
}

const EnhancedToolbar: React.FC<EnhancedToolbarProps> = ({
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
  downloadStudy,
  onWindowPresetChange
}) => {
  const toolGroups = [
    {
      name: 'Navigation',
      tools: [
        { id: 'pan', icon: Move, label: 'Pan', description: 'Move image' },
        { id: 'zoom', icon: ZoomIn, label: 'Zoom', description: 'Zoom in/out' },
        { id: 'wwwc', icon: Grid3X3, label: 'Window/Level', description: 'Adjust contrast' },
      ]
    },
    {
      name: 'Measurement',
      tools: [
        { id: 'distance', icon: Ruler, label: 'Distance', description: 'Measure distance' },
        { id: 'angle', icon: Target, label: 'Angle', description: 'Measure angle' },
        { id: 'area', icon: Square, label: 'Area', description: 'Measure area' },
        { id: 'ellipse', icon: Circle, label: 'Ellipse', description: 'Elliptical ROI' },
        { id: 'freehand', icon: Scissors, label: 'Freehand', description: 'Freehand ROI' },
      ]
    },
    {
      name: 'Annotation',
      tools: [
        { id: 'text', icon: Type, label: 'Text', description: 'Add text' },
        { id: 'arrow', icon: ArrowRight, label: 'Arrow', description: 'Add arrow' },
        { id: 'circle', icon: Circle, label: 'Circle', description: 'Add circle' },
        { id: 'rectangle', icon: Square, label: 'Rectangle', description: 'Add rectangle' },
        { id: 'line', icon: LineChart, label: 'Line', description: 'Add line' },
      ]
    },
    {
      name: 'Image',
      tools: [
        { id: 'rotate', icon: RotateCw, label: 'Rotate', description: 'Rotate image' },
        { id: 'flip', icon: ImageIcon, label: 'Flip', description: 'Flip image' },
        { id: 'invert', icon: Palette, label: 'Invert', description: 'Invert colors' },
      ]
    }
  ]

  const windowPresets = [
    { name: 'CT', center: 40, width: 400 },
    { name: 'MR', center: 128, width: 256 },
    { name: 'PET', center: 128, width: 256 },
    { name: 'X-Ray', center: 128, width: 256 },
    { name: 'Ultrasound', center: 128, width: 256 },
  ]

  const getToolGroup = (toolId: string) => {
    for (const group of toolGroups) {
      if (group.tools.find(t => t.id === toolId)) {
        return group.name
      }
    }
    return 'Navigation'
  }

  return (
    <div className="bg-gray-900 text-white">
      {/* Main Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-2 border-b border-gray-700">
        <div className="flex flex-wrap items-center gap-1 mb-2 lg:mb-0">
          {toolGroups.map((group) => (
            <div key={group.name} className="flex items-center gap-1">
              {group.tools.map((toolItem) => {
                const Icon = toolItem.icon
                const isActive = tool === toolItem.id
                const isMeasurementTool = ['distance', 'angle', 'area', 'ellipse', 'roi'].includes(toolItem.id)
                const isAnnotationTool = ['text', 'arrow', 'circle', 'rectangle', 'line'].includes(toolItem.id)
                
                return (
                  <button
                    key={toolItem.id}
                    onClick={() => setActiveTool(toolItem.id)}
                    className={`p-2 rounded-lg transition-colors relative ${
                      isActive 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                    title={`${toolItem.label}: ${toolItem.description}`}
                  >
                    <Icon className="h-5 w-5" />
                    
                    {/* Color indicator dot for measurement tools */}
                    {isMeasurementTool && (
                      <div 
                        className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-900"
                        style={{ backgroundColor: measurementColor }}
                        title={`Measurement color: ${measurementColor}`}
                      />
                    )}
                    
                    {/* Color indicator dot for annotation tools */}
                    {isAnnotationTool && (
                      <div 
                        className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-900"
                        style={{ backgroundColor: annotationColor }}
                        title={`Annotation color: ${annotationColor}`}
                      />
                    )}
                  </button>
                )
              })}
              <div className="w-px h-6 bg-gray-600 mx-2"></div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={resetView}
            className="p-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg"
            title="Reset View"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          <button
            onClick={() => changeInstance('previous')}
            disabled={instancesLength === 0 || currentInstanceIndex === 0}
            className="p-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg disabled:opacity-50"
            title="Previous Image"
          >
            ←
          </button>
          <span className="text-sm text-gray-300 px-2">
            {instancesLength > 0 && currentInstanceIndex < instancesLength 
              ? `${currentInstanceIndex + 1} / ${instancesLength}` 
              : '0 / 0'}
          </span>
          <button
            onClick={() => changeInstance('next')}
            disabled={instancesLength === 0 || currentInstanceIndex >= instancesLength - 1}
            className="p-2 text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg disabled:opacity-50"
            title="Next Image"
          >
            →
          </button>
        </div>
      </div>

      {/* Secondary Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-3 bg-gray-800 gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Window/Level Controls */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-300">Window/Level:</span>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400">Center:</span>
              <input
                type="range"
                min="0"
                max="255"
                value={windowCenter}
                onChange={(e) => setWindowCenter(parseInt(e.target.value))}
                className="w-20"
              />
              <span className="text-sm text-gray-300 w-12">{Math.round(windowCenter)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400">Width:</span>
              <input
                type="range"
                min="1"
                max="255"
                value={windowWidth}
                onChange={(e) => setWindowWidth(parseInt(e.target.value))}
                className="w-20"
              />
              <span className="text-sm text-gray-300 w-12">{Math.round(windowWidth)}</span>
            </div>
          </div>

          {/* Window Presets */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-300">Presets:</span>
            {windowPresets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => onWindowPresetChange(preset.name)}
                className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
                title={`${preset.name}: C=${preset.center}, W=${preset.width}`}
              >
                {preset.name}
              </button>
            ))}
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-300">Zoom:</span>
            <button
              onClick={() => setZoom(Math.max(0.1, zoom * 0.9))}
              className="p-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-300 w-12">{zoom.toFixed(1)}x</span>
            <button
              onClick={() => setZoom(Math.min(5, zoom * 1.1))}
              className="p-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Rotation */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-300">Rotation:</span>
            <button
              onClick={() => setRotation(rotation + 90)}
              className="p-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
              title="Rotate 90°"
            >
              <RotateCw className="h-4 w-4" />
            </button>
            <span className="text-sm text-gray-300 w-12">{rotation}°</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Quick Color Selection */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-300">Quick Colors:</span>
            <div className="flex space-x-1">
              {['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8000', '#8000ff', '#00ff80', '#ffffff'].map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    if (['distance', 'angle', 'area', 'ellipse', 'roi'].includes(tool)) {
                      setMeasurementColor(color)
                    } else if (['text', 'arrow', 'circle', 'rectangle', 'line'].includes(tool)) {
                      setAnnotationColor(color)
                    }
                  }}
                  className={`w-4 h-4 rounded-full border-2 transition-all hover:scale-110 ${
                    (['distance', 'angle', 'area', 'ellipse', 'roi'].includes(tool) && measurementColor === color) ||
                    (['text', 'arrow', 'circle', 'rectangle', 'line'].includes(tool) && annotationColor === color)
                      ? 'border-white scale-110'
                      : 'border-gray-600'
                  }`}
                  style={{ backgroundColor: color }}
                  title={`Select ${color}`}
                />
              ))}
            </div>
          </div>
          
          {/* Measurement and Annotation Controls */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-300">Measurement Color:</span>
            <div className="flex items-center space-x-1">
              <input
                type="color"
                value={measurementColor}
                onChange={(e) => setMeasurementColor(e.target.value)}
                className="w-6 h-6 rounded border border-gray-600"
              />
              <div 
                className="w-4 h-4 rounded-full border border-gray-600"
                style={{ backgroundColor: measurementColor }}
                title={`Current: ${measurementColor}`}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-300">Annotation Color:</span>
            <div className="flex items-center space-x-1">
              <input
                type="color"
                value={annotationColor}
                onChange={(e) => setAnnotationColor(e.target.value)}
                className="w-6 h-6 rounded border border-gray-600"
              />
              <div 
                className="w-4 h-4 rounded-full border border-gray-600"
                style={{ backgroundColor: annotationColor }}
                title={`Current: ${annotationColor}`}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowMeasurements(!showMeasurements)}
              className={`p-1 rounded text-xs ${showMeasurements ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'}`}
              title="Toggle Measurements"
            >
              <Eye className="h-3 w-3" />
            </button>
            <button
              onClick={() => setShowAnnotations(!showAnnotations)}
              className={`p-1 rounded text-xs ${showAnnotations ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'}`}
              title="Toggle Annotations"
            >
              <Eye className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedToolbar
