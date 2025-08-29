'use client'

import React from 'react'
import { Download, Layers, Image } from 'lucide-react'
import { StudyInfo } from '../types/dicom'

interface StudyHeaderProps {
  studyInfo: StudyInfo | null
  currentSeriesCount?: number
  currentInstanceCount?: number
  downloadStudy: () => void
}

const StudyHeader: React.FC<StudyHeaderProps> = ({ 
  studyInfo, 
  currentSeriesCount = 0,
  currentInstanceCount = 0,
  downloadStudy 
}) => {
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

  if (!studyInfo) return null

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-medium text-gray-900 truncate">
          {studyInfo.MainDicomTags?.StudyDescription || 'Unnamed Study'}
        </h3>
        <div className="text-xs text-gray-600 mt-1">
          <div className="flex items-center space-x-2">
            <span className="truncate">Patient: {studyInfo.MainDicomTags?.PatientName || 'Unknown'}</span>
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <span>Date: {formatDate(studyInfo.MainDicomTags?.StudyDate)}</span>
            <span>ID: {studyInfo.MainDicomTags?.PatientID || 'Unknown'}</span>
          </div>
        </div>
        <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
          <span className="flex items-center">
            <Layers className="h-3 w-3 mr-1" />
            {currentSeriesCount} Series
          </span>
          <span className="flex items-center">
            <Image className="h-3 w-3 mr-1" />
            {currentInstanceCount} Images
          </span>
        </div>
      </div>
      <button
        onClick={downloadStudy}
        className="w-full flex items-center justify-center px-2 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
      >
        <Download className="h-3 w-3 mr-1" />
        Download Study
      </button>
    </div>
  )
}

export default StudyHeader
