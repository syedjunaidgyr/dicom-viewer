'use client'

import React, { useEffect, useState } from 'react'
import { Search, FileText, User, Calendar, Activity, Eye, Download } from 'lucide-react'
import Link from 'next/link'
import Navigation from '../../components/Navigation'

interface Study {
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

const StudiesPage: React.FC = () => {
  const [studies, setStudies] = useState<Study[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'modality'>('date')

  useEffect(() => {
    loadStudies()
  }, [])

  const loadStudies = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // First, get the list of study IDs
      const response = await fetch('http://192.168.1.2:8080/orthanc/studies')
      if (!response.ok) {
        throw new Error('Failed to fetch studies')
      }

      const studyIds = await response.json()
      console.log('Study IDs received:', studyIds)
      
      // Filter out invalid IDs
      const validStudyIds = studyIds.filter((id: any) => 
        id && typeof id === 'string' && id.length > 0
      )
      
      if (validStudyIds.length === 0) {
        setStudies([])
        return
      }
      
      // Fetch full study details for each ID
      setIsLoadingDetails(true)
      const studyPromises = validStudyIds.map(async (studyId: string) => {
        try {
          const studyResponse = await fetch(`http://192.168.1.2:8080/orthanc/studies/${studyId}`)
          if (studyResponse.ok) {
            const studyData = await studyResponse.json()
            return studyData
          } else {
            console.warn(`Failed to fetch study ${studyId}:`, studyResponse.status)
            return null
          }
        } catch (err) {
          console.warn(`Error fetching study ${studyId}:`, err)
          return null
        }
      })
      
      const studyResults = await Promise.all(studyPromises)
      const validStudies = studyResults.filter(study => study !== null)
      
      console.log('Full studies loaded:', validStudies)
      setStudies(validStudies)
      setIsLoadingDetails(false)
    } catch (err) {
      console.error('Failed to load studies:', err)
      setError('Failed to load studies')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString?: string) => {
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getTotalFileSize = (study: Study) => {
    // This would need to be calculated from actual instance data
    // For now, we'll estimate based on series count
    return study.Series.length * 50 * 1024 * 1024 // Estimate 50MB per series
  }

  const filteredAndSortedStudies = studies
    .filter(study => {
      if (!searchTerm) return true
      const searchLower = searchTerm.toLowerCase()
      return (
        study.MainDicomTags?.PatientName?.toLowerCase().includes(searchLower) ||
        study.MainDicomTags?.StudyDescription?.toLowerCase().includes(searchLower) ||
        study.MainDicomTags?.PatientID?.toLowerCase().includes(searchLower) ||
        study.MainDicomTags?.ModalitiesInStudy?.toLowerCase().includes(searchLower)
      )
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return (b.MainDicomTags?.StudyDate || '').localeCompare(a.MainDicomTags?.StudyDate || '')
        case 'name':
          return (a.MainDicomTags?.PatientName || '').localeCompare(b.MainDicomTags?.PatientName || '')
        case 'modality':
          return (a.MainDicomTags?.ModalitiesInStudy || '').localeCompare(b.MainDicomTags?.ModalitiesInStudy || '')
        default:
          return 0
      }
    })

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-8 text-center max-w-md">
          <div className="text-red-500 mb-4">
            <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Studies</h3>
          <p className="text-gray-500 mb-4">{error}</p>
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
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation 
        title="DICOM Studies" 
        subtitle={`${studies.length} ${studies.length === 1 ? 'Study' : 'Studies'} Available`}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by patient name, study description, or modality..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'modality')}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="date">Date</option>
                <option value="name">Patient Name</option>
                <option value="modality">Modality</option>
              </select>
            </div>
          </div>
        </div>

        {/* Debug Info - Remove in production */}
        {process.env.NODE_ENV === 'development' && studies.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">Debug Info (Development)</h4>
            <div className="text-xs text-yellow-700">
              <div>Total studies loaded: {studies.length}</div>
              <div>First study ID: {studies[0]?.ID || 'No ID'}</div>
              <div>First study type: {typeof studies[0]}</div>
              <div>First study keys: {studies[0] ? Object.keys(studies[0]).join(', ') : 'No keys'}</div>
              <div>First study MainDicomTags: {studies[0]?.MainDicomTags ? Object.keys(studies[0].MainDicomTags).join(', ') : 'No MainDicomTags'}</div>
            </div>
          </div>
        )}

        {/* Studies Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading studies...</p>
            </div>
          </div>
        ) : isLoadingDetails ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading study details...</p>
            </div>
          </div>
        ) : filteredAndSortedStudies.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No studies found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms.' : 'No studies are currently available.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedStudies.map((study) => (
              <div
                key={study.ID}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  {/* Study Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                                           <h3 className="text-lg font-semibold text-gray-900 mb-1">
                       {study.MainDicomTags?.StudyDescription || study.ID?.substring(0, 8) || 'Unnamed Study'}
                     </h3>
                     <p className="text-sm text-gray-500">
                       Study ID: {study.ID ? study.ID.substring(0, 8) + '...' : 'Unknown'}
                     </p>
                    </div>
                  </div>

                  {/* Patient Info */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">Patient:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {study.MainDicomTags?.PatientName || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">Date:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {formatDate(study.MainDicomTags?.StudyDate)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Activity className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">Modality:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {study.MainDicomTags?.ModalitiesInStudy || 'Unknown'}
                      </span>
                    </div>
                  </div>

                  {/* Study Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-semibold text-gray-900">
                        {Array.isArray(study.Series) ? study.Series.length : 0}
                      </div>
                      <div className="text-gray-500">Series</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-semibold text-gray-900">
                        {Array.isArray(study.Instances) ? study.Instances.length : 0}
                      </div>
                      <div className="text-gray-500">Instances</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                                         <Link
                       href={study.ID ? `/viewer/${study.ID}` : '#'}
                       className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                       onClick={(e) => {
                         if (!study.ID) {
                           e.preventDefault()
                           alert('Invalid study ID')
                         }
                       }}
                     >
                       <Eye className="h-4 w-4 mr-2" />
                       View Study
                     </Link>
                                         <button
                       onClick={() => {
                         if (study.ID) {
                           // Download functionality would go here
                           console.log('Download study:', study.ID)
                         } else {
                           alert('Invalid study ID')
                         }
                       }}
                       className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                       title="Download Study"
                       disabled={!study.ID}
                     >
                       <Download className="h-4 w-4" />
                     </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default StudiesPage
