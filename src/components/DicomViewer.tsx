'use client'

import React, { useEffect, useState, useRef } from 'react'
import StudyHeader from './StudyHeader'
import EnhancedToolbar from './EnhancedToolbar'
import EnhancedSidebar from './EnhancedSidebar'
import MultiViewport from './MultiViewport'
import LayoutManager from './LayoutManager'
import SeriesSelector from './SeriesSelector'
import ReportGenerator from './ReportGenerator'
import { useImageManipulation } from '../hooks/useImageManipulation'
import { Instance, StudyInfo, CurrentImage, Series } from '../types/dicom'
import { FileSpreadsheet, Download, RotateCcw } from 'lucide-react'

interface DicomViewerProps {
  studyId?: string
}

const DicomViewer: React.FC<DicomViewerProps> = ({ studyId }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [studyInfo, setStudyInfo] = useState<StudyInfo | null>(null)
  const [series, setSeries] = useState<Series[]>([])
  const [currentSeriesId, setCurrentSeriesId] = useState<string | null>(null)
  const [instances, setInstances] = useState<Instance[]>([])
  const [currentInstanceIndex, setCurrentInstanceIndex] = useState(0)
  const [imageLoaded, setImageLoaded] = useState(false)

  // State management approach for current image
  const [currentImage, setCurrentImage] = useState<CurrentImage | null>(null)
  
  // Multi-viewport state management
  const [viewports, setViewports] = useState<{
    [key: string]: {
      id: string
      currentImage: CurrentImage | null
      isLoading: boolean
      zoom: number
      rotation: number
      windowCenter: number
      windowWidth: number
      panX: number
      panY: number
      currentInstanceIndex: number
      currentSeriesId: string | null
      // New: Support for multiple series in one viewport
      combinedSeries: {
        seriesId: string
        instanceIndex: number
        opacity: number
        visible: boolean
      }[]
      isCombinedView: boolean
    }
  }>({
    'viewport-1': {
      id: 'viewport-1',
      currentImage: null,
      isLoading: false,
      zoom: 1,
      rotation: 0,
      windowCenter: 128,
      windowWidth: 256,
      panX: 0,
      panY: 0,
      currentInstanceIndex: 0,
      currentSeriesId: null,
      combinedSeries: [],
      isCombinedView: false
    },
          'viewport-2': {
            id: 'viewport-2',
            currentImage: null,
            isLoading: false,
            zoom: 1,
            rotation: 0,
            windowCenter: 128,
            windowWidth: 256,
            panX: 0,
            panY: 0,
            currentInstanceIndex: 0,
            currentSeriesId: null,
            combinedSeries: [],
            isCombinedView: false
          },
          'viewport-3': {
            id: 'viewport-3',
            currentImage: null,
            isLoading: false,
            zoom: 1,
            rotation: 0,
            windowCenter: 128,
            windowWidth: 256,
            panX: 0,
            panY: 0,
            currentInstanceIndex: 0,
            currentSeriesId: null,
            combinedSeries: [],
            isCombinedView: false
          },
    'viewport-4': {
      id: 'viewport-4',
      currentImage: null,
      isLoading: false,
      zoom: 1,
      rotation: 0,
      windowCenter: 128,
      windowWidth: 256,
      panX: 0,
      panY: 0,
      currentInstanceIndex: 0,
      currentSeriesId: null,
      combinedSeries: [],
      isCombinedView: false
    },
    'viewport-5': {
      id: 'viewport-5',
      currentImage: null,
      isLoading: false,
      zoom: 1,
      rotation: 0,
      windowCenter: 128,
      windowWidth: 256,
      panX: 0,
      panY: 0,
      currentInstanceIndex: 0,
      currentSeriesId: null,
      combinedSeries: [],
      isCombinedView: false
    },
    'viewport-6': {
      id: 'viewport-6',
      currentImage: null,
      isLoading: false,
      zoom: 1,
      rotation: 0,
      windowCenter: 128,
      windowWidth: 256,
      panX: 0,
      panY: 0,
      currentInstanceIndex: 0,
      currentSeriesId: null,
      combinedSeries: [],
      isCombinedView: false
    },
    'viewport-7': {
      id: 'viewport-7',
      currentImage: null,
      isLoading: false,
      zoom: 1,
      rotation: 0,
      windowCenter: 128,
      windowWidth: 256,
      panX: 0,
      panY: 0,
      currentInstanceIndex: 0,
      currentSeriesId: null,
      combinedSeries: [],
      isCombinedView: false
    },
    'viewport-8': {
      id: 'viewport-8',
      currentImage: null,
      isLoading: false,
      zoom: 1,
      rotation: 0,
      windowCenter: 128,
      windowWidth: 256,
      panX: 0,
      panY: 0,
      currentInstanceIndex: 0,
      currentSeriesId: null,
      combinedSeries: [],
      isCombinedView: false
    },
    'viewport-9': {
      id: 'viewport-9',
      currentImage: null,
      isLoading: false,
      zoom: 1,
      rotation: 0,
      windowCenter: 128,
      windowWidth: 256,
      panX: 0,
      panY: 0,
      currentInstanceIndex: 0,
      currentSeriesId: null,
      combinedSeries: [],
      isCombinedView: false
    }
  })
  
  // Force re-render when needed
  const [forceUpdate, setForceUpdate] = useState(0)

  // Use the custom hook for image manipulation
  const imageManipulation = useImageManipulation()
  
  // Layout management state
  const [currentLayout, setCurrentLayout] = useState<'1x1' | '1x2' | '2x2' | '2x3' | '3x3' | 'custom'>('1x1')

  // Report generation state
  const [showReportGenerator, setShowReportGenerator] = useState(false)

  // Viewport management functions
  const updateViewport = (viewportId: string, updates: Partial<typeof viewports[string]>) => {
    setViewports(prev => ({
      ...prev,
      [viewportId]: { ...prev[viewportId], ...updates }
    }))
  }

  const updateViewportWithCallback = (viewportId: string, updater: (prev: typeof viewports[string]) => Partial<typeof viewports[string]>) => {
    setViewports(prev => ({
      ...prev,
      [viewportId]: { ...prev[viewportId], ...updater(prev[viewportId]) }
    }))
  }

  const loadImageInViewport = async (viewportId: string, instance: Instance) => {
    try {
      console.log(`Loading image in viewport ${viewportId} for instance: ${instance.ID}`)
      
      // Update viewport loading state
      updateViewport(viewportId, { isLoading: true, currentImage: null })
      
      const fastImageUrl = `http://localhost:8080/orthanc/instances/${instance.ID}/preview?quality=50&size=512`
      const fallbackImageUrl = `http://localhost:8080/orthanc/instances/${instance.ID}/preview`
      
      console.log(`Attempting to load fast image in viewport ${viewportId}: ${fastImageUrl}`)
      
      const newImageState = {
        src: fastImageUrl,
        loaded: false,
        error: false
      }
      
      updateViewport(viewportId, { currentImage: newImageState })
      
      // Set timeout for fallback
      setTimeout(() => {
        updateViewportWithCallback(viewportId, (prev) => {
          if (prev.currentImage && prev.currentImage.src === fastImageUrl && !prev.currentImage.loaded) {
            console.warn(`Fast image loading timeout in viewport ${viewportId}, trying fallback`)
            return { currentImage: { ...prev.currentImage, src: fallbackImageUrl } }
          }
          return {}
        })
      }, 8000)
      
    } catch (err) {
      console.error(`Failed to load image in viewport ${viewportId}:`, err)
      updateViewport(viewportId, { isLoading: false, currentImage: null })
    }
  }

  const handleViewportImageLoad = (viewportId: string) => {
    console.log(`Image loaded successfully in viewport ${viewportId}`)
    updateViewport(viewportId, { isLoading: false })
    updateViewportWithCallback(viewportId, (prev) => ({
      currentImage: prev.currentImage ? { ...prev.currentImage, loaded: true } : null
    }))
  }

  const handleViewportImageError = (viewportId: string) => {
    console.log(`Image loading failed in viewport ${viewportId}`)
    updateViewport(viewportId, { isLoading: false })
    updateViewportWithCallback(viewportId, (prev) => ({
      currentImage: prev.currentImage ? { ...prev.currentImage, error: true } : null
    }))
  }

  const navigateViewport = async (viewportId: string, direction: 'next' | 'prev') => {
    const viewport = viewports[viewportId]
    if (!viewport || !viewport.currentSeriesId) return
    
    try {
      // Fetch instances for this viewport's series
      const seriesInstancesResponse = await fetch(`http://localhost:8080/orthanc/series/${viewport.currentSeriesId}/instances`)
      if (!seriesInstancesResponse.ok) return
      
      const seriesInstanceIds = await seriesInstancesResponse.json()
      if (seriesInstanceIds.length === 0) return
      
      let newIndex = viewport.currentInstanceIndex
      if (direction === 'next') {
        newIndex = Math.min(newIndex + 1, seriesInstanceIds.length - 1)
      } else {
        newIndex = Math.max(newIndex - 1, 0)
      }
      
      if (newIndex !== viewport.currentInstanceIndex) {
        // Fetch the new instance data
        const instanceResponse = await fetch(`http://localhost:8080/orthanc/instances/${seriesInstanceIds[newIndex]}`)
        if (instanceResponse.ok) {
          const instance = await instanceResponse.json()
          
          updateViewport(viewportId, { currentInstanceIndex: newIndex })
          await loadImageInViewport(viewportId, instance)
        }
      }
    } catch (error) {
      console.error(`Failed to navigate viewport ${viewportId}:`, error)
    }
  }

  const loadInstanceInViewport = async (viewportId: string, instanceIndex: number) => {
    const viewport = viewports[viewportId]
    if (!viewport || !viewport.currentSeriesId) return
    
    try {
      // Fetch instances for this viewport's series
      const seriesInstancesResponse = await fetch(`http://localhost:8080/orthanc/series/${viewport.currentSeriesId}/instances`)
      if (!seriesInstancesResponse.ok) return
      
      const seriesInstanceIds = await seriesInstancesResponse.json()
      if (instanceIndex >= 0 && instanceIndex < seriesInstanceIds.length) {
        // Fetch the instance data
        const instanceResponse = await fetch(`http://localhost:8080/orthanc/instances/${seriesInstanceIds[instanceIndex]}`)
        if (instanceResponse.ok) {
          const instance = await instanceResponse.json()
          
          updateViewport(viewportId, { currentInstanceIndex: instanceIndex })
          await loadImageInViewport(viewportId, instance)
        }
      }
    } catch (error) {
      console.error(`Failed to load instance ${instanceIndex} in viewport ${viewportId}:`, error)
    }
  }

  const getViewportSeriesInfo = (viewportId: string) => {
    const viewport = viewports[viewportId]
    if (!viewport || !viewport.currentSeriesId) return null
    
    const seriesInfo = series.find(s => s.ID === viewport.currentSeriesId)
    if (!seriesInfo) return null
    
    return {
      seriesId: viewport.currentSeriesId,
      seriesDescription: seriesInfo.MainDicomTags.SeriesDescription || `Series ${seriesInfo.MainDicomTags.SeriesNumber || 'Unknown'}`,
      modality: seriesInfo.MainDicomTags.Modality || 'Unknown',
      instanceCount: seriesInfo.Instances?.length || 0,
      currentInstance: viewport.currentInstanceIndex + 1
    }
  }

  const changeViewportSeries = async (viewportId: string, newSeriesId: string) => {
    console.log(`Changing viewport ${viewportId} to series ${newSeriesId}`)
    await loadSeriesInViewport(viewportId, newSeriesId)
  }

  // Combined series viewport functions
  const enableCombinedSeriesView = async (viewportId: string, seriesIds: string[]) => {
    console.log(`Enabling combined series view in viewport ${viewportId} with series:`, seriesIds)
    
    try {
      // Update viewport to combined mode
      updateViewport(viewportId, { 
        isCombinedView: true,
        combinedSeries: seriesIds.map(seriesId => ({
          seriesId,
          instanceIndex: 0,
          opacity: 1.0,
          visible: true
        }))
      })
      
      // Load first instance from each series
      for (const seriesId of seriesIds) {
        await loadSeriesInViewport(viewportId, seriesId)
      }
      
    } catch (error) {
      console.error(`Failed to enable combined series view in viewport ${viewportId}:`, error)
    }
  }

  const addSeriesToCombinedView = async (viewportId: string, seriesId: string) => {
    const viewport = viewports[viewportId]
    if (!viewport || !viewport.isCombinedView) return
    
    const newCombinedSeries = [...viewport.combinedSeries, {
      seriesId,
      instanceIndex: 0,
      opacity: 1.0,
      visible: true
    }]
    
    updateViewport(viewportId, { combinedSeries: newCombinedSeries })
    
    // Load the series
    await loadSeriesInViewport(viewportId, seriesId)
  }

  const removeSeriesFromCombinedView = (viewportId: string, seriesId: string) => {
    const viewport = viewports[viewportId]
    if (!viewport || !viewport.isCombinedView) return
    
    const filteredSeries = viewport.combinedSeries.filter(s => s.seriesId !== seriesId)
    updateViewport(viewportId, { combinedSeries: filteredSeries })
  }

  const updateSeriesOpacity = (viewportId: string, seriesId: string, opacity: number) => {
    const viewport = viewports[viewportId]
    if (!viewport || !viewport.isCombinedView) return
    
    const updatedSeries = viewport.combinedSeries.map(s => 
      s.seriesId === seriesId ? { ...s, opacity } : s
    )
    updateViewport(viewportId, { combinedSeries: updatedSeries })
  }

  const toggleSeriesVisibility = (viewportId: string, seriesId: string) => {
    const viewport = viewports[viewportId]
    if (!viewport || !viewport.isCombinedView) return
    
    const updatedSeries = viewport.combinedSeries.map(s => 
      s.seriesId === seriesId ? { ...s, visible: !s.visible } : s
    )
    updateViewport(viewportId, { combinedSeries: updatedSeries })
  }

  const navigateCombinedSeriesInstance = async (viewportId: string, seriesId: string, direction: 'next' | 'prev') => {
    const viewport = viewports[viewportId]
    if (!viewport || !viewport.isCombinedView) return
    
    const seriesInfo = viewport.combinedSeries.find(s => s.seriesId === seriesId)
    if (!seriesInfo) return
    
    try {
      // Fetch instances for this series
      const seriesInstancesResponse = await fetch(`http://localhost:8080/orthanc/series/${seriesId}/instances`)
      if (!seriesInstancesResponse.ok) return
      
      const seriesInstanceIds = await seriesInstancesResponse.json()
      if (seriesInstanceIds.length === 0) return
      
      let newIndex = seriesInfo.instanceIndex
      if (direction === 'next') {
        newIndex = Math.min(newIndex + 1, seriesInstanceIds.length - 1)
      } else {
        newIndex = Math.max(newIndex - 1, 0)
      }
      
      if (newIndex !== seriesInfo.instanceIndex) {
        // Update the combined series instance index
        const updatedSeries = viewport.combinedSeries.map(s => 
          s.seriesId === seriesId ? { ...s, instanceIndex: newIndex } : s
        )
        updateViewport(viewportId, { combinedSeries: updatedSeries })
        
        // Load the new instance
        const instanceResponse = await fetch(`http://localhost:8080/orthanc/instances/${seriesInstanceIds[newIndex]}`)
        if (instanceResponse.ok) {
          const instance = await instanceResponse.json()
          await loadImageInViewport(viewportId, instance)
        }
      }
    } catch (error) {
      console.error(`Failed to navigate combined series instance in viewport ${viewportId}:`, error)
    }
  }

  const createCombinedSeriesViewport = async (viewportId: string, selectedSeriesIds: string[]) => {
    console.log(`Creating combined series viewport ${viewportId} with series:`, selectedSeriesIds)
    
    if (selectedSeriesIds.length < 2) {
      console.warn('Need at least 2 series for combined view')
      return
    }
    
    try {
      // Reset the viewport first
      updateViewport(viewportId, {
        currentImage: null,
        isLoading: false,
        zoom: 1,
        rotation: 0,
        windowCenter: 128,
        windowWidth: 256,
        panX: 0,
        panY: 0,
        currentInstanceIndex: 0,
        currentSeriesId: null,
        combinedSeries: [],
        isCombinedView: false
      })
      
      // Enable combined view mode
      await enableCombinedSeriesView(viewportId, selectedSeriesIds)
      
      console.log(`Combined series viewport ${viewportId} created successfully`)
      
    } catch (error) {
      console.error(`Failed to create combined series viewport ${viewportId}:`, error)
    }
  }

  const getActiveViewportsForLayout = () => {
    switch (currentLayout) {
      case '1x1':
        return ['viewport-1']
      case '1x2':
        return ['viewport-1', 'viewport-2']
      case '2x2':
        return ['viewport-1', 'viewport-2', 'viewport-3', 'viewport-4']
      case '2x3':
        return ['viewport-1', 'viewport-2', 'viewport-3', 'viewport-4', 'viewport-5', 'viewport-6']
      case '3x3':
        return ['viewport-1', 'viewport-2', 'viewport-3', 'viewport-4', 'viewport-5', 'viewport-6', 'viewport-7', 'viewport-8', 'viewport-9']
      default:
        return ['viewport-1']
    }
  }

  const resetViewports = () => {
    Object.keys(viewports).forEach(viewportId => {
      updateViewport(viewportId, {
        currentImage: null,
        isLoading: false,
        zoom: 1,
        rotation: 0,
        windowCenter: 128,
        windowWidth: 256,
        panX: 0,
        panY: 0,
        currentInstanceIndex: 0
      })
    })
  }

  const loadSeriesInViewport = async (viewportId: string, seriesId: string) => {
    try {
      // Find the series
      const targetSeries = series.find(s => s.ID === seriesId)
      if (!targetSeries) return
      
      console.log(`Loading series ${seriesId} in viewport ${viewportId}`)
      
      // Fetch instances for this specific series
      const seriesInstancesResponse = await fetch(`http://localhost:8080/orthanc/series/${seriesId}/instances`)
      if (!seriesInstancesResponse.ok) {
        throw new Error(`Failed to fetch instances for series ${seriesId}`)
      }
      
      const seriesInstanceIds = await seriesInstancesResponse.json()
      console.log(`Series ${seriesId} has ${seriesInstanceIds.length} instances`)
      
      if (seriesInstanceIds.length > 0) {
        // Fetch the first instance data
        const firstInstanceResponse = await fetch(`http://localhost:8080/orthanc/instances/${seriesInstanceIds[0]}`)
        if (firstInstanceResponse.ok) {
          const firstInstance = await firstInstanceResponse.json()
          
          // Update viewport with series info and load the first instance
          updateViewport(viewportId, { 
            currentSeriesId: seriesId, 
            currentInstanceIndex: 0 
          })
          
          await loadImageInViewport(viewportId, firstInstance)
        }
      }
    } catch (error) {
      console.error(`Failed to load series ${seriesId} in viewport ${viewportId}:`, error)
    }
  }

  // Ensure currentInstanceIndex is within bounds
  useEffect(() => {
    if (instances.length > 0 && currentInstanceIndex >= instances.length) {
      setCurrentInstanceIndex(0)
    }
  }, [instances, currentInstanceIndex])

  // Debug logging for series state changes
  useEffect(() => {
    console.log('Series state changed:', series)
    console.log('Current series ID:', currentSeriesId)
  }, [series, currentSeriesId])

  // Debug logging for currentImage state changes
  useEffect(() => {
    console.log('CurrentImage state changed:', currentImage)
    console.log('Image loaded state:', imageLoaded)
    console.log('Is loading state:', isLoading)
  }, [currentImage, imageLoaded, isLoading])

  // Debug: Monitor instances state changes
  useEffect(() => {
    console.log('Instances state changed:', instances)
    console.log('Current instance index:', currentInstanceIndex)
  }, [instances, currentInstanceIndex])

  useEffect(() => {
    if (!studyId) return

    const loadStudyData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Load study information
        const studyResponse = await fetch(`http://localhost:8080/orthanc/studies/${studyId}`)
        if (!studyResponse.ok) {
          throw new Error('Failed to fetch study information')
        }
        const studyData = await studyResponse.json()
        setStudyInfo(studyData)

        // Load study instances first to get series information
        const instancesResponse = await fetch(`http://localhost:8080/orthanc/studies/${studyId}/instances`)
        if (!instancesResponse.ok) {
          throw new Error('Failed to fetch study instances')
        }
        
        const instanceData = await instancesResponse.json()
        console.log('Instance data received:', instanceData)
        
        // Check if instances are already full objects or just IDs
        let validInstances: Instance[]
        if (instanceData.length > 0 && typeof instanceData[0] === 'object' && instanceData[0].ID) {
          // Instances are already full objects
          console.log('Instances are already full objects, no need to fetch')
          validInstances = instanceData.filter((instance: any) => instance !== null) as Instance[]
        } else {
          // Instances are just IDs, need to fetch full data
          console.log('Instances are IDs, fetching full data')
          const instancePromises = instanceData.map(async (instanceId: string) => {
            try {
              const instanceResponse = await fetch(`http://localhost:8080/orthanc/instances/${instanceId}`)
              if (instanceResponse.ok) {
                return await instanceResponse.json()
              } else {
                console.warn(`Failed to fetch instance ${instanceId}:`, instanceResponse.status)
                return null
              }
            } catch (err) {
              console.warn(`Error fetching instance ${instanceId}:`, err)
              return null
            }
          })
          
          const instanceResults = await Promise.all(instancePromises)
          validInstances = instanceResults.filter((instance: any) => instance !== null) as Instance[]
        }
        
        console.log('Full instances loaded:', validInstances)
        
        // Group instances by ParentSeries
        const seriesMap = new Map<string, Instance[]>()
        validInstances.forEach((instance: Instance) => {
          if (instance.ParentSeries) {
            if (!seriesMap.has(instance.ParentSeries)) {
              seriesMap.set(instance.ParentSeries, [])
            }
            seriesMap.get(instance.ParentSeries)!.push(instance)
          }
        })
        
        console.log('Series map created:', Array.from(seriesMap.entries()))
        
        // Get unique series IDs
        const seriesIds = Array.from(seriesMap.keys())
        console.log('Series IDs to fetch:', seriesIds)
        
        // Fetch full series details for each series ID
        const seriesPromises = seriesIds.map(async (seriesId: string) => {
          try {
            console.log(`Fetching series details for: ${seriesId}`)
            const seriesResponse = await fetch(`http://localhost:8080/orthanc/series/${seriesId}`)
            if (seriesResponse.ok) {
              const seriesData = await seriesResponse.json()
              console.log(`Series ${seriesId} data:`, seriesData)
              
              // Get instances for this series from our map
              const seriesInstances = seriesMap.get(seriesId) || []
              const sortedInstances = seriesInstances.sort((a: Instance, b: Instance) => {
                const aNum = parseInt(a.MainDicomTags?.InstanceNumber || '0')
                const bNum = parseInt(b.MainDicomTags?.InstanceNumber || '0')
                return aNum - bNum
              })
              
              // Create Series object with actual series data
              const seriesInfo: Series = {
                ID: seriesId,
                MainDicomTags: {
                  SeriesDescription: seriesData.MainDicomTags?.SeriesDescription || `Series ${seriesData.MainDicomTags?.SeriesNumber || 'Unknown'}`,
                  SeriesNumber: seriesData.MainDicomTags?.SeriesNumber || '',
                  Modality: seriesData.MainDicomTags?.Modality || 'Unknown',
                  SeriesDate: seriesData.MainDicomTags?.SeriesDate,
                  SeriesTime: seriesData.MainDicomTags?.SeriesTime,
                  NumberOfSeriesRelatedInstances: seriesData.MainDicomTags?.NumberOfSeriesRelatedInstances || seriesInstances.length.toString(),
                  BodyPartExamined: seriesData.MainDicomTags?.BodyPartExamined || '',
                  ProtocolName: seriesData.MainDicomTags?.ProtocolName || ''
                },
                Instances: sortedInstances.map((inst: Instance) => inst.ID),
                ParentStudy: studyId,
                Type: 'Series'
              }
              
              return seriesInfo
            } else {
              console.warn(`Failed to fetch series ${seriesId}:`, seriesResponse.status)
              return null
            }
          } catch (err) {
            console.warn(`Error fetching series ${seriesId}:`, err)
            return null
          }
        })
        
        const seriesResults = await Promise.all(seriesPromises)
        const seriesData = seriesResults.filter(series => series !== null) as Series[]
        
        console.log('Series data created:', seriesData)
        console.log('First series ID:', seriesData[0]?.ID, 'type:', typeof seriesData[0]?.ID)
        console.log('Setting series state with:', seriesData.length, 'series')
        setSeries(seriesData)
        
        // Set the first series as current if available
        if (seriesData.length > 0) {
          console.log(`Setting first series as current: ${seriesData[0].ID}`)
          setCurrentSeriesId(seriesData[0].ID)
          // Pass the series data directly to avoid race condition
          await loadSeriesInstances(seriesData[0].ID, seriesData)
        }



      } catch (err) {
        console.error('Failed to load study data:', err)
        setError('Failed to load study data')
      } finally {
        setIsLoading(false)
      }
    }

    loadStudyData()
  }, [studyId])

  const loadSeriesInstances = async (seriesId: string, seriesDataOverride?: Series[]) => {
    try {
      console.log(`Loading instances for series: ${seriesId}`)
      
      // Use provided series data or fall back to state
      const seriesToSearch = seriesDataOverride || series;
      console.log(`Searching in series data:`, seriesToSearch.length, 'series')
      
      // Find the series in our series data
      const currentSeries = seriesToSearch.find(s => s.ID === seriesId)
      console.log(`Found series:`, currentSeries)
      
      if (!currentSeries) {
        console.error(`Series ${seriesId} not found in series data`)
        console.log(`Available series IDs:`, seriesToSearch.map(s => s.ID))
        return
      }
      
      // Get the instance IDs for this series
      const instanceIds = currentSeries.Instances
      console.log(`Instance IDs for series ${seriesId}:`, instanceIds)
      
      if (instanceIds && instanceIds.length > 0) {
        console.log(`Fetching full instance data for ${instanceIds.length} instances in series ${seriesId}`)
        
        // Fetch full instance data for each instance ID
        const instancePromises = instanceIds.map(async (instanceId: string) => {
          try {
            console.log(`Fetching instance: ${instanceId}`)
            const instanceResponse = await fetch(`http://localhost:8080/orthanc/instances/${instanceId}`)
            if (instanceResponse.ok) {
              const instanceData = await instanceResponse.json()
              console.log(`Instance ${instanceId} loaded:`, instanceData)
              return instanceData
            } else {
              console.warn(`Failed to fetch instance ${instanceId}:`, instanceResponse.status)
              return null
            }
          } catch (err) {
            console.warn(`Error fetching instance ${instanceId}:`, err)
            return null
          }
        })
        
        const instanceResults = await Promise.all(instancePromises)
        const validInstances = instanceResults.filter(instance => instance !== null)
        console.log(`Valid instances:`, validInstances)
        
        // Sort instances by instance number if available
        const sortedInstances = validInstances.sort((a: Instance, b: Instance) => {
          const aNum = parseInt(a.MainDicomTags?.InstanceNumber || '0')
          const bNum = parseInt(b.MainDicomTags?.InstanceNumber || '0')
          return aNum - bNum
        })
        
        console.log(`Sorted instances:`, sortedInstances)
        console.log(`Setting instances state with ${sortedInstances.length} instances`)
        setInstances(sortedInstances)
        setCurrentInstanceIndex(0)
        
        // Load the first instance image
        if (sortedInstances.length > 0) {
          console.log(`Loading first instance image:`, sortedInstances[0])
          await loadInstanceImage(sortedInstances[0])
        } else {
          console.log(`No instances to load image for`)
        }
      } else {
        console.log(`No instances found for series ${seriesId}`)
        setInstances([])
        setCurrentInstanceIndex(0)
      }
    } catch (err) {
      console.error(`Failed to load series instances for ${seriesId}:`, err)
      setError('Failed to load series instances')
    }
  }

  const loadInstanceImage = async (instance: Instance) => {
    try {
      console.log(`Starting to load instance: ${instance.ID}`)
      
      // Clear previous image state first
      setCurrentImage(null)
      setImageLoaded(false)
      setIsLoading(true)
      
      // Try to use a smaller, faster image format first
      const fastImageUrl = `http://localhost:8080/orthanc/instances/${instance.ID}/preview?quality=50&size=512`
      const fallbackImageUrl = `http://localhost:8080/orthanc/instances/${instance.ID}/preview`
      
      console.log(`Attempting to load fast image from: ${fastImageUrl}`)
      
      // Set the fast image first
      const newImageState = {
        src: fastImageUrl,
        loaded: false,
        error: false
      }
      
      console.log(`Setting fast image state:`, newImageState)
      setCurrentImage(newImageState)
      
      // Force a re-render
      setForceUpdate(Date.now())
      
      // Preload the next few instances for faster navigation
      if (instances.length > 0) {
        const currentIndex = instances.findIndex(inst => inst.ID === instance.ID)
        if (currentIndex !== -1) {
          // Preload next 2 instances
          for (let i = 1; i <= 2; i++) {
            const nextIndex = currentIndex + i
            if (nextIndex < instances.length) {
              const nextInstance = instances[nextIndex]
              const nextImageUrl = `http://localhost:8080/orthanc/instances/${nextInstance.ID}/preview?quality=50&size=512`
              console.log(`Preloading next instance: ${nextInstance.ID}`)
              
              // Create a hidden image element to preload
              const preloadImg = new Image()
              preloadImg.src = nextImageUrl
            }
          }
        }
      }
      
      // Set a shorter timeout for faster feedback
      setTimeout(() => {
        console.log(`Checking timeout for instance ${instance.ID}`)
        setIsLoading(false)
        setCurrentImage(prev => {
          if (prev && prev.src === fastImageUrl && !prev.loaded) {
            console.warn(`Fast image loading timeout, trying fallback`)
            // Try the fallback URL
            return { ...prev, src: fallbackImageUrl }
          }
          return prev
        })
      }, 8000) // 8 second timeout for fast image
      
    } catch (err) {
      console.error('Failed to load instance image:', err)
      setIsLoading(false)
      setError('Failed to load image')
    }
  }

  const handleImageLoad = () => {
    console.log(`Image loaded successfully`)
    setImageLoaded(true)
    setIsLoading(false)
    setCurrentImage(prev => {
      if (prev) {
        console.log(`Updating currentImage loaded state to true`)
        return { ...prev, loaded: true }
      }
      return null
    })
    
    // If this was a fast image, optionally load the full quality version
    // This provides progressive enhancement
    if (currentImage?.src.includes('quality=50')) {
      console.log(`Fast image loaded, optionally loading full quality`)
      // You can implement progressive loading here if needed
    }
  }

  const handleImageError = () => {
    console.log('Image loading failed')
    console.log('Current image src:', currentImage?.src)
    
    if (currentImage?.src.includes('preview')) {
      // Try test image as fallback
      console.log('Using fallback test image')
      const testImageSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3ZnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkRJQ09NIFRlc3Q8L3RleHQ+PC9zdmc+'
      setCurrentImage(prev => prev ? { ...prev, src: testImageSrc, error: false } : null)
    } else {
      // Final error state
      console.log('Setting final error state')
      setCurrentImage(prev => prev ? { ...prev, error: true } : null)
      setIsLoading(false)
    }
  }

  const handleSeriesSelect = async (seriesId: string) => {
    console.log(`Series selected: ${seriesId}`)
    console.log(`Current series state:`, series)
    console.log(`Current instances state:`, instances)
    
    // Reset image state when switching series
    setCurrentImage(null)
    setImageLoaded(false)
    setIsLoading(false)
    
    // Reset all viewports
    resetViewports()
    
    setCurrentSeriesId(seriesId)
    console.log(`Setting currentSeriesId to: ${seriesId}`)
    
    try {
      // Pass the current series state to avoid race condition
      console.log(`About to call loadSeriesInstances for series: ${seriesId}`)
      await loadSeriesInstances(seriesId, series)
      console.log(`Series instances loaded successfully for: ${seriesId}`)
      
      // Load different series in different viewports for comparison
      if (series.length > 0) {
        // Viewport 1: Current selected series (first instance)
        if (instances.length > 0 && instances[0]) {
          await loadImageInViewport('viewport-1', instances[0])
          updateViewport('viewport-1', { currentSeriesId: seriesId })
        }
        
        // Load additional series in other viewports
        const activeViewports = getActiveViewportsForLayout()
        for (let i = 1; i < Math.min(activeViewports.length, series.length); i++) {
          const viewportId = activeViewports[i]
          const seriesToLoad = series[i]
          if (seriesToLoad) {
            await loadSeriesInViewport(viewportId, seriesToLoad.ID)
          }
        }
      }
      
      // Preload thumbnails for other series to make switching faster
      series.forEach(async (s) => {
        if (s.ID !== seriesId && s.Instances && s.Instances.length > 0) {
          const firstInstanceId = s.Instances[0]
          const thumbnailUrl = `http://localhost:8080/orthanc/instances/${firstInstanceId}/preview?quality=30&size=256`
          console.log(`Preloading thumbnail for series: ${s.ID}`)
          
          // Create a hidden image element to preload
          const preloadImg = new Image()
          preloadImg.src = thumbnailUrl
        }
      })
      
      // Debug: Check if instances were loaded
      console.log(`After loadSeriesInstances, instances state:`, instances)
      console.log(`After loadSeriesInstances, currentImage state:`, currentImage)
      console.log(`After loadSeriesInstances, isLoading state:`, isLoading)
    } catch (error) {
      console.error(`Failed to load series instances for: ${seriesId}`, error)
    }
  }

  const handleGenerateReport = () => {
    setShowReportGenerator(true)
  }

  const resetView = () => {
    console.log('Reset view requested')
    const activeViewportId = getActiveViewportId()
    if (activeViewportId) {
      updateViewport(activeViewportId, { 
        zoom: 1, 
        rotation: 0, 
        panX: 0, 
        panY: 0,
        windowCenter: 128,
        windowWidth: 256
      })
    }
    imageManipulation.clearMeasurements()
    imageManipulation.clearAnnotations()
  }

  const downloadStudy = async () => {
    if (!studyId) return
    
    try {
      const response = await fetch(`http://localhost:8080/orthanc/studies/${studyId}/archive`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `study-${studyId}.zip`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (err) {
      console.error('Failed to download study:', err)
    }
  }

  // Generate OHIF web viewer URLs
  const generateOHIFViewerUrl = (seriesId: string) => {
    return `http://localhost:8042/web-viewer/app/viewer.html?series=${seriesId}`
  }

  const generateOHIFStudyUrl = (studyId: string) => {
    return `http://localhost:8042/web-viewer/app/viewer.html?study=${studyId}`
  }

  const openInOHIFViewer = (seriesId: string) => {
    const url = generateOHIFViewerUrl(seriesId)
    window.open(url, '_blank')
  }

  const openStudyInOHIFViewer = (studyId: string) => {
    const url = generateOHIFStudyUrl(studyId)
    window.open(url, '_blank')
  }

  const copyOHIFViewerUrl = async (seriesId: string) => {
    const url = generateOHIFViewerUrl(seriesId)
    try {
      await navigator.clipboard.writeText(url)
      console.log('OHIF viewer URL copied to clipboard:', url)
      // You can add a toast notification here
    } catch (err) {
      console.error('Failed to copy URL to clipboard:', err)
      // Fallback: create a temporary input element
      const tempInput = document.createElement('input')
      tempInput.value = url
      document.body.appendChild(tempInput)
      tempInput.select()
      document.execCommand('copy')
      document.body.removeChild(tempInput)
      console.log('OHIF viewer URL copied to clipboard (fallback):', url)
    }
  }

  const copyOHIFStudyUrl = async (studyId: string) => {
    const url = generateOHIFStudyUrl(studyId)
    try {
      await navigator.clipboard.writeText(url)
      console.log('OHIF study URL copied to clipboard:', url)
    } catch (err) {
      console.error('Failed to copy URL to clipboard:', err)
      const tempInput = document.createElement('input')
      tempInput.value = url
      document.body.appendChild(tempInput)
      tempInput.select()
      document.execCommand('copy')
      document.body.removeChild(tempInput)
      console.log('OHIF study URL copied to clipboard (fallback):', url)
    }
  }

  const generateMultiSeriesOHIFUrl = (seriesIds: string[]) => {
    if (seriesIds.length === 0) return ''
    if (seriesIds.length === 1) return generateOHIFViewerUrl(seriesIds[0])
    
    // For multiple series, use the study parameter
    return `http://localhost:8042/web-viewer/app/viewer.html?study=${studyId}`
  }

  const changeInstance = async (direction: 'next' | 'previous') => {
    if (instances.length === 0) return
    
    let newIndex = currentInstanceIndex
    if (direction === 'next') {
      newIndex = Math.min(currentInstanceIndex + 1, instances.length - 1)
    } else {
      newIndex = Math.max(currentInstanceIndex - 1, 0)
    }
    
    setCurrentInstanceIndex(newIndex)
    
    // Clear current image before loading new one
    setCurrentImage(null)
    
    // Load the new instance image
    const instance = instances[newIndex]
    if (instance) {
      console.log(`Switched to instance ${newIndex}: ${instance.ID}`)
      await loadInstanceImage(instance)
    }
  }

  // Handle mouse events for image manipulation
  const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      
    if (imageManipulation.tool === 'pan') {
      // Handle pan logic
      const startX = e.clientX - imageManipulation.panX
      const startY = e.clientY - imageManipulation.panY
      // You can implement pan logic here
    } else if (['distance', 'angle', 'area'].includes(imageManipulation.tool)) {
      // Handle measurement tools
      const rect = e.currentTarget.getBoundingClientRect()
      const screenX = e.clientX - rect.left
      const screenY = e.clientY - rect.top
      
      // Convert screen coordinates to image coordinates
      const imageCoords = screenToImageCoordinates(screenX, screenY)
      imageManipulation.handleMeasurementClick(imageCoords)
    } else if (['text', 'circle', 'rectangle'].includes(imageManipulation.tool)) {
      // Handle annotation tools
      const rect = e.currentTarget.getBoundingClientRect()
      const screenX = e.clientX - rect.left
      const screenY = e.clientY - rect.top
      
      // Convert screen coordinates to image coordinates
      const imageCoords = screenToImageCoordinates(screenX, screenY)
      imageManipulation.handleAnnotationClick(imageCoords)
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
      e.preventDefault()
      
    if (imageManipulation.tool === 'pan') {
      // Handle pan movement
    } else if (imageManipulation.tool === 'wwwc') {
      // Handle window/level adjustment
      const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        
        const newCenter = Math.max(0, Math.min(255, (y / rect.height) * 255))
        const newWidth = Math.max(1, Math.min(255, (x / rect.width) * 255))
        
      imageManipulation.setWindowCenter(newCenter)
      imageManipulation.setWindowWidth(newWidth)
    }
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    // Only prevent default if we're actually handling the event
    if (imageManipulation.tool !== 'none') {
      e.preventDefault()
    }
    // Handle mouse up logic
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    
    // Complete ROI measurement on right-click
    if (imageManipulation.tool === 'roi' && imageManipulation.drawingPoints.length >= 3) {
      imageManipulation.completeROIMeasurement()
    }
  }

  // Helper functions to get and set active viewport properties
  const getActiveViewportId = () => {
    const activeViewports = getActiveViewportsForLayout()
    console.log('Active viewports:', activeViewports)
    console.log('All viewports:', Object.keys(viewports))
    const activeViewportId = activeViewports.length > 0 ? activeViewports[0] : null
    console.log('Selected active viewport ID:', activeViewportId)
    return activeViewportId
  }

  // Force toolbar update when viewport properties change
  React.useEffect(() => {
    const activeViewportId = getActiveViewportId()
    if (activeViewportId && viewports[activeViewportId]) {
      // This will trigger a re-render of the toolbar with updated values
      setForceUpdate(prev => prev + 1)
    }
  }, [viewports])

  const getActiveViewportZoom = () => {
    const activeViewportId = getActiveViewportId()
    if (activeViewportId && viewports[activeViewportId]) {
      return viewports[activeViewportId].zoom
    }
    return 1
  }

  const setActiveViewportZoom = (zoom: number) => {
    const activeViewportId = getActiveViewportId()
    if (activeViewportId) {
      updateViewport(activeViewportId, { zoom })
    }
  }

  const getActiveViewportRotation = () => {
    const activeViewportId = getActiveViewportId()
    if (activeViewportId && viewports[activeViewportId]) {
      return viewports[activeViewportId].rotation
    }
    return 0
  }

  const setActiveViewportRotation = (rotation: number) => {
    const activeViewportId = getActiveViewportId()
    if (activeViewportId) {
      updateViewport(activeViewportId, { rotation })
    }
  }

  const getActiveViewportWindowCenter = () => {
    const activeViewportId = getActiveViewportId()
    if (activeViewportId && viewports[activeViewportId]) {
      return viewports[activeViewportId].windowCenter
    }
    return 128
  }

  const setActiveViewportWindowCenter = (windowCenter: number) => {
    const activeViewportId = getActiveViewportId()
    if (activeViewportId) {
      updateViewport(activeViewportId, { windowCenter })
    }
  }

  const getActiveViewportWindowWidth = () => {
    const activeViewportId = getActiveViewportId()
    if (activeViewportId && viewports[activeViewportId]) {
      return viewports[activeViewportId].windowWidth
    }
    return 256
  }

  const setActiveViewportWindowWidth = (windowWidth: number) => {
    const activeViewportId = getActiveViewportId()
    if (activeViewportId) {
      updateViewport(activeViewportId, { windowWidth })
    }
  }

  const handleMouseLeave = () => {
    // Handle mouse leave logic
  }

  const handleWheel = (e: React.WheelEvent) => {
    // Only prevent default if we're actually handling the wheel event
    if (imageManipulation.tool === 'zoom') {
      e.preventDefault()
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      imageManipulation.setZoom(prev => Math.max(0.1, Math.min(5, prev * delta)))
    }
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    // Only prevent default if we're actually handling the double click
    e.preventDefault()
    resetView()
  }

  // Helper function to transform screen coordinates to image coordinates
  const screenToImageCoordinates = (screenX: number, screenY: number) => {
    // Remove pan offset
    let x = screenX - imageManipulation.panX
    let y = screenY - imageManipulation.panY
    
    // Remove zoom scaling
    x = x / imageManipulation.zoom
    y = y / imageManipulation.zoom
    
    // Remove rotation (rotate back around center)
    const centerX = 300 // Approximate center
    const centerY = 300
    
    const cos = Math.cos((-imageManipulation.rotation * Math.PI) / 180)
    const sin = Math.sin((-imageManipulation.rotation * Math.PI) / 180)
    
    // Rotate back around center
    const rotatedX = (x - centerX) * cos - (y - centerY) * sin + centerX
    const rotatedY = (x - centerX) * sin + (y - centerY) * cos + centerY
    
    return { x: rotatedX, y: rotatedY }
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="text-red-500 mb-4">
          <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">⚠️</span>
          </div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading DICOM</h3>
        <p className="text-gray-500">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!studyId) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="text-gray-400 mb-4">
          <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-2xl">📋</span>
          </div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Study Selected</h3>
        <p className="text-gray-500">Please select a study to view DICOM images.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow h-screen flex flex-col">
      {/* Enhanced Toolbar with OHIF-style tools */}
      <div className="border-b border-gray-200">
        <EnhancedToolbar
          tool={imageManipulation.tool}
          setActiveTool={imageManipulation.setActiveTool}
          zoom={getActiveViewportZoom()}
          setZoom={setActiveViewportZoom}
          rotation={getActiveViewportRotation()}
          setRotation={setActiveViewportRotation}
          windowCenter={getActiveViewportWindowCenter()}
          setWindowCenter={setActiveViewportWindowCenter}
          windowWidth={getActiveViewportWindowWidth()}
          setWindowWidth={setActiveViewportWindowWidth}
          showMeasurements={imageManipulation.showMeasurements}
          setShowMeasurements={imageManipulation.setShowMeasurements}
          showAnnotations={imageManipulation.showAnnotations}
          setShowAnnotations={imageManipulation.setShowAnnotations}
          measurementColor={imageManipulation.measurementColor}
          setMeasurementColor={imageManipulation.setMeasurementColor}
          annotationColor={imageManipulation.annotationColor}
          setAnnotationColor={imageManipulation.setAnnotationColor}
          resetView={resetView}
          changeInstance={changeInstance}
          currentInstanceIndex={currentInstanceIndex}
          instancesLength={instances.length}
          downloadStudy={downloadStudy}
          onWindowPresetChange={(preset) => {
            // Handle window presets for active viewport
            console.log('Window preset selected:', preset)
            const activeViewportId = getActiveViewportId()
            console.log('Active viewport ID:', activeViewportId)
            
            if (activeViewportId) {
              let windowCenter = 128
              let windowWidth = 256
              
              switch (preset) {
                case 'CT':
                  windowCenter = 40
                  windowWidth = 400
                  break
                case 'MR':
                  windowCenter = 128
                  windowWidth = 256
                  break
                case 'PET':
                  windowCenter = 128
                  windowWidth = 256
                  break
                case 'X-Ray':
                  windowCenter = 128
                  windowWidth = 256
                  break
                case 'Ultrasound':
                  windowCenter = 128
                  windowWidth = 256
                  break
                default:
                  console.warn('Unknown preset:', preset)
                  return
              }
              
              console.log(`Applying preset ${preset}: Center=${windowCenter}, Width=${windowWidth}`)
              updateViewport(activeViewportId, { windowCenter, windowWidth })
            } else {
              console.warn('No active viewport found for preset application')
            }
          }}
        />
      </div>

      {/* DICOM Viewer Content */}
      <div className="flex-1 flex overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full w-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading DICOM image...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Main Layout with Sidebar */}
            <div className="flex h-full w-full">
              {/* Left Sidebar - Series and Tools */}
              <div className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-full overflow-y-auto">
                {/* Study Header */}
                <div className="p-4 border-b border-gray-200 bg-white">
                  <StudyHeader
                    studyInfo={studyInfo}
                    currentSeriesCount={series.length}
                    currentInstanceCount={instances.length}
                    downloadStudy={downloadStudy}
                  />
                </div>

                {/* Series Selector */}
                {series.length > 0 && (
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Image Series</h3>
                    <SeriesSelector
                      series={series}
                      currentSeriesId={currentSeriesId}
                      onSeriesSelect={handleSeriesSelect}
                      onSeriesThumbnailLoad={(seriesId, thumbnailUrl) => {
                        console.log(`Thumbnail loaded for series ${seriesId}: ${thumbnailUrl}`)
                      }}
                    />
                  </div>
                )}

                {/* Layout Manager */}
                <div className="p-4 border-b border-gray-200 bg-white">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Viewport Layout</h3>
                  <LayoutManager
                    currentLayout={currentLayout}
                    onLayoutChange={setCurrentLayout}
                    viewportCount={9}
                  />
                </div>

                {/* Enhanced Sidebar with OHIF-style panels */}
                <div className="flex-1 overflow-y-auto">
                  <EnhancedSidebar
                    studyInfo={studyInfo}
                    series={series}
                    currentSeriesId={currentSeriesId}
                    instances={instances}
                    currentInstanceIndex={currentInstanceIndex}
                    measurements={imageManipulation.measurements}
                    annotations={imageManipulation.annotations}
                    drawingPoints={imageManipulation.drawingPoints}
                    tool={imageManipulation.tool}
                    showMeasurements={imageManipulation.showMeasurements}
                    setShowMeasurements={imageManipulation.setShowMeasurements}
                    showAnnotations={imageManipulation.showAnnotations}
                    setShowAnnotations={imageManipulation.setShowAnnotations}
                    clearMeasurements={imageManipulation.clearMeasurements}
                    clearAnnotations={imageManipulation.clearAnnotations}
                    deleteMeasurement={imageManipulation.deleteMeasurement}
                    deleteAnnotation={imageManipulation.deleteAnnotation}
                    setDrawingPoints={imageManipulation.setDrawingPoints}
                    downloadStudy={downloadStudy}
                    onSeriesSelect={handleSeriesSelect}
                    onGenerateReport={handleGenerateReport}
                    // Combined series viewport functions
                    createCombinedSeriesViewport={createCombinedSeriesViewport}
                    enableCombinedSeriesView={enableCombinedSeriesView}
                    addSeriesToCombinedView={addSeriesToCombinedView}
                    removeSeriesFromCombinedView={removeSeriesFromCombinedView}
                    updateSeriesOpacity={updateSeriesOpacity}
                    toggleSeriesVisibility={toggleSeriesVisibility}
                    navigateCombinedSeriesInstance={navigateCombinedSeriesInstance}
                    viewports={viewports}
                    // OHIF viewer functions
                    generateOHIFViewerUrl={generateOHIFViewerUrl}
                    generateOHIFStudyUrl={generateOHIFStudyUrl}
                    openInOHIFViewer={openInOHIFViewer}
                    openStudyInOHIFViewer={openStudyInOHIFViewer}
                    copyOHIFViewerUrl={copyOHIFViewerUrl}
                    copyOHIFStudyUrl={copyOHIFStudyUrl}
                    generateMultiSeriesOHIFUrl={generateMultiSeriesOHIFUrl}
                  />
                </div>
              </div>

              {/* Main Content Area - Multi-Viewport DICOM Viewer */}
              <div className="flex-1 bg-gray-100 p-4">
                <div className="h-full">
                  {(() => {
                    console.log('About to render MultiViewport with props:', {
                      currentImage,
                      isLoading,
                      instances: instances.length,
                      currentSeriesId
                    })
                    return null
                  })()}
                  <MultiViewport
                    key={`dicom-viewer-${forceUpdate}`}
                    layout={currentLayout}
                    viewports={getActiveViewportsForLayout().map(viewportId => {
                      const viewport = viewports[viewportId]
                      return {
                        id: viewport.id,
                        currentImage: viewport.currentImage,
                        isLoading: viewport.isLoading,
                        zoom: viewport.zoom,
                        rotation: viewport.rotation,
                        windowCenter: viewport.windowCenter,
                        windowWidth: viewport.windowWidth,
                        panX: viewport.panX,
                        panY: viewport.panY,
                        tool: imageManipulation.tool,
                        measurements: imageManipulation.measurements,
                        annotations: imageManipulation.annotations,
                        drawingPoints: imageManipulation.drawingPoints,
                        showMeasurements: imageManipulation.showMeasurements,
                        showAnnotations: imageManipulation.showAnnotations,
                        onImageLoad: () => handleViewportImageLoad(viewport.id),
                        onImageError: () => handleViewportImageError(viewport.id),
                        onMouseDown: handleMouseDown,
                        onMouseMove: handleMouseMove,
                        onMouseUp: handleMouseUp,
                        onMouseLeave: handleMouseLeave,
                        onWheel: handleWheel,
                        onDoubleClick: handleDoubleClick,
                        onContextMenu: handleContextMenu
                      }
                    })}
                    onViewportChange={(viewportId, changes) => {
                      // Handle viewport changes
                      if (changes.zoom !== undefined) updateViewport(viewportId, { zoom: changes.zoom })
                      if (changes.rotation !== undefined) updateViewport(viewportId, { rotation: changes.rotation })
                      if (changes.panX !== undefined) updateViewport(viewportId, { panX: changes.panX })
                      if (changes.panY !== undefined) updateViewport(viewportId, { panY: changes.panY })
                    }}
                  />
                </div>
              </div>

              {/* Right Sidebar - Reports and Tools */}
              <div className="w-64 bg-gray-50 border-l border-gray-200 flex flex-col h-full overflow-y-auto">
                {/* Reports Panel */}
                <div className="p-4 border-b border-gray-200 bg-white">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <FileSpreadsheet className="h-4 w-4 mr-2 text-red-600" />
                    Report Generation
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                      <p className="text-sm text-red-700 mb-3">
                        Generate comprehensive reports based on the current study, measurements, and annotations.
                      </p>
                      <button
                        onClick={handleGenerateReport}
                        className="w-full p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center text-sm font-medium"
                      >
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Generate Report
                      </button>
                    </div>
                    
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-2 text-sm">Report Templates</h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-blue-700">Available:</span>
                          <span className="font-medium">5 Templates</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Modality:</span>
                          <span className="font-medium">{series[0]?.MainDicomTags?.Modality || 'Unknown'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                      <h4 className="font-medium text-green-900 mb-2 text-sm">Study Data</h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-green-700">Series:</span>
                          <span className="font-medium">{series.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700">Images:</span>
                          <span className="font-medium">{instances.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700">Measurements:</span>
                          <span className="font-medium">{imageManipulation.measurements.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700">Annotations:</span>
                          <span className="font-medium">{imageManipulation.annotations.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="p-4 border-b border-gray-200 bg-white">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={downloadStudy}
                      className="w-full p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center text-sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Study
                    </button>
                    <button
                      onClick={resetView}
                      className="w-full p-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center justify-center text-sm"
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset View
                    </button>
                  </div>
                </div>

                {/* Study Information */}
                <div className="p-4 bg-white">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Study Info</h3>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Patient:</span>
                      <span className="font-medium">{studyInfo?.MainDicomTags?.PatientName || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID:</span>
                      <span className="font-medium">{studyInfo?.MainDicomTags?.PatientID || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{studyInfo?.MainDicomTags?.StudyDate || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Description:</span>
                      <span className="font-medium">{studyInfo?.MainDicomTags?.StudyDescription || 'Unknown'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Report Generator Modal */}
        {showReportGenerator && (
          <ReportGenerator
            studyInfo={studyInfo}
            series={series}
            instances={instances}
            measurements={imageManipulation.measurements}
            annotations={imageManipulation.annotations}
            onClose={() => setShowReportGenerator(false)}
          />
        )}
      </div>
    </div>
  )
}

export default DicomViewer