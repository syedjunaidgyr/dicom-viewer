'use client'

import React, { useRef, useEffect } from 'react'

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

interface DicomImageProps {
  currentImage: {
    src: string
    loaded: boolean
    error: boolean
  } | null
  isLoading: boolean
  instances: Instance[]
  currentInstanceIndex: number
  zoom: number
  rotation: number
  windowCenter: number
  windowWidth: number
  panX: number
  panY: number
  tool: string
  measurements: any[]
  annotations: any[]
  showMeasurements: boolean
  showAnnotations: boolean
  onImageLoad: () => void
  onImageError: () => void
  onMouseDown: (e: React.MouseEvent) => void
  onMouseMove: (e: React.MouseEvent) => void
  onMouseUp: (e: React.MouseEvent) => void
  onMouseLeave: () => void
  onWheel: (e: React.WheelEvent) => void
  onDoubleClick: (e: React.MouseEvent) => void
  changeInstance: (direction: 'next' | 'previous') => void
}

const DicomImage: React.FC<DicomImageProps> = ({
  currentImage,
  isLoading,
  instances,
  currentInstanceIndex,
  zoom,
  rotation,
  windowCenter,
  windowWidth,
  panX,
  panY,
  tool,
  measurements,
  annotations,
  showMeasurements,
  showAnnotations,
  onImageLoad,
  onImageError,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onMouseLeave,
  onWheel,
  onDoubleClick,
  changeInstance
}) => {
  const elementRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const updateImageTransform = (img: HTMLImageElement) => {
    // Apply all transformations
    const transform = `translate(${panX}px, ${panY}px) scale(${zoom}) rotate(${rotation}deg)`
    img.style.transform = transform
    
    // Apply window/level
    img.style.filter = `contrast(${windowWidth / 256}) brightness(${windowCenter / 128})`
  }

  const redrawCanvas = () => {
    if (!canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      console.error('Failed to get canvas context')
      return
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    if (showMeasurements) {
      measurements.forEach(measurement => {
        drawMeasurement(ctx, measurement)
      })
    }
    
    if (showAnnotations) {
      annotations.forEach(annotation => {
        drawAnnotation(ctx, annotation)
      })
    }
  }

  const drawMeasurement = (ctx: CanvasRenderingContext2D, measurement: any) => {
    ctx.strokeStyle = measurement.color
    ctx.fillStyle = measurement.color
    ctx.lineWidth = 2
    
    switch (measurement.type) {
      case 'distance':
        if (measurement.points.length >= 2) {
          const [p1, p2] = measurement.points
          const transformedP1 = imageToScreenCoordinates(p1.x, p1.y)
          const transformedP2 = imageToScreenCoordinates(p2.x, p2.y)
          
          ctx.beginPath()
          ctx.moveTo(transformedP1.x, transformedP1.y)
          ctx.lineTo(transformedP2.x, transformedP2.y)
          ctx.stroke()
          
          // Draw measurement label
          const midX = (transformedP1.x + transformedP2.x) / 2
          const midY = (transformedP1.y + transformedP2.y) / 2
          ctx.fillStyle = '#000'
          ctx.fillRect(midX - 20, midY - 10, 40, 20)
          ctx.fillStyle = '#fff'
          ctx.font = '12px Arial'
          ctx.textAlign = 'center'
          ctx.fillText(`${measurement.value?.toFixed(1) || '0'}mm`, midX, midY + 4)
        }
        break
        
      case 'angle':
        if (measurement.points.length >= 3) {
          const [p1, p2, p3] = measurement.points
          const transformedP1 = imageToScreenCoordinates(p1.x, p1.y)
          const transformedP2 = imageToScreenCoordinates(p2.x, p2.y)
          const transformedP3 = imageToScreenCoordinates(p3.x, p3.y)
          
          ctx.beginPath()
          ctx.moveTo(transformedP1.x, transformedP1.y)
          ctx.lineTo(transformedP2.x, transformedP2.y)
          ctx.lineTo(transformedP3.x, transformedP3.y)
          ctx.stroke()
          
          // Draw angle arc
          const angle = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x)
          ctx.beginPath()
          ctx.arc(transformedP2.x, transformedP2.y, 30 * zoom, Math.atan2(p1.y - p2.y, p1.x - p2.x), Math.atan2(p3.y - p2.y, p3.x - p2.x))
          ctx.stroke()
          
          // Draw angle value
          const degAngle = (angle * 180) / Math.PI
          ctx.fillStyle = '#000'
          ctx.fillRect(transformedP2.x - 20, transformedP2.y - 30, 40, 20)
          ctx.fillStyle = '#fff'
          ctx.font = '12px Arial'
          ctx.textAlign = 'center'
          ctx.fillText(`${Math.abs(degAngle).toFixed(1)}°`, transformedP2.x, transformedP2.y - 15)
        }
        break
        
      case 'area':
        if (measurement.points.length >= 3) {
          const transformedPoints = measurement.points.map((point: any) => imageToScreenCoordinates(point.x, point.y))
          
          ctx.beginPath()
          ctx.moveTo(transformedPoints[0].x, transformedPoints[0].y)
          transformedPoints.forEach((point: any) => {
            ctx.lineTo(point.x, point.y)
          })
          ctx.closePath()
          ctx.stroke()
          ctx.fillStyle = `${measurement.color}20`
          ctx.fill()
          
          // Draw area value
          const centerX = transformedPoints.reduce((sum: number, p: any) => sum + p.x, 0) / transformedPoints.length
          const centerY = transformedPoints.reduce((sum: number, p: any) => sum + p.y, 0) / transformedPoints.length
          ctx.fillStyle = '#000'
          ctx.fillRect(centerX - 30, centerY - 10, 60, 20)
          ctx.fillStyle = '#fff'
          ctx.font = '12px Arial'
          ctx.textAlign = 'center'
          ctx.fillText(`${measurement.value?.toFixed(1) || '0'}mm²`, centerX, centerY + 4)
        }
        break
    }
  }

  const drawAnnotation = (ctx: CanvasRenderingContext2D, annotation: any) => {
    ctx.strokeStyle = annotation.color
    ctx.fillStyle = annotation.color
    ctx.lineWidth = 2
    
    switch (annotation.type) {
      case 'text':
        if (annotation.text) {
          const transformedPos = imageToScreenCoordinates(annotation.position.x, annotation.position.y)
          ctx.font = `${annotation.size || 16}px Arial`
          ctx.textAlign = 'left'
          ctx.fillStyle = annotation.color
          ctx.fillText(annotation.text, transformedPos.x, transformedPos.y)
        }
        break
        
      case 'circle':
        const transformedPos = imageToScreenCoordinates(annotation.position.x, annotation.position.y)
        ctx.beginPath()
        ctx.arc(transformedPos.x, transformedPos.y, (annotation.size || 20) * zoom, 0, 2 * Math.PI)
        ctx.stroke()
        break
        
      case 'rectangle':
        if (annotation.size) {
          const transformedPos = imageToScreenCoordinates(annotation.position.x, annotation.position.y)
          const scaledSize = annotation.size * zoom
          ctx.strokeRect(transformedPos.x - scaledSize / 2, transformedPos.y - scaledSize / 2, scaledSize, scaledSize)
        }
        break
    }
  }

  const imageToScreenCoordinates = (imageX: number, imageY: number) => {
    // Apply rotation around center
    const centerX = (canvasRef.current?.width || 0) / 2
    const centerY = (canvasRef.current?.height || 0) / 2
    
    const cos = Math.cos((rotation * Math.PI) / 180)
    const sin = Math.sin((rotation * Math.PI) / 180)
    
    // Rotate around center
    const rotatedX = (imageX - centerX) * cos - (imageY - centerY) * sin + centerX
    const rotatedY = (imageX - centerX) * sin + (imageY - centerY) * cos + centerY
    
    // Apply zoom scaling
    const scaledX = rotatedX * zoom
    const scaledY = rotatedY * zoom
    
    // Apply pan offset
    const finalX = scaledX + panX
    const finalY = scaledY + panY
    
    return { x: finalX, y: finalY }
  }

  // Update image transform when state changes
  useEffect(() => {
    if (elementRef.current && currentImage?.loaded) {
      const img = elementRef.current.querySelector('img')
      if (img) {
        updateImageTransform(img)
      }
    }
  }, [zoom, rotation, windowCenter, windowWidth, panX, panY, currentImage?.loaded])

  // Redraw canvas when measurements or annotations change
  useEffect(() => {
    setTimeout(() => {
      redrawCanvas()
    }, 50)
  }, [measurements, annotations, showMeasurements, showAnnotations])

  // Initialize canvas when currentImage changes
  useEffect(() => {
    if (currentImage?.loaded && canvasRef.current) {
      setTimeout(() => {
        if (canvasRef.current && elementRef.current) {
          const canvas = canvasRef.current
          const container = elementRef.current
          const rect = container.getBoundingClientRect()
          canvas.width = rect.width
          canvas.height = rect.height
          redrawCanvas()
        }
      }, 100)
    }
  }, [currentImage?.loaded])

  // Handle canvas dimensions and window resize
  useEffect(() => {
    const updateCanvasDimensions = () => {
      if (elementRef.current && canvasRef.current) {
        const container = elementRef.current
        const canvas = canvasRef.current
        const rect = container.getBoundingClientRect()
        
        canvas.width = rect.width
        canvas.height = rect.height
        
        redrawCanvas()
      }
    }

    updateCanvasDimensions()
    window.addEventListener('resize', updateCanvasDimensions)
    
    return () => window.removeEventListener('resize', updateCanvasDimensions)
  }, [])

  return (
    <div className="lg:col-span-3">
      <div className="bg-black rounded-lg overflow-hidden relative" style={{ height: '600px' }}>
        {/* DICOM Image Container */}
        <div
          ref={elementRef}
          className="w-full h-full relative"
          style={{ cursor: tool === 'pan' ? 'grab' : 'default' }}
        >
          {currentImage && !currentImage.error && (
            <>
              <img
                src={currentImage.src}
                onLoad={onImageLoad}
                onError={onImageError}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseLeave}
                onWheel={onWheel}
                onDoubleClick={onDoubleClick}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  backgroundColor: '#000',
                  transition: 'transform 0.2s ease'
                }}
                alt="DICOM Image"
              />
              <canvas
                ref={canvasRef}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  zIndex: 10
                }}
              />
            </>
          )}
          
          {currentImage?.error && (
            <div className="flex items-center justify-center h-full text-white">
              <div className="text-center">
                <div className="text-4xl mb-4">🖼️</div>
                <p className="text-lg font-medium">DICOM Image</p>
                <p className="text-sm">Instance loading failed</p>
                <p className="text-xs mt-2 text-gray-400">
                  Image loading failed. Try downloading the study.
                </p>
              </div>
            </div>
          )}
          
          {!currentImage && !isLoading && (
            <div className="flex items-center justify-center h-full text-white">
              <div className="text-center">
                <div className="text-4xl mb-4">🖼️</div>
                <p className="text-lg font-medium">DICOM Image</p>
                <p className="text-sm">Click to load image</p>
              </div>
            </div>
          )}
          
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="text-white">Loading...</div>
            </div>
          )}
        </div>

        {/* Image Navigation Overlay */}
        {instances.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-black bg-opacity-50 rounded-lg px-4 py-2 flex items-center space-x-4">
              <button
                onClick={() => changeInstance('previous')}
                disabled={currentInstanceIndex === 0}
                className="text-white hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <span className="text-white text-sm">
                {currentInstanceIndex + 1} / {instances.length}
              </span>
              <button
                onClick={() => changeInstance('next')}
                disabled={currentInstanceIndex >= instances.length - 1}
                className="text-white hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Zoom Level Indicator */}
        <div className="absolute top-4 right-4">
          <div className="bg-black bg-opacity-50 rounded-lg px-3 py-2">
            <span className="text-white text-sm font-medium">
              {zoom.toFixed(1)}x
            </span>
          </div>
        </div>

        {/* Window/Level Indicator */}
        <div className="absolute top-4 left-4">
          <div className="bg-black bg-opacity-50 rounded-lg px-3 py-2">
            <div className="text-white text-xs">
              <div>W: {Math.round(windowWidth)}</div>
              <div>L: {Math.round(windowCenter)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Information */}
      {instances.length > 0 && instances[currentInstanceIndex] && (
        <div className="mt-4 bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Current Instance</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Instance ID:</span>
              <span className="ml-2 font-mono">{instances[currentInstanceIndex].ID}</span>
            </div>
            <div>
              <span className="text-gray-600">Instance Number:</span>
              <span className="ml-2">{instances[currentInstanceIndex].MainDicomTags.InstanceNumber || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-600">File Size:</span>
              <span className="ml-2">{formatFileSize(instances[currentInstanceIndex].FileSize)}</span>
            </div>
            <div>
              <span className="text-gray-600">Type:</span>
              <span className="ml-2">{instances[currentInstanceIndex].Type}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export default DicomImage
