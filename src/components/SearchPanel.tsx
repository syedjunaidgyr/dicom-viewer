'use client'

import { useState } from 'react'
import { Search, FileText, User, Calendar, Filter, Download } from 'lucide-react'

interface SearchResult {
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

export default function SearchPanel() {
  const [searchLevel, setSearchLevel] = useState<'Study' | 'Series' | 'Instance'>('Study')
  const [searchQuery, setSearchQuery] = useState({
    PatientName: '',
    PatientID: '',
    StudyDescription: '',
    StudyDate: '',
    Modality: '',
    SeriesDescription: '',
    SOPClassUID: ''
  })
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    try {
      setIsSearching(true)
      setError(null)
      
      // Build query object based on search level
      const query: any = {}
      
      if (searchQuery.PatientName) query.PatientName = searchQuery.PatientName
      if (searchQuery.PatientID) query.PatientID = searchQuery.PatientID
      if (searchQuery.StudyDescription) query.StudyDescription = searchQuery.StudyDescription
      if (searchQuery.StudyDate) query.StudyDate = searchQuery.StudyDate
      if (searchQuery.Modality) query.Modality = searchQuery.Modality
      if (searchQuery.SeriesDescription) query.SeriesDescription = searchQuery.SeriesDescription
      if (searchQuery.SOPClassUID) query.SOPClassUID = searchQuery.SOPClassUID

      const searchPayload = {
        Level: searchLevel,
        Query: query,
        Expand: true
      }

      const response = await fetch('http://localhost:8080/orthanc/tools/find', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchPayload),
      })

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const searchResults = await response.json()
      setResults(searchResults)
      
    } catch (err) {
      setError('Search failed. Please try again.')
      console.error(err)
    } finally {
      setIsSearching(false)
    }
  }

  const clearSearch = () => {
    setSearchQuery({
      PatientName: '',
      PatientID: '',
      StudyDescription: '',
      StudyDate: '',
      Modality: '',
      SeriesDescription: '',
      SOPClassUID: ''
    })
    setResults([])
    setError(null)
  }

  const downloadResult = async (resultId: string) => {
    try {
      let url = ''
      if (searchLevel === 'Study') {
        url = `http://localhost:8080/orthanc/studies/${resultId}/archive`
      } else if (searchLevel === 'Series') {
        url = `http://localhost:8080/orthanc/series/${resultId}/archive`
      } else {
        url = `http://localhost:8080/orthanc/instances/${resultId}/file`
      }

      const response = await fetch(url)
      if (response.ok) {
        const blob = await response.blob()
        const downloadUrl = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = downloadUrl
        a.download = `${searchLevel.toLowerCase()}-${resultId}.zip`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(downloadUrl)
        document.body.removeChild(a)
      }
    } catch (err) {
      console.error('Failed to download:', err)
    }
  }

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

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Advanced DICOM Search</h3>
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">Advanced Search</span>
          </div>
        </div>

        {/* Search Level Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Level
          </label>
          <div className="flex space-x-4">
            {(['Study', 'Series', 'Instance'] as const).map((level) => (
              <label key={level} className="flex items-center">
                <input
                  type="radio"
                  name="searchLevel"
                  value={level}
                  checked={searchLevel === level}
                  onChange={(e) => setSearchLevel(e.target.value as any)}
                  className="mr-2 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{level}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Search Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient Name
            </label>
            <input
              type="text"
              value={searchQuery.PatientName}
              onChange={(e) => setSearchQuery({ ...searchQuery, PatientName: e.target.value })}
              placeholder="Enter patient name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Patient ID
            </label>
            <input
              type="text"
              value={searchQuery.PatientID}
              onChange={(e) => setSearchQuery({ ...searchQuery, PatientID: e.target.value })}
              placeholder="Enter patient ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Study Description
            </label>
            <input
              type="text"
              value={searchQuery.StudyDescription}
              onChange={(e) => setSearchQuery({ ...searchQuery, StudyDescription: e.target.value })}
              placeholder="Enter study description"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Study Date
            </label>
            <input
              type="text"
              value={searchQuery.StudyDate}
              onChange={(e) => setSearchQuery({ ...searchQuery, StudyDate: e.target.value })}
              placeholder="YYYYMMDD"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Modality
            </label>
            <input
              type="text"
              value={searchQuery.Modality}
              onChange={(e) => setSearchQuery({ ...searchQuery, Modality: e.target.value })}
              placeholder="CT, MR, XR, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Series Description
            </label>
            <input
              type="text"
              value={searchQuery.SeriesDescription}
              onChange={(e) => setSearchQuery({ ...searchQuery, SeriesDescription: e.target.value })}
              placeholder="Enter series description"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Search className="h-4 w-4 mr-2" />
            {isSearching ? 'Searching...' : 'Search'}
          </button>
          <button
            onClick={clearSearch}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Search Results */}
      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200 p-4">
            <h4 className="text-lg font-medium text-gray-900">
              Search Results ({results.length})
            </h4>
          </div>
          
          <div className="divide-y divide-gray-200">
            {results.map((result) => (
              <div key={result.ID} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <h5 className="font-medium text-gray-900">
                        {result.MainDicomTags.StudyDescription || 'Unnamed Study'}
                      </h5>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{result.MainDicomTags.PatientName || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(result.MainDicomTags.StudyDate)}</span>
                      </div>
                      <div>
                        ID: {result.MainDicomTags.PatientID || 'Unknown'}
                      </div>
                      <div>
                        {result.Series?.length || 0} series • {result.Instances?.length || 0} instances
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => downloadResult(result.ID)}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                    title="Download"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-red-400">
              <Search className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Search Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
