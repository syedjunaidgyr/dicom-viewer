'use client'

import { useState, useEffect } from 'react'
import { FileText, Calendar, User, Download, Eye } from 'lucide-react'

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

interface StudyListProps {
  onStudySelect: (studyId: string) => void
  selectedStudy?: string | null
  patientId?: string
}

export default function StudyList({ onStudySelect, selectedStudy, patientId }: StudyListProps) {
  const [studies, setStudies] = useState<Study[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadStudies()
  }, [patientId])

  const loadStudies = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      let url = 'http://192.168.1.2:8080/orthanc/studies'
      if (patientId) {
        url = `http://192.168.1.2:8080/orthanc/patients/${patientId}/studies`
      }
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Failed to fetch studies')
      }
      
      const studyIds = await response.json()
      
      // Fetch detailed information for each study
      const studyPromises = studyIds.map(async (studyId: string) => {
        const studyResponse = await fetch(`http://192.168.1.2:8080/orthanc/studies/${studyId}`)
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

  const filteredStudies = studies.filter(study => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    const studyDesc = study.MainDicomTags.StudyDescription?.toLowerCase() || ''
    const patientName = study.MainDicomTags.PatientName?.toLowerCase() || ''
    const patientId = study.MainDicomTags.PatientID?.toLowerCase() || ''
    
    return studyDesc.includes(searchLower) || 
           patientName.includes(searchLower) || 
           patientId.includes(searchLower)
  })

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown'
    try {
      const year = dateString.substring(0, 4)
      const month = dateString.substring(4, 6)
      const day = dateString.substring(6, 8)
      return `${month}/${day}/${year}`
    } catch {
      return dateString
    }
  }

  const downloadStudy = async (studyId: string) => {
    try {
      const response = await fetch(`http://192.168.1.2:8080/orthanc/studies/${studyId}/archive`)
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

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-red-600">
          <p className="mb-2">{error}</p>
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
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            {patientId ? 'Patient Studies' : 'All Studies'}
          </h3>
          <span className="text-sm text-gray-500">{studies.length} studies</span>
        </div>
        
        {/* Search */}
        <div className="mt-3">
          <input
            type="text"
            placeholder="Search studies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Studies List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredStudies.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchTerm ? 'No studies found matching your search.' : 'No studies available.'}
          </div>
        ) : (
          filteredStudies.map((study) => (
            <div
              key={study.ID}
              className={`border-b border-gray-100 p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                selectedStudy === study.ID ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
              onClick={() => onStudySelect(study.ID)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <h4 className="font-medium text-gray-900">
                      {study.MainDicomTags.StudyDescription || 'Unnamed Study'}
                    </h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(study.MainDicomTags.StudyDate)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <User className="h-3 w-3" />
                      <span>{study.MainDicomTags.PatientName || 'Unknown'}</span>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-500">
                    {study.Series?.length || 0} series • {study.Instances?.length || 0} instances
                    {study.MainDicomTags.ModalitiesInStudy && (
                      <span className="ml-2">
                        • {study.MainDicomTags.ModalitiesInStudy}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      downloadStudy(study.ID)
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    title="Download Study"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onStudySelect(study.ID)
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    title="View Study"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
