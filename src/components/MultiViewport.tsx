'use client'

import React from 'react'
import { LayoutType } from './LayoutManager'

interface ViewportProps {
  id: string
  currentImage: any
  isLoading: boolean
  zoom: number
  rotation: number
  windowCenter: number
  windowWidth: number
  panX: number
  panY: number
  tool?: string // Make tool optional with default value
  measurements: any[]
  annotations: any[]
  drawingPoints: { x: number; y: number }[]
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
  onContextMenu: (e: React.MouseEvent) => void
}

interface MultiViewportProps {
  layout: LayoutType
  viewports: ViewportProps[]
  onViewportChange: (viewportId: string, changes: Partial<ViewportProps>) => void
}

const MultiViewport: React.FC<MultiViewportProps> = ({
  layout,
  viewports,
  onViewportChange
}) => {
  // Ref to store viewport refs for proper event handling
  const viewportRefs = React.useRef<{ [key: string]: HTMLDivElement | null }>({})
  // State for mouse position tracking during drawing
  const [mousePosition, setMousePosition] = React.useState<{ x: number; y: number } | null>(null)
  // Debug viewport state changes
  React.useEffect(() => {
    viewports.forEach(viewport => {
      console.log(`Viewport ${viewport.id} state:`, {
        currentImage: viewport.currentImage,
        isLoading: viewport.isLoading,
        hasImage: !!viewport.currentImage,
        imageSrc: viewport.currentImage?.src
      })
    })
  }, [viewports.map(v => [v.currentImage, v.isLoading])])

  // Redraw canvas when measurements, annotations, or mouse position changes
  React.useEffect(() => {
    viewports.forEach(viewport => {
      const canvas = document.querySelector(`canvas[data-viewport="${viewport.id}"]`) as HTMLCanvasElement
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          redrawCanvas(ctx, viewport)
        }
      }
    })
  }, [viewports.map(v => [v.measurements, v.annotations, v.showMeasurements, v.showAnnotations]), mousePosition])

  // Handle canvas resizing
  React.useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      viewports.forEach(viewport => {
        const canvas = document.querySelector(`canvas[data-viewport="${viewport.id}"]`) as HTMLCanvasElement
        if (canvas) {
          canvas.width = canvas.offsetWidth
          canvas.height = canvas.offsetHeight
          const ctx = canvas.getContext('2d')
          if (ctx) {
            redrawCanvas(ctx, viewport)
          }
        }
      })
    })

    // Observe all viewport containers
    viewports.forEach(viewport => {
      const canvas = document.querySelector(`canvas[data-viewport="${viewport.id}"]`) as HTMLCanvasElement
      if (canvas) {
        resizeObserver.observe(canvas.parentElement!)
      }
    })

    return () => resizeObserver.disconnect()
  }, [viewports])

  // Handle wheel events with proper passive options
  React.useEffect(() => {
    const cleanupFunctions: (() => void)[] = []
    
    viewports.forEach(viewport => {
      const viewportElement = viewportRefs.current[viewport.id]
      if (viewportElement && viewport.onWheel) {
        const handleWheel = (e: WheelEvent) => {
          // Only prevent default if we're actually handling the wheel event
          if (viewport.tool && viewport.tool === 'zoom') {
            e.preventDefault()
            viewport.onWheel(e as any) // Cast to React.WheelEvent
          }
        }

        // Add wheel event listener with non-passive option
        viewportElement.addEventListener('wheel', handleWheel, { passive: false })
        
        cleanupFunctions.push(() => {
          viewportElement.removeEventListener('wheel', handleWheel)
        })
      }
    })
    
    return () => {
      cleanupFunctions.forEach(cleanup => cleanup())
    }
  }, [viewports])
  const redrawCanvas = (ctx: CanvasRenderingContext2D, viewport: ViewportProps) => {
    // Clear canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    
    if (viewport.showMeasurements) {
      viewport.measurements.forEach(measurement => {
        drawMeasurement(ctx, measurement, viewport)
      })
    }
    
    if (viewport.showAnnotations) {
      viewport.annotations.forEach(annotation => {
        drawAnnotation(ctx, annotation, viewport)
      })
    }
    
    // Draw current drawing path in real-time
    if (viewport.drawingPoints && viewport.drawingPoints.length > 0) {
      drawDrawingPath(ctx, viewport.drawingPoints, viewport)
    }
  }

  const drawMeasurement = (ctx: CanvasRenderingContext2D, measurement: any, viewport: ViewportProps) => {
    ctx.strokeStyle = measurement.color
    ctx.fillStyle = measurement.color
    ctx.lineWidth = 2
    
    switch (measurement.type) {
      case 'distance':
        if (measurement.points.length >= 2) {
          const [p1, p2] = measurement.points
          const transformedP1 = imageToScreenCoordinates(p1.x, p1.y, viewport)
          const transformedP2 = imageToScreenCoordinates(p2.x, p2.y, viewport)
          
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
          const transformedP1 = imageToScreenCoordinates(p1.x, p1.y, viewport)
          const transformedP2 = imageToScreenCoordinates(p2.x, p2.y, viewport)
          const transformedP3 = imageToScreenCoordinates(p3.x, p3.y, viewport)
          
          // Draw the two lines forming the angle
          ctx.beginPath()
          ctx.moveTo(transformedP1.x, transformedP1.y)
          ctx.lineTo(transformedP2.x, transformedP2.y)
          ctx.lineTo(transformedP3.x, transformedP3.y)
          ctx.stroke()
          
          // Draw angle arc
          const radius = 30
          ctx.beginPath()
          ctx.arc(transformedP2.x, transformedP2.y, radius, 0, 2 * Math.PI)
          ctx.stroke()
          
          // Draw measurement label
          ctx.fillStyle = '#000'
          ctx.fillRect(transformedP2.x - 25, transformedP2.y - 15, 50, 30)
          ctx.fillStyle = '#fff'
          ctx.font = '12px Arial'
          ctx.textAlign = 'center'
          ctx.fillText(`${measurement.value?.toFixed(1) || '0'}°`, transformedP2.x, transformedP2.y + 4)
        }
        break
        
      case 'area':
        if (measurement.points.length >= 3) {
          // Draw the polygon
          ctx.beginPath()
          const firstPoint = imageToScreenCoordinates(measurement.points[0].x, measurement.points[0].y, viewport)
          ctx.moveTo(firstPoint.x, firstPoint.y)
          
          for (let i = 1; i < measurement.points.length; i++) {
            const point = imageToScreenCoordinates(measurement.points[i].x, measurement.points[i].y, viewport)
            ctx.lineTo(point.x, point.y)
          }
          
          ctx.closePath()
          ctx.stroke()
          
          // Fill with semi-transparent color
          ctx.fillStyle = measurement.color + '40' // Add transparency
          ctx.fill()
          
          // Draw measurement label at center of polygon
          const centerX = measurement.points.reduce((sum: number, p: any) => sum + p.x, 0) / measurement.points.length
          const centerY = measurement.points.reduce((sum: number, p: any) => sum + p.y, 0) / measurement.points.length
          const transformedCenter = imageToScreenCoordinates(centerX, centerY, viewport)
          
          ctx.fillStyle = '#000'
          ctx.fillRect(transformedCenter.x - 30, transformedCenter.y - 15, 60, 30)
          ctx.fillStyle = '#fff'
          ctx.font = '12px Arial'
          ctx.textAlign = 'center'
          ctx.fillText(`${measurement.value?.toFixed(1) || '0'}mm²`, transformedCenter.x, transformedCenter.y + 4)
        }
        break
        
      case 'ellipse':
        if (measurement.points.length >= 2) {
          const [p1, p2] = measurement.points
          const transformedP1 = imageToScreenCoordinates(p1.x, p1.y, viewport)
          const transformedP2 = imageToScreenCoordinates(p2.x, p2.y, viewport)
          
          // Calculate ellipse parameters
          const centerX = (transformedP1.x + transformedP2.x) / 2
          const centerY = (transformedP1.y + transformedP2.y) / 2
          const radiusX = Math.abs(transformedP2.x - transformedP1.x) / 2
          const radiusY = Math.abs(transformedP2.y - transformedP1.y) / 2
          
          // Draw ellipse
          ctx.beginPath()
          ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI)
          ctx.stroke()
          
          // Fill with semi-transparent color
          ctx.fillStyle = measurement.color + '40'
          ctx.fill()
          
          // Draw measurement label
          ctx.fillStyle = '#000'
          ctx.fillRect(centerX - 30, centerY - 15, 60, 30)
          ctx.fillStyle = '#fff'
          ctx.font = '12px Arial'
          ctx.textAlign = 'center'
          ctx.fillText(`${measurement.value?.toFixed(1) || '0'}mm²`, centerX, centerY + 4)
        }
        break
        
      case 'roi':
        if (measurement.points.length >= 3) {
          // Draw the polygon
          ctx.beginPath()
          const firstPoint = imageToScreenCoordinates(measurement.points[0].x, measurement.points[0].y, viewport)
          ctx.moveTo(firstPoint.x, firstPoint.y)
          
          for (let i = 1; i < measurement.points.length; i++) {
            const point = imageToScreenCoordinates(measurement.points[i].x, measurement.points[i].y, viewport)
            ctx.lineTo(point.x, point.y)
          }
          
          ctx.closePath()
          ctx.stroke()
          
          // Fill with semi-transparent color
          ctx.fillStyle = measurement.color + '40' // Add transparency
          ctx.fill()
          
          // Draw measurement label at center of polygon
          const roiCenterX = measurement.points.reduce((sum: number, p: any) => sum + p.x, 0) / measurement.points.length
          const roiCenterY = measurement.points.reduce((sum: number, p: any) => sum + p.y, 0) / measurement.points.length
          const transformedRoiCenter = imageToScreenCoordinates(roiCenterX, roiCenterY, viewport)
          
          ctx.fillStyle = '#000'
          ctx.fillRect(transformedRoiCenter.x - 30, transformedRoiCenter.y - 15, 60, 30)
          ctx.fillStyle = '#fff'
          ctx.font = '12px Arial'
          ctx.textAlign = 'center'
          ctx.fillText(`${measurement.value?.toFixed(1) || '0'}mm²`, transformedRoiCenter.x, transformedRoiCenter.y + 4)
        }
        break
        
      default:
        console.warn(`Unknown measurement type: ${measurement.type}`)
        break
    }
  }

  const drawAnnotation = (ctx: CanvasRenderingContext2D, annotation: any, viewport: ViewportProps) => {
    ctx.strokeStyle = annotation.color
    ctx.fillStyle = annotation.color
    ctx.lineWidth = 2
    
    switch (annotation.type) {
      case 'text':
        if (annotation.text) {
          const transformedPos = imageToScreenCoordinates(annotation.position.x, annotation.position.y, viewport)
          ctx.font = `${annotation.size || 16}px Arial`
          ctx.textAlign = 'left'
          ctx.fillStyle = annotation.color
          ctx.fillText(annotation.text, transformedPos.x, transformedPos.y)
        }
        break
        
      case 'circle':
        const transformedPos = imageToScreenCoordinates(annotation.position.x, annotation.position.y, viewport)
        ctx.beginPath()
        ctx.arc(transformedPos.x, transformedPos.y, (annotation.size || 20) * viewport.zoom, 0, 2 * Math.PI)
        ctx.stroke()
        break
        
      case 'rectangle':
        if (annotation.size) {
          const transformedPos = imageToScreenCoordinates(annotation.position.x, annotation.position.y, viewport)
          const scaledSize = annotation.size * viewport.zoom
          ctx.strokeRect(transformedPos.x - scaledSize / 2, transformedPos.y - scaledSize / 2, scaledSize, scaledSize)
        }
        break
    }
  }

  const drawDrawingPath = (ctx: CanvasRenderingContext2D, drawingPoints: { x: number; y: number }[], viewport: ViewportProps) => {
    if (drawingPoints.length === 0) return
    
    // Get the current tool color from the viewport
    const currentColor = viewport.tool === 'distance' || viewport.tool === 'angle' || viewport.tool === 'area' || viewport.tool === 'roi' 
      ? '#00ff00' // Default measurement color
      : '#ff0000' // Default annotation color
    
    ctx.strokeStyle = currentColor
    ctx.fillStyle = currentColor
    ctx.lineWidth = 2
    
    // Draw the path connecting all points
    if (drawingPoints.length > 1) {
      ctx.beginPath()
      const firstPoint = imageToScreenCoordinates(drawingPoints[0].x, drawingPoints[0].y, viewport)
      ctx.moveTo(firstPoint.x, firstPoint.y)
      
      for (let i = 1; i < drawingPoints.length; i++) {
        const point = imageToScreenCoordinates(drawingPoints[i].x, drawingPoints[i].y, viewport)
        ctx.lineTo(point.x, point.y)
      }
      ctx.stroke()
    }
    
    // Draw points as circles
    drawingPoints.forEach((point, index) => {
      const transformedPoint = imageToScreenCoordinates(point.x, point.y, viewport)
      
      // Draw point circle
      ctx.beginPath()
      ctx.arc(transformedPoint.x, transformedPoint.y, 4, 0, 2 * Math.PI)
      ctx.fill()
      
      // Draw point number
      ctx.fillStyle = '#000'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'
      ctx.fillText((index + 1).toString(), transformedPoint.x, transformedPoint.y + 4)
      ctx.fillStyle = currentColor
    })
    
    // Draw preview line for next point (if applicable)
    if (drawingPoints.length > 0 && mousePosition) {
      const isMeasurementTool = viewport.tool === 'distance' || viewport.tool === 'angle' || viewport.tool === 'area' || viewport.tool === 'roi'
      
      if (isMeasurementTool) {
        // Show preview line from last point to current mouse position
        ctx.setLineDash([5, 5]) // Dashed line for preview
        ctx.strokeStyle = currentColor + '80' // Semi-transparent
        ctx.lineWidth = 2
        
        const lastPoint = imageToScreenCoordinates(drawingPoints[drawingPoints.length - 1].x, drawingPoints[drawingPoints.length - 1].y, viewport)
        
        ctx.beginPath()
        ctx.moveTo(lastPoint.x, lastPoint.y)
        ctx.lineTo(mousePosition.x, mousePosition.y)
        ctx.stroke()
        
        // Reset line style
        ctx.setLineDash([])
        ctx.strokeStyle = currentColor
        ctx.lineWidth = 2
      }
    }
  }

  const imageToScreenCoordinates = (imageX: number, imageY: number, viewport: ViewportProps) => {
    // Apply rotation around center
    const centerX = 300 // Approximate center
    const centerY = 300
    
    const cos = Math.cos((viewport.rotation * Math.PI) / 180)
    const sin = Math.sin((viewport.rotation * Math.PI) / 180)
    
    // Rotate around center
    const rotatedX = (imageX - centerX) * cos - (imageY - centerY) * sin + centerX
    const rotatedY = (imageX - centerX) * sin + (imageY - centerY) * cos + centerY
    
    // Apply zoom scaling
    const scaledX = rotatedX * viewport.zoom
    const scaledY = rotatedY * viewport.zoom
    
    // Apply pan offset
    const finalX = scaledX + viewport.panX
    const finalY = scaledY + viewport.panY
    
    return { x: finalX, y: finalY }
  }
  const getLayoutConfig = (layout: LayoutType) => {
    switch (layout) {
      case '1x1':
        return { cols: 1, rows: 1, className: 'grid-cols-1' }
      case '1x2':
        return { cols: 2, rows: 1, className: 'grid-cols-2' }
      case '2x2':
        return { cols: 2, rows: 2, className: 'grid-cols-2 grid-rows-2' }
      case '2x3':
        return { cols: 3, rows: 2, className: 'grid-cols-3 grid-rows-2' }
      case '3x3':
        return { cols: 3, rows: 3, className: 'grid-cols-3 grid-rows-3' }
      default:
        return { cols: 1, rows: 1, className: 'grid-cols-1' }
    }
  }

  const { className } = getLayoutConfig(layout)

  const renderViewport = (viewport: ViewportProps) => {
    return (
      <div
        key={`${viewport.id}-${viewport.currentImage?.src || 'no-image'}`}
        className="bg-black rounded-lg overflow-hidden relative border border-gray-600"
        style={{ minHeight: '300px' }}
      >
        {/* Viewport Header */}
        <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 z-20">
          <div className="flex items-center justify-between">
            <span>Viewport {viewport.id}</span>
            <div className="flex items-center space-x-2">
              <span>Z: {viewport.zoom.toFixed(1)}x</span>
              <span>R: {viewport.rotation}°</span>
              <span>W: {Math.round(viewport.windowWidth)}</span>
              <span>L: {Math.round(viewport.windowCenter)}</span>
            </div>
          </div>
        </div>

        {/* DICOM Image Container */}
                <div 
          className="w-full h-full relative"
          ref={(el) => {
            viewportRefs.current[viewport.id] = el
          }}
        >
          {/* Always render the img element when currentImage exists, regardless of loading state */}
          {(() => {
            console.log(`Rendering img element for viewport ${viewport.id}:`, {
              hasCurrentImage: !!viewport.currentImage,
              currentImageSrc: viewport.currentImage?.src,
              currentImageError: viewport.currentImage?.error
            })
            return null
          })()}
          {viewport.currentImage && !viewport.currentImage.error && (
            <img
              key={`${viewport.id}-${viewport.currentImage.src}`} // Force re-render when src changes
              src={viewport.currentImage.src}
              onLoad={() => {
                console.log(`Image loaded successfully: ${viewport.currentImage.src}`)
                viewport.onImageLoad()
              }}
              onError={(e) => {
                console.error(`Image failed to load: ${viewport.currentImage.src}`, e)
                viewport.onImageError()
              }}
              onLoadStart={() => {
                console.log(`Image load started: ${viewport.currentImage.src}`)
              }}
              onMouseDown={viewport.onMouseDown || undefined}
              onMouseMove={(e) => {
                // Track mouse position for drawing preview
                const rect = e.currentTarget.getBoundingClientRect()
                const x = e.clientX - rect.left
                const y = e.clientY - rect.top
                setMousePosition({ x, y })
                
                // Call original onMouseMove if it exists
                if (viewport.onMouseMove) {
                  viewport.onMouseMove(e)
                }
              }}
              onMouseUp={viewport.onMouseUp || undefined}
              onMouseLeave={() => {
                setMousePosition(null)
                if (viewport.onMouseLeave) {
                  viewport.onMouseLeave()
                }
              }}
              onDoubleClick={viewport.onDoubleClick || undefined}
              onContextMenu={viewport.onContextMenu || undefined}
                              style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  backgroundColor: '#000',
                  border: '2px solid red', // Debug: Add red border to see if img is rendered
                  transform: `translate(${viewport.panX}px, ${viewport.panY}px) scale(${viewport.zoom}) rotate(${viewport.rotation}deg)`,
                  filter: `contrast(${viewport.windowWidth / 256}) brightness(${viewport.windowCenter / 128})`,
                  transition: 'transform 0.2s ease'
                }}
              alt="DICOM Image"
            />
          )}
          
          {/* Canvas Overlay for Measurements and Annotations - only when image is loaded */}
          {viewport.currentImage && !viewport.currentImage.error && viewport.currentImage.loaded && (
            <canvas
              data-viewport={viewport.id}
              ref={(canvasRef) => {
                if (canvasRef) {
                  const ctx = canvasRef.getContext('2d')
                  if (ctx) {
                    canvasRef.width = canvasRef.offsetWidth
                    canvasRef.height = canvasRef.offsetHeight
                    redrawCanvas(ctx, viewport)
                  }
                }
              }}
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
              style={{
                transform: `translate(${viewport.panX}px, ${viewport.panY}px) scale(${viewport.zoom}) rotate(${viewport.rotation}deg)`
              }}
            />
          )}
          
          {viewport.currentImage?.error && (
            <div className="flex items-center justify-center h-full text-white">
              <div className="text-center">
                <div className="text-2xl mb-2">❌</div>
                <p className="text-sm">Image Unavailable</p>
                <p className="text-xs text-gray-400 mt-1">This DICOM image could not be loaded</p>
                <p className="text-xs text-gray-400">The preview/thumbnail may not be generated</p>
              </div>
            </div>
          )}
          
          {!viewport.currentImage && !viewport.isLoading && (
            <div className="flex items-center justify-center h-full text-white">
              <div className="text-center">
                <div className="text-2xl mb-2">📋</div>
                <p className="text-sm">No Image</p>
              </div>
            </div>
          )}
          
          {viewport.isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
                              <div className="text-center text-white">
                  <div className="text-2xl mb-2 animate-spin">🔄</div>
                  <p className="text-sm">Loading Image...</p>
                  {viewport.currentImage?.src && (
                    <p className="text-xs text-gray-300 mt-1 break-all max-w-xs">
                      {viewport.currentImage.src.split('/').pop()}
                    </p>
                  )}
                  <div className="mt-2">
                    <div className="w-32 h-1 bg-gray-600 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full animate-pulse"></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {viewport.currentImage?.src?.includes('quality=50') ? 'Loading optimized version...' : 'Loading full quality...'}
                    </p>
                  </div>
                </div>
            </div>
          )}
        </div>

                  {/* Viewport Controls */}
          <div className="absolute bottom-2 right-2 flex space-x-1">
            <button
              onClick={() => onViewportChange(viewport.id, { zoom: 1, rotation: 0, panX: 0, panY: 0 })}
              className="p-1 bg-black bg-opacity-75 text-white text-xs rounded hover:bg-opacity-90"
              title="Reset Viewport"
            >
              ↺
            </button>
          </div>
          
          {/* Drawing Status Indicator */}
          {viewport.drawingPoints && viewport.drawingPoints.length > 0 && (
            <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>
                  {viewport.tool === 'distance' && viewport.drawingPoints.length === 1 && 'Click to complete distance'}
                  {viewport.tool === 'angle' && viewport.drawingPoints.length < 3 && `Click point ${viewport.drawingPoints.length + 1} of 3`}
                  {viewport.tool === 'area' && viewport.drawingPoints.length < 3 && `Click point ${viewport.drawingPoints.length + 1} (min 3)`}
                  {viewport.tool === 'roi' && viewport.drawingPoints.length < 3 && `Click point ${viewport.drawingPoints.length + 1} (min 3)`}
                  {viewport.tool === 'ellipse' && viewport.drawingPoints.length === 1 && 'Click to complete ellipse'}
                </span>
              </div>
            </div>
          )}
      </div>
    )
  }

  return (
    <div className={`grid ${className} gap-2 h-full`}>
      {viewports.map(renderViewport)}
    </div>
  )
}

export default MultiViewport
