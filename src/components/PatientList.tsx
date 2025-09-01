'use client'

import { useState, useEffect } from 'react'
import { User, Calendar, FileText, Download, Eye } from 'lucide-react'

interface Patient {
  ID: string
  MainDicomTags: {
    PatientName?: string
    PatientID?: string
    PatientBirthDate?: string
    PatientSex?: string
  }
  Studies: string[]
}

interface PatientListProps {
  onPatientSelect: (patientId: string) => void
  selectedPatient?: string | null
}

export default function PatientList({ onPatientSelect, selectedPatient }: PatientListProps) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadPatients()
  }, [])

  const loadPatients = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('http://192.168.1.2:8080/orthanc/patients')
      if (!response.ok) {
        throw new Error('Failed to fetch patients')
      }
      
      const patientIds = await response.json()
      
      // Fetch detailed information for each patient
      const patientPromises = patientIds.map(async (patientId: string) => {
        const patientResponse = await fetch(`http://192.168.1.2:8080/orthanc/patients/${patientId}`)
        if (patientResponse.ok) {
          return patientResponse.json()
        }
        return null
      })
      
      const patientDetails = await Promise.all(patientPromises)
      const validPatients = patientDetails.filter(patient => patient !== null)
      setPatients(validPatients)
      
    } catch (err) {
      setError('Failed to load patients')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredPatients = patients.filter(patient => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    const patientName = patient.MainDicomTags.PatientName?.toLowerCase() || ''
    const patientId = patient.MainDicomTags.PatientID?.toLowerCase() || ''
    
    return patientName.includes(searchLower) || patientId.includes(searchLower)
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

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return 'Unknown'
    try {
      const year = parseInt(birthDate.substring(0, 4))
      const month = parseInt(birthDate.substring(4, 6))
      const day = parseInt(birthDate.substring(6, 8))
      const birth = new Date(year, month - 1, day)
      const today = new Date()
      let age = today.getFullYear() - birth.getFullYear()
      const monthDiff = today.getMonth() - birth.getMonth()
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--
      }
      
      return age.toString()
    } catch {
      return 'Unknown'
    }
  }

  const downloadPatient = async (patientId: string) => {
    try {
      const response = await fetch(`http://192.168.1.2:8080/orthanc/patients/${patientId}/archive`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `patient-${patientId}.zip`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (err) {
      console.error('Failed to download patient data:', err)
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
            onClick={loadPatients}
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
          <h3 className="text-lg font-medium text-gray-900">Patients</h3>
          <span className="text-sm text-gray-500">{patients.length} patients</span>
        </div>
        
        {/* Search */}
        <div className="mt-3">
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Patients List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredPatients.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchTerm ? 'No patients found matching your search.' : 'No patients available.'}
          </div>
        ) : (
          filteredPatients.map((patient) => (
            <div
              key={patient.ID}
              className={`border-b border-gray-100 p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                selectedPatient === patient.ID ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
              onClick={() => onPatientSelect(patient.ID)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="h-4 w-4 text-green-600" />
                    <h4 className="font-medium text-gray-900">
                      {patient.MainDicomTags.PatientName || 'Unknown Patient'}
                    </h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(patient.MainDicomTags.PatientBirthDate)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {patient.MainDicomTags.PatientSex || 'Unknown'} • {calculateAge(patient.MainDicomTags.PatientBirthDate)}y
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <FileText className="h-3 w-3" />
                      <span>{patient.Studies?.length || 0} studies</span>
                    </div>
                    <div className="mt-1">
                      ID: {patient.MainDicomTags.PatientID || 'Unknown'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      downloadPatient(patient.ID)
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    title="Download Patient Data"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onPatientSelect(patient.ID)
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    title="View Patient Studies"
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
