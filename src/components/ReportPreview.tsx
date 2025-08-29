'use client'

import React from 'react'
import { ReportData, ReportTemplate } from '../types/report'

interface ReportPreviewProps {
  reportData: ReportData
  template: ReportTemplate
  onEdit: () => void
}

const ReportPreview: React.FC<ReportPreviewProps> = ({ reportData, template, onEdit }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'final':
        return 'bg-green-100 text-green-800'
      case 'preliminary':
        return 'bg-yellow-100 text-yellow-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const renderSectionContent = (sectionId: string) => {
    const content = reportData[sectionId as keyof ReportData]
    
    if (!content) return <span className="text-gray-400 italic">Not filled</span>
    
    if (typeof content === 'string') {
      return <div className="whitespace-pre-wrap">{content}</div>
    }
    
    if (Array.isArray(content)) {
      return (
        <div className="space-y-2">
          {content.map((item, index) => (
            <div key={index} className="text-sm">
              {JSON.stringify(item, null, 2)}
            </div>
          ))}
        </div>
      )
    }
    
    return <div>{String(content)}</div>
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Radiology Report</h1>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
            <span>Template: {template.name}</span>
            <span>•</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reportData.status)}`}>
              {reportData.status.charAt(0).toUpperCase() + reportData.status.slice(1)}
            </span>
          </div>
        </div>

        {/* Patient Information */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Patient Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Patient Name</label>
              <p className="text-gray-900">{reportData.patientName || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Patient ID</label>
              <p className="text-gray-900">{reportData.patientId || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Study Date</label>
              <p className="text-gray-900">{formatDate(reportData.studyDate)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Study Description</label>
              <p className="text-gray-900">{reportData.studyDescription || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Modality</label>
              <p className="text-gray-900">{reportData.modality || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Series Count</label>
              <p className="text-gray-900">{reportData.seriesCount || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="space-y-6">
          {template.sections
            .sort((a, b) => a.order - b.order)
            .map((section) => (
              <div key={section.id} className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{section.title}</h3>
                
                {section.type === 'findings' && reportData.findings && reportData.findings.length > 0 ? (
                  <div className="space-y-4">
                    {reportData.findings.map((finding, index) => (
                      <div key={finding.id} className="border-l-4 border-blue-500 pl-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">Finding {index + 1}</h4>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              finding.type === 'critical' ? 'bg-red-100 text-red-800' :
                              finding.type === 'abnormal' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {finding.type.charAt(0).toUpperCase() + finding.type.slice(1)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              finding.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                              finding.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                              finding.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {finding.priority.charAt(0).toUpperCase() + finding.priority.slice(1)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Location:</span>
                            <span className="ml-2 text-gray-900">{finding.location || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Confidence:</span>
                            <span className="ml-2 text-gray-900 capitalize">{finding.confidence || 'N/A'}</span>
                          </div>
                        </div>
                        
                        <p className="text-gray-900 mb-2">{finding.description || 'No description provided'}</p>
                        
                        {finding.measurements && finding.measurements.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">Associated Measurements:</p>
                            <div className="space-y-1">
                              {finding.measurements.map((measurement) => (
                                <div key={measurement.id} className="text-sm text-gray-600">
                                  • {measurement.type}: {measurement.value} {measurement.unit}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : section.type === 'measurements' && reportData.measurements && reportData.measurements.length > 0 ? (
                  <div className="space-y-3">
                    {reportData.measurements.map((measurement) => (
                      <div key={measurement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: measurement.color }}
                          ></div>
                          <div>
                            <p className="font-medium text-sm">{measurement.type}</p>
                            <p className="text-xs text-gray-600">
                              {measurement.label || `Measurement ${measurement.id}`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {measurement.value && (
                            <p className="font-medium text-sm">
                              {measurement.value} {measurement.unit}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            Series: {measurement.seriesId || 'N/A'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-900">
                    {renderSectionContent(section.id)}
                  </div>
                )}
              </div>
            ))}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              <p>Generated on: {formatDate(reportData.reportDate)}</p>
              {reportData.radiologistName && (
                <p>Radiologist: {reportData.radiologistName}</p>
              )}
            </div>
            <button
              onClick={onEdit}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Edit Report
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportPreview
