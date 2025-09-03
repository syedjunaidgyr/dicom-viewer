'use client'

import React, { useEffect, useRef, useState } from 'react'

interface CornerstoneViewerProps {
  studyId: string
  mode: 'basic' | 'segmentation' | 'annotations' | 'metabolic' | 'microscopy' | 'preclinical'
  onViewerReady?: () => void
}

interface SeriesData {
  ID: string
  instances: string[]
  MainDicomTags?: {
    SeriesDescription?: string
    Modality?: string
  }
}

export default function CornerstoneViewer({ 
  studyId, 
  mode, 
  onViewerReady 
}: CornerstoneViewerProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [seriesData, setSeriesData] = useState<SeriesData[]>([])
  const [currentImage, setCurrentImage] = useState<string | null>(null)

  useEffect(() => {
    if (!elementRef.current) return

    const initializeViewer = async () => {
      try {
        // Load study data
        await loadStudyData(studyId)
        
        // Set up viewer based on mode
        setupViewerForMode(mode)

        setIsLoading(false)
        onViewerReady?.()

      } catch (err) {
        console.error('Failed to initialize viewer:', err)
        setError('Failed to initialize viewer')
        setIsLoading(false)
      }
    }

    initializeViewer()
  }, [studyId, mode, onViewerReady])

  const loadStudyData = async (studyId: string) => {
    try {
      // Fetch study series
      const seriesResponse = await fetch(`http://localhost:8080/orthanc/studies/${studyId}/series`)
      if (!seriesResponse.ok) {
        throw new Error('Failed to fetch series')
      }

      const seriesIds = await seriesResponse.json()
      
      // Fetch series details and instances
      const seriesPromises = seriesIds.map(async (seriesId: string) => {
        const seriesResponse = await fetch(`http://localhost:8080/orthanc/series/${seriesId}`)
        if (seriesResponse.ok) {
          const series = await seriesResponse.json()
          
          // Fetch instances for this series
          const instancesResponse = await fetch(`http://localhost:8080/orthanc/series/${seriesId}/instances`)
          if (instancesResponse.ok) {
            const instanceIds = await instancesResponse.json()
            series.instances = instanceIds
          }
          
          return series
        }
        return null
      })

      const seriesDetails = await Promise.all(seriesPromises)
      const validSeries = seriesDetails.filter(series => series !== null)
      setSeriesData(validSeries)

      // Load first series into viewer
      if (validSeries.length > 0) {
        await loadSeriesIntoViewer(validSeries[0])
      }

    } catch (err) {
      console.error('Failed to load study data:', err)
      setError('Failed to load study data')
    }
  }

  const loadSeriesIntoViewer = async (series: SeriesData) => {
    if (!series.instances || series.instances.length === 0) return

    try {
      // Load first instance
      const instanceId = series.instances[0]
      const imageUrl = `http://localhost:8080/orthanc/instances/${instanceId}/file`
      setCurrentImage(imageUrl)
    } catch (err) {
      console.error('Failed to load series:', err)
    }
  }

  const setupViewerForMode = (mode: string) => {
    // This would be where we'd set up Cornerstone tools based on mode
    // For now, we'll just log the mode
    console.log(`Setting up viewer for mode: ${mode}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading DICOM viewer...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100">
        <div className="text-center text-red-600">
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <div className="mb-4 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Viewer Mode: {mode.charAt(0).toUpperCase() + mode.slice(1)}</h3>
        <p className="text-sm text-gray-600">
          {mode === 'basic' && 'Basic DICOM viewer with pan, zoom, and window/level controls'}
          {mode === 'segmentation' && 'Segmentation tools for CT and MR studies'}
          {mode === 'annotations' && 'Annotation tools for ultrasound studies'}
          {mode === 'metabolic' && 'Metabolic analysis tools for PET/CT studies'}
          {mode === 'microscopy' && 'Microscopy tools for high-resolution images'}
          {mode === 'preclinical' && 'Preclinical tools for research studies'}
        </p>
      </div>
      
      <div 
        ref={elementRef}
        className="w-full h-96 bg-black rounded-lg overflow-hidden flex items-center justify-center"
        style={{ minHeight: '400px' }}
      >
        {currentImage ? (
          <img 
            src={currentImage} 
            alt="DICOM Image" 
            className="max-w-full max-h-full object-contain"
            onError={() => setError('Failed to load DICOM image')}
          />
        ) : (
          <div className="text-white text-center">
            <p>No image loaded</p>
            <p className="text-sm text-gray-400">Select a series to view</p>
          </div>
        )}
      </div>
      
      {seriesData.length > 0 && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <h4 className="font-semibold mb-2">Series Information</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Total Series:</span>
              <span className="ml-2">{seriesData.length}</span>
            </div>
            <div>
              <span className="font-medium">Total Instances:</span>
              <span className="ml-2">
                {seriesData.reduce((total, series) => total + (series.instances?.length || 0), 0)}
              </span>
            </div>
            <div>
              <span className="font-medium">Current Series:</span>
              <span className="ml-2">1</span>
            </div>
            <div>
              <span className="font-medium">Current Instance:</span>
              <span className="ml-2">1</span>
            </div>
          </div>
          
          {/* Series Navigation */}
          <div className="mt-4">
            <h5 className="font-medium mb-2">Series Navigation</h5>
            <div className="flex flex-wrap gap-2">
              {seriesData.map((series, index) => (
                <button
                  key={series.ID}
                  onClick={() => loadSeriesIntoViewer(series)}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Series {index + 1} ({series.instances?.length || 0} instances)
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
