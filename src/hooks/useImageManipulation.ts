import { useState, useCallback } from 'react'
import { Measurement, Annotation } from '../types/dicom'

export const useImageManipulation = () => {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [windowCenter, setWindowCenter] = useState(128)
  const [windowWidth, setWindowWidth] = useState(256)
  const [panX, setPanX] = useState(0)
  const [panY, setPanY] = useState(0)
  const [tool, setTool] = useState('pan')
  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawingPoints, setDrawingPoints] = useState<{ x: number; y: number }[]>([])
  const [showMeasurements, setShowMeasurements] = useState(true)
  const [showAnnotations, setShowAnnotations] = useState(true)
  const [measurementColor, setMeasurementColor] = useState('#00ff00')
  const [annotationColor, setAnnotationColor] = useState('#ff0000')
  const [pixelSpacing, setPixelSpacing] = useState({ x: 1, y: 1 })

  const resetImageTransform = useCallback(() => {
    setZoom(1)
    setRotation(0)
    setPanX(0)
    setPanY(0)
    setWindowCenter(128)
    setWindowWidth(256)
  }, [])

  const setActiveTool = useCallback((toolName: string) => {
    console.log(`Setting tool from '${tool}' to '${toolName}'`)
    setTool(toolName)
    
    // Clear any existing drawing points when changing tools
    if (drawingPoints.length > 0) {
      setDrawingPoints([])
      console.log('Cleared drawing points due to tool change')
    }
  }, [drawingPoints.length])

  const clearMeasurements = useCallback(() => {
    setMeasurements([])
    setDrawingPoints([])
  }, [])

  const clearAnnotations = useCallback(() => {
    setAnnotations([])
  }, [])

  const deleteMeasurement = useCallback((id: string) => {
    setMeasurements(prev => prev.filter(m => m.id !== id))
  }, [])

  const deleteAnnotation = useCallback((id: string) => {
    setAnnotations(prev => prev.filter(a => a.id !== id))
  }, [])

  const addMeasurement = useCallback((measurement: Measurement) => {
    setMeasurements(prev => [...prev, measurement])
  }, [])

  const addAnnotation = useCallback((annotation: Annotation) => {
    setAnnotations(prev => [...prev, annotation])
  }, [])

  const calculateDistance = useCallback((p1: { x: number; y: number }, p2: { x: number; y: number }): number => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
  }, [])

  const calculateAngle = useCallback((p1: { x: number; y: number }, p2: { x: number; y: number }, p3: { x: number; y: number }): number => {
    const angle1 = Math.atan2(p1.y - p2.y, p1.x - p2.x)
    const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x)
    return ((angle2 - angle1) * 180) / Math.PI
  }, [])

  const calculateArea = useCallback((points: { x: number; y: number }[]): number => {
    if (points.length < 3) return 0
    
    let area = 0
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length
      area += points[i].x * points[j].y
      area -= points[j].x * points[i].y
    }
    return Math.abs(area) / 2
  }, [])

  const handleMeasurementClick = useCallback((imageCoords: { x: number; y: number }) => {
    if (tool === 'distance') {
      if (drawingPoints.length === 0) {
        setDrawingPoints([{ x: imageCoords.x, y: imageCoords.y }])
      } else if (drawingPoints.length === 1) {
        const distance = calculateDistance(drawingPoints[0], { x: imageCoords.x, y: imageCoords.y })
        const newMeasurement: Measurement = {
          id: Date.now().toString(),
          type: 'distance',
          points: [...drawingPoints, { x: imageCoords.x, y: imageCoords.y }],
          value: distance * pixelSpacing.x,
          unit: 'mm',
          color: measurementColor
        }
        addMeasurement(newMeasurement)
        setDrawingPoints([])
      }
    } else if (tool === 'angle') {
      if (drawingPoints.length < 3) {
        setDrawingPoints(prev => [...prev, { x: imageCoords.x, y: imageCoords.y }])
        if (drawingPoints.length === 2) {
          const angle = calculateAngle(drawingPoints[0], drawingPoints[1], { x: imageCoords.x, y: imageCoords.y })
          const newMeasurement: Measurement = {
            id: Date.now().toString(),
            type: 'angle',
            points: [...drawingPoints, { x: imageCoords.x, y: imageCoords.y }],
            value: Math.abs(angle),
            unit: '°',
            color: measurementColor
          }
          addMeasurement(newMeasurement)
          setDrawingPoints([])
        }
      }
    } else if (tool === 'area') {
      setDrawingPoints(prev => [...prev, { x: imageCoords.x, y: imageCoords.y }])
      if (drawingPoints.length >= 2) {
        const area = calculateArea([...drawingPoints, { x: imageCoords.x, y: imageCoords.y }])
        const newMeasurement: Measurement = {
          id: Date.now().toString(),
          type: 'area',
          points: [...drawingPoints, { x: imageCoords.x, y: imageCoords.y }],
          value: area * pixelSpacing.x * pixelSpacing.y,
          unit: 'mm²',
          color: measurementColor
        }
        addMeasurement(newMeasurement)
        setDrawingPoints([])
      }
    } else if (tool === 'ellipse') {
      if (drawingPoints.length === 0) {
        setDrawingPoints([{ x: imageCoords.x, y: imageCoords.y }])
      } else if (drawingPoints.length === 1) {
        const area = Math.PI * Math.abs(imageCoords.x - drawingPoints[0].x) * Math.abs(imageCoords.y - drawingPoints[0].y) / 4
        const newMeasurement: Measurement = {
          id: Date.now().toString(),
          type: 'ellipse',
          points: [...drawingPoints, { x: imageCoords.x, y: imageCoords.y }],
          value: area * pixelSpacing.x * pixelSpacing.y,
          unit: 'mm²',
          color: measurementColor
        }
        addMeasurement(newMeasurement)
        setDrawingPoints([])
      }
    } else if (tool === 'roi') {
      setDrawingPoints(prev => [...prev, { x: imageCoords.x, y: imageCoords.y }])
      if (drawingPoints.length >= 2) {
        const area = calculateArea([...drawingPoints, { x: imageCoords.x, y: imageCoords.y }])
        const newMeasurement: Measurement = {
          id: Date.now().toString(),
          type: 'roi',
          points: [...drawingPoints, { x: imageCoords.x, y: imageCoords.y }],
          value: area * pixelSpacing.x * pixelSpacing.y,
          unit: 'mm²',
          color: measurementColor
        }
        addMeasurement(newMeasurement)
        setDrawingPoints([])
      }
    }
  }, [tool, drawingPoints, pixelSpacing, measurementColor, calculateDistance, calculateAngle, calculateArea, addMeasurement])

  const handleAnnotationClick = useCallback((imageCoords: { x: number; y: number }) => {
    if (tool === 'text') {
      const text = prompt('Enter annotation text:')
      if (text) {
        const newAnnotation: Annotation = {
          id: Date.now().toString(),
          type: 'text',
          position: { x: imageCoords.x, y: imageCoords.y },
          text,
          color: annotationColor,
          size: 16
        }
        addAnnotation(newAnnotation)
      }
    } else if (tool === 'circle') {
      const newAnnotation: Annotation = {
        id: Date.now().toString(),
        type: 'circle',
        position: { x: imageCoords.x, y: imageCoords.y },
        color: annotationColor,
        size: 20
      }
      addAnnotation(newAnnotation)
    } else if (tool === 'rectangle') {
      const newAnnotation: Annotation = {
        id: Date.now().toString(),
        type: 'rectangle',
        position: { x: imageCoords.x, y: imageCoords.y },
        color: annotationColor,
        size: 40
      }
      addAnnotation(newAnnotation)
    }
  }, [tool, annotationColor, addAnnotation])

  const completeROIMeasurement = useCallback(() => {
    if (tool === 'roi' && drawingPoints.length >= 3) {
      const area = calculateArea(drawingPoints)
      const newMeasurement: Measurement = {
        id: Date.now().toString(),
        type: 'roi',
        points: [...drawingPoints],
        value: area * pixelSpacing.x * pixelSpacing.y,
        unit: 'mm²',
        color: measurementColor
      }
      addMeasurement(newMeasurement)
      setDrawingPoints([])
    }
  }, [tool, drawingPoints, pixelSpacing, measurementColor, calculateArea, addMeasurement])

  return {
    // State
    zoom,
    setZoom,
    rotation,
    setRotation,
    windowCenter,
    setWindowCenter,
    windowWidth,
    setWindowWidth,
    panX,
    setPanX,
    panY,
    setPanY,
    tool,
    measurements,
    annotations,
    isDrawing,
    drawingPoints,
    showMeasurements,
    setShowMeasurements,
    showAnnotations,
    setShowAnnotations,
    measurementColor,
    setMeasurementColor,
    annotationColor,
    setAnnotationColor,
    pixelSpacing,
    
    // Actions
    resetImageTransform,
    setActiveTool,
    clearMeasurements,
    clearAnnotations,
    deleteMeasurement,
    deleteAnnotation,
    addMeasurement,
    addAnnotation,
    handleMeasurementClick,
    handleAnnotationClick,
    completeROIMeasurement,
    setDrawingPoints,
    
    // Utilities
    calculateDistance,
    calculateAngle,
    calculateArea
  }
}
