'use client'

import React, { useState, useEffect } from 'react'
import { 
  Calendar, 
  User, 
  Copy, 
  ArrowRight, 
  Info,
  ChevronDown,
  Search,
  Filter
} from 'lucide-react'

interface Study {
  ID: string
  MainDicomTags: {
    StudyDate?: string
    StudyDescription?: string
    PatientName?: string
    PatientID?: string
    ModalitiesInStudy?: string
    AccessionNumber?: string
  }
  Series: string[]
  Instances: string[]
}

interface Series {
  ID: string
  MainDicomTags: {
    SeriesDescription?: string
    Modality?: string
  }
  Instances: string[]
}

interface EnhancedStudyListProps {
  onStudySelect: (studyId: string) => void
  onViewerAction: (action: string, studyId: string) => void
  selectedStudy?: string | null
}

export default function EnhancedStudyList({ 
  onStudySelect, 
  onViewerAction, 
  selectedStudy 
}: EnhancedStudyListProps) {
  const [studies, setStudies] = useState<Study[]>([])
  const [selectedStudyDetails, setSelectedStudyDetails] = useState<Study | null>(null)
  const [selectedStudySeries, setSelectedStudySeries] = useState<Series[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter states
  const [filters, setFilters] = useState({
    patientName: '',
    mrn: '',
    startDate: '',
    endDate: '',
    description: '',
    modality: '',
    accessionNumber: '',
  })

  useEffect(() => {
    loadStudies()
  }, [])

  useEffect(() => {
    if (selectedStudy) {
      const study = studies.find(s => s.ID === selectedStudy)
      if (study) {
        setSelectedStudyDetails(study)
        loadStudySeries(study.ID)
      }
    }
  }, [selectedStudy, studies])

  const loadStudies = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('http://localhost:8080/orthanc/studies')
      if (!response.ok) {
        throw new Error('Failed to fetch studies')
      }
      
      const studyIds = await response.json()
      
      // Fetch detailed information for each study
      const studyPromises = studyIds.map(async (studyId: string) => {
        const studyResponse = await fetch(`http://localhost:8080/orthanc/studies/${studyId}`)
        if (studyResponse.ok) {
          return studyResponse.json()
        }
        return null
      })
      
      const studyDetails = await Promise.all(studyPromises)
      const validStudies = studyDetails.filter(study => study !== null)
      setStudies(validStudies)
      
    } catch (err) {
      setError('Failed to load studies')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadStudySeries = async (studyId: string) => {
    try {
      const response = await fetch(`http://localhost:8080/orthanc/studies/${studyId}/series`)
      if (response.ok) {
        const seriesIds = await response.json()
        const seriesPromises = seriesIds.map(async (seriesId: string) => {
          const seriesResponse = await fetch(`http://localhost:8080/orthanc/series/${seriesId}`)
          if (seriesResponse.ok) {
            return seriesResponse.json()
          }
          return null
        })
        
        const seriesDetails = await Promise.all(seriesPromises)
        const validSeries = seriesDetails.filter(series => series !== null)
        setSelectedStudySeries(validSeries)
      }
    } catch (err) {
      console.error('Failed to load series:', err)
    }
  }

  const filteredStudies = studies.filter(study => {
    const patientName = study.MainDicomTags.PatientName?.toLowerCase() || ''
    const mrn = study.MainDicomTags.PatientID?.toLowerCase() || ''
    const description = study.MainDicomTags.StudyDescription?.toLowerCase() || ''
    const modality = study.MainDicomTags.ModalitiesInStudy?.toLowerCase() || ''
    const accession = study.MainDicomTags.AccessionNumber?.toLowerCase() || ''
    
    return (
      patientName.includes(filters.patientName.toLowerCase()) &&
      mrn.includes(filters.mrn.toLowerCase()) &&
      description.includes(filters.description.toLowerCase()) &&
      modality.includes(filters.modality.toLowerCase()) &&
      accession.includes(filters.accessionNumber.toLowerCase())
    )
  })

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown'
    try {
      const year = dateString.substring(0, 4)
      const month = dateString.substring(4, 6)
      const day = dateString.substring(6, 8)
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      return `${monthNames[parseInt(month) - 1]}-${day}-${year}`
    } catch {
      return dateString
    }
  }

  const formatTime = (dateString?: string) => {
    if (!dateString) return ''
    try {
      // Assuming time is in format HHMMSS
      const hour = dateString.substring(8, 10)
      const minute = dateString.substring(10, 12)
      const ampm = parseInt(hour) >= 12 ? 'PM' : 'AM'
      const hour12 = parseInt(hour) % 12 || 12
      return `${hour12}:${minute} ${ampm}`
    } catch {
      return ''
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="text-center text-red-400">
          <p className="mb-4">{error}</p>
          <button 
            onClick={loadStudies}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Study List</h1>
        <span className="text-gray-400">// Studies</span>
      </div>

      {/* Filter Section */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Patient Name</label>
            <input
              type="text"
              value={filters.patientName}
              onChange={(e) => handleFilterChange('patientName', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Filter by name"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-1">MRN</label>
            <input
              type="text"
              value={filters.mrn}
              onChange={(e) => handleFilterChange('mrn', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Filter by MRN"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-1">Study Date</label>
            <div className="flex space-x-2">
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-1">Description</label>
            <input
              type="text"
              value={filters.description}
              onChange={(e) => handleFilterChange('description', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Filter by description"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-1">Modality</label>
            <div className="relative">
              <input
                type="text"
                value={filters.modality}
                onChange={(e) => handleFilterChange('modality', e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                placeholder="Filter by modality"
              />
              <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-gray-400" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-300 mb-1">Accession #</label>
            <input
              type="text"
              value={filters.accessionNumber}
              onChange={(e) => handleFilterChange('accessionNumber', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Filter by accession"
            />
          </div>
        </div>
      </div>

      {/* Selected Study Details */}
      {selectedStudyDetails && (
        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <div className="bg-blue-600 rounded p-3 mb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-blue-200">MRN:</span>
                <span className="ml-2">{selectedStudyDetails.MainDicomTags.PatientID || 'N/A'}</span>
              </div>
              <div>
                <span className="text-blue-200">Study Date:</span>
                <span className="ml-2">
                  {formatDate(selectedStudyDetails.MainDicomTags.StudyDate)} {formatTime(selectedStudyDetails.MainDicomTags.StudyDate)}
                </span>
              </div>
              <div>
                <span className="text-blue-200">Modality:</span>
                <span className="ml-2">{selectedStudyDetails.MainDicomTags.ModalitiesInStudy || 'N/A'}</span>
              </div>
              <div>
                <span className="text-blue-200">Accession #:</span>
                <span className="ml-2">{selectedStudyDetails.MainDicomTags.AccessionNumber || 'N/A'}</span>
              </div>
            </div>
            <div className="mt-2 flex items-center">
              <span className="text-blue-200">Instances:</span>
              <span className="ml-2">{selectedStudyDetails.Instances?.length || 0}</span>
              <button
                onClick={() => copyToClipboard(String(selectedStudyDetails.Instances?.length || 0))}
                className="ml-2 p-1 hover:bg-blue-700 rounded"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => onViewerAction('basic', selectedStudyDetails.ID)}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center"
            >
              <ArrowRight className="h-3 w-3 mr-1" />
              Basic Viewer
            </button>
            <button
              onClick={() => onViewerAction('segmentation', selectedStudyDetails.ID)}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center"
            >
              <ArrowRight className="h-3 w-3 mr-1" />
              Segmentation
            </button>
            <button
              onClick={() => onViewerAction('annotations', selectedStudyDetails.ID)}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center"
            >
              <ArrowRight className="h-3 w-3 mr-1" />
              US Pleura B-line Annotations
            </button>
            <button
              onClick={() => onViewerAction('metabolic', selectedStudyDetails.ID)}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center"
            >
              <Info className="h-3 w-3 mr-1" />
              Total Metabolic Tumor Volume
            </button>
            <button
              onClick={() => onViewerAction('microscopy', selectedStudyDetails.ID)}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center"
            >
              <Info className="h-3 w-3 mr-1" />
              Microscopy
            </button>
            <button
              onClick={() => onViewerAction('preclinical', selectedStudyDetails.ID)}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 flex items-center"
            >
              <Info className="h-3 w-3 mr-1" />
              Preclinical 4D
            </button>
          </div>

          {/* Series Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 text-gray-300">Description</th>
                  <th className="text-left py-2 text-gray-300">Series</th>
                  <th className="text-left py-2 text-gray-300">Modality</th>
                  <th className="text-left py-2 text-gray-300">Instances</th>
                </tr>
              </thead>
              <tbody>
                {selectedStudySeries.map((series, index) => (
                  <tr key={series.ID} className="border-b border-gray-700">
                    <td className="py-2 text-gray-400">{"(empty)"}</td>
                    <td className="py-2 text-white">{index}</td>
                    <td className="py-2 text-white">{series.MainDicomTags.Modality || 'N/A'}</td>
                    <td className="py-2 text-white">{series.Instances?.length || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Studies List */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700">
                <th className="text-left py-3 px-4 text-gray-300 font-medium"></th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Patient Name</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">MRN</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Study Date</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Time</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Description</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Modality</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Accession #</th>
                <th className="text-left py-3 px-4 text-gray-300 font-medium">Instances</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudies.map((study) => (
                <tr
                  key={study.ID}
                  className={`border-b border-gray-700 hover:bg-gray-700 cursor-pointer transition-colors ${
                    selectedStudy === study.ID ? 'bg-blue-900/20' : ''
                  }`}
                  onClick={() => onStudySelect(study.ID)}
                >
                  <td className="py-3 px-4">
                    <span className="text-blue-400 text-lg">{'>'}</span>
                  </td>
                  <td className="py-3 px-4 text-white">
                    {study.MainDicomTags.PatientName || 'Anonymous'}
                  </td>
                  <td className="py-3 px-4 text-white">
                    {study.MainDicomTags.PatientID || 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-white">
                    {formatDate(study.MainDicomTags.StudyDate)}
                  </td>
                  <td className="py-3 px-4 text-white">
                    {formatTime(study.MainDicomTags.StudyDate)}
                  </td>
                  <td className="py-3 px-4 text-white">
                    {study.MainDicomTags.StudyDescription || ''}
                  </td>
                  <td className="py-3 px-4 text-white">
                    {study.MainDicomTags.ModalitiesInStudy || 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-white">
                    {study.MainDicomTags.AccessionNumber || ''}
                  </td>
                  <td className="py-3 px-4 text-white">
                    <div className="flex items-center">
                      <span>{study.Instances?.length || 0}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          copyToClipboard(String(study.Instances?.length || 0))
                        }}
                        className="ml-2 p-1 hover:bg-gray-600 rounded"
                      >
                        <Copy className="h-4 w-4 text-gray-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
