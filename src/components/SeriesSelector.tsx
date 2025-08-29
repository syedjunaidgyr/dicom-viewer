'use client'

import React, { useState, useEffect } from 'react'
import { Layers, Image, Calendar, Activity, Eye } from 'lucide-react'
import { Series } from '../types/dicom'

interface SeriesSelectorProps {
  series: Series[]
  currentSeriesId: string | null
  onSeriesSelect: (seriesId: string) => void
  onSeriesThumbnailLoad: (seriesId: string, thumbnailUrl: string) => void
}

const SeriesSelector: React.FC<SeriesSelectorProps> = ({
  series,
  currentSeriesId,
  onSeriesSelect,
  onSeriesThumbnailLoad
}) => {
  const [seriesThumbnails, setSeriesThumbnails] = useState<Record<string, string>>({})
  const [loadingThumbnails, setLoadingThumbnails] = useState<Record<string, boolean>>({})
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null)

  useEffect(() => {
    // Load thumbnails for all series
    console.log('SeriesSelector useEffect triggered with series:', series)
    series.forEach(seriesItem => {
      console.log(`Processing series item:`, seriesItem)
      console.log(`Series ID: ${seriesItem.ID}, type: ${typeof seriesItem.ID}`)
      if (!seriesThumbnails[seriesItem.ID] && !loadingThumbnails[seriesItem.ID]) {
        loadSeriesThumbnail(seriesItem.ID)
      }
    })
  }, [series])

  // Clear selected series when currentSeriesId changes
  useEffect(() => {
    if (currentSeriesId && selectedSeriesId !== currentSeriesId) {
      setSelectedSeriesId(null)
    }
  }, [currentSeriesId, selectedSeriesId])

    const loadSeriesThumbnail = async (seriesId: string) => {
    if (loadingThumbnails[seriesId]) return

    setLoadingThumbnails(prev => ({ ...prev, [seriesId]: true }))

    try {
      console.log(`Loading thumbnail for series: ${seriesId}, type: ${typeof seriesId}`)
      if (typeof seriesId !== 'string') {
        console.error(`Invalid seriesId: ${seriesId}, expected string but got ${typeof seriesId}`)
        setLoadingThumbnails(prev => ({ ...prev, [seriesId]: false }))
        return
      }
      
      // Get the first instance of the series to use as thumbnail
      const seriesResponse = await fetch(`http://localhost:8080/orthanc/series/${seriesId}`)
      if (seriesResponse.ok) {
        const seriesData = await seriesResponse.json()
        console.log(`Series data for ${seriesId}:`, seriesData)
        
        // Check if Instances is an array of strings (IDs) or objects
        let firstInstanceId = null
        if (seriesData.Instances && seriesData.Instances.length > 0) {
          if (typeof seriesData.Instances[0] === 'string') {
            firstInstanceId = seriesData.Instances[0]
          } else if (seriesData.Instances[0].ID) {
            firstInstanceId = seriesData.Instances[0].ID
          }
        }
        
        if (firstInstanceId) {
          console.log(`Using instance ${firstInstanceId} for preview of series ${seriesId}`)
          // Since there's no thumbnail API, use preview directly
          const previewUrl = `http://localhost:8080/orthanc/instances/${firstInstanceId}/preview`
          
          // Test if preview loads successfully
          const img = new window.Image()
          img.onload = () => {
            console.log(`Preview loaded successfully for series ${seriesId}`)
            setSeriesThumbnails(prev => ({ ...prev, [seriesId]: previewUrl }))
            onSeriesThumbnailLoad(seriesId, previewUrl)
            setLoadingThumbnails(prev => ({ ...prev, [seriesId]: false }))
          }
          img.onerror = () => {
            console.log(`Preview failed for series ${seriesId}`)
            setLoadingThumbnails(prev => ({ ...prev, [seriesId]: false }))
          }
          img.src = previewUrl
        } else {
          console.warn(`No instances found for series ${seriesId}`)
          setLoadingThumbnails(prev => ({ ...prev, [seriesId]: false }))
        }
      } else {
        console.warn(`Failed to fetch series ${seriesId}:`, seriesResponse.status)
        setLoadingThumbnails(prev => ({ ...prev, [seriesId]: false }))
      }
    } catch (error) {
      console.error(`Failed to load thumbnail for series ${seriesId}:`, error)
      setLoadingThumbnails(prev => ({ ...prev, [seriesId]: false }))
    }
  }

  const formatSeriesNumber = (seriesNumber?: string) => {
    if (!seriesNumber) return 'Unknown'
    return `Series ${seriesNumber}`
  }

  const formatSeriesDate = (dateString?: string) => {
    if (!dateString || typeof dateString !== 'string') return 'Unknown'
    try {
      if (dateString.length < 8) return dateString
      const year = dateString.substring(0, 4)
      const month = dateString.substring(4, 6)
      const day = dateString.substring(6, 8)
      return `${month}/${day}/${year}`
    } catch {
      return dateString
    }
  }

  if (series.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <Layers className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Series Available</h3>
        <p className="text-gray-500">This study doesn't contain any image series.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
          {series.length} Series Available
        </span>
      </div>
      
      <div className="space-y-2">
        {series
          .filter(seriesItem => typeof seriesItem.ID === 'string')
          .map((seriesItem) => {
            const isSelected = currentSeriesId === seriesItem.ID
            const thumbnail = seriesThumbnails[seriesItem.ID]
            const isLoading = loadingThumbnails[seriesItem.ID]
            
            return (
              <div
                key={seriesItem.ID}
                className={`relative p-2 rounded-md border cursor-pointer transition-all duration-150 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => {
                  setSelectedSeriesId(seriesItem.ID)
                  onSeriesSelect(seriesItem.ID)
                }}
              >
                <div className="flex items-center space-x-2">
                  {/* Compact Thumbnail */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-sm overflow-hidden bg-gray-100 border border-gray-200">
                      {isLoading ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        </div>
                      ) : thumbnail ? (
                        <img
                          src={thumbnail}
                          alt={`Series ${seriesItem.MainDicomTags?.SeriesNumber || 'Unknown'}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <Image className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Compact Series Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs font-medium text-gray-900 truncate">
                        Series {seriesItem.MainDicomTags?.SeriesNumber || 'N/A'}
                      </h4>
                      <span className="text-xs text-gray-500">
                        {seriesItem.Instances?.length || 0}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-600 truncate">
                      {seriesItem.MainDicomTags?.SeriesDescription || 'No description'}
                    </p>
                    
                    <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                      <span className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">
                        {seriesItem.MainDicomTags?.Modality || 'N/A'}
                      </span>
                      {seriesItem.MainDicomTags?.SeriesDate && (
                        <span className="text-gray-400">
                          {seriesItem.MainDicomTags.SeriesDate}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="flex-shrink-0">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}

export default SeriesSelector
