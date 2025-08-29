'use client'

import React, { useState } from 'react'
import { ReportSection as ReportSectionType, Finding, Measurement, Annotation } from '../types/report'
import { StudyInfo, Series, Instance } from '../types/dicom'

interface ReportSectionProps {
  section: ReportSectionType
  reportData: any
  studyInfo: StudyInfo
  series: Series[]
  instances: Instance[]
  measurements: Measurement[]
  annotations: Annotation[]
  findings: Finding[]
  onUpdate: (content: any) => void
  onFindingsUpdate: (findings: Finding[]) => void
}

const ReportSection: React.FC<ReportSectionProps> = ({
  section,
  reportData,
  studyInfo,
  series,
  instances,
  measurements,
  annotations,
  findings,
  onUpdate,
  onFindingsUpdate
}) => {
  const [localContent, setLocalContent] = useState(reportData[section.id] || section.template || '')

  const handleContentChange = (content: any) => {
    setLocalContent(content)
    onUpdate(content)
  }

  const renderTextSection = () => (
    <div className="space-y-4">
      <textarea
        value={localContent}
        onChange={(e) => handleContentChange(e.target.value)}
        className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder={section.template || 'Enter content...'}
      />
      {section.template && (
        <div className="text-sm text-gray-500">
          <p className="font-medium">Template:</p>
          <p className="whitespace-pre-wrap">{section.template}</p>
        </div>
      )}
    </div>
  )

  const renderMeasurementsSection = () => (
    <div className="space-y-4">
      {measurements.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No measurements available</p>
          <p className="text-sm">Use the measurement tools in the viewer to add measurements</p>
        </div>
      ) : (
        <div className="space-y-3">
          {measurements.map((measurement) => (
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
      )}
    </div>
  )

  const renderFindingsSection = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-lg font-medium text-gray-900">Findings</h4>
        <button
          onClick={() => {
            const newFinding: Finding = {
              id: `finding-${Date.now()}`,
              type: 'normal',
              location: '',
              description: '',
              measurements: [],
              confidence: 'medium',
              priority: 'medium'
            }
            onFindingsUpdate([...findings, newFinding])
          }}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Add Finding
        </button>
      </div>

      {findings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No findings added yet</p>
          <p className="text-sm">Click "Add Finding" to start documenting findings</p>
        </div>
      ) : (
        <div className="space-y-4">
          {findings.map((finding, index) => (
            <div key={finding.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <h5 className="font-medium text-gray-900">Finding {index + 1}</h5>
                <button
                  onClick={() => {
                    const newFindings = findings.filter(f => f.id !== finding.id)
                    onFindingsUpdate(newFindings)
                  }}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={finding.type}
                    onChange={(e) => {
                      const newFindings = findings.map(f =>
                        f.id === finding.id ? { ...f, type: e.target.value as any } : f
                      )
                      onFindingsUpdate(newFindings)
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="normal">Normal</option>
                    <option value="abnormal">Abnormal</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={finding.priority}
                    onChange={(e) => {
                      const newFindings = findings.map(f =>
                        f.id === finding.id ? { ...f, priority: e.target.value as any } : f
                      )
                      onFindingsUpdate(newFindings)
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={finding.location}
                    onChange={(e) => {
                      const newFindings = findings.map(f =>
                        f.id === finding.id ? { ...f, location: e.target.value } : f
                      )
                      onFindingsUpdate(newFindings)
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    placeholder="e.g., Right upper lobe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confidence
                  </label>
                  <select
                    value={finding.confidence}
                    onChange={(e) => {
                      const newFindings = findings.map(f =>
                        f.id === finding.id ? { ...f, confidence: e.target.value as any } : f
                      )
                      onFindingsUpdate(newFindings)
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={finding.description}
                  onChange={(e) => {
                    const newFindings = findings.map(f =>
                      f.id === finding.id ? { ...f, description: e.target.value } : f
                    )
                    onFindingsUpdate(newFindings)
                  }}
                  className="w-full p-2 border border-gray-300 rounded-md text-sm"
                  rows={3}
                  placeholder="Describe the finding in detail..."
                />
              </div>

              {/* Associated measurements */}
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Associated Measurements
                </label>
                <div className="space-y-2">
                  {measurements
                    .filter(m => m.seriesId)
                    .map((measurement) => (
                      <label key={measurement.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={finding.measurements.some(m => m.id === measurement.id)}
                          onChange={(e) => {
                            const newFindings = findings.map(f => {
                              if (f.id === finding.id) {
                                if (e.target.checked) {
                                  return { ...f, measurements: [...f.measurements, measurement] }
                                } else {
                                  return { ...f, measurements: f.measurements.filter(m => m.id !== measurement.id) }
                                }
                              }
                              return f
                            })
                            onFindingsUpdate(newFindings)
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          {measurement.type}: {measurement.value} {measurement.unit}
                        </span>
                      </label>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderImagesSection = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {series.map((s) => (
          <div key={s.ID} className="border border-gray-200 rounded-lg p-3">
            <h5 className="font-medium text-sm text-gray-900 mb-2">
              Series {s.MainDicomTags?.SeriesNumber || 'N/A'}
            </h5>
            <p className="text-xs text-gray-600 mb-2">
              {s.MainDicomTags?.SeriesDescription || 'No description'}
            </p>
            <p className="text-xs text-gray-500">
              {s.MainDicomTags?.Modality || 'Unknown'} - {s.Instances.length} images
            </p>
          </div>
        ))}
      </div>
    </div>
  )

  const renderTableSection = () => (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Series
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Modality
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Images
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {series.map((s) => (
              <tr key={s.ID}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {s.MainDicomTags?.SeriesNumber || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {s.MainDicomTags?.Modality || 'Unknown'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {s.Instances.length}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {s.MainDicomTags?.SeriesDescription || 'No description'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  const renderSignatureSection = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Radiologist Name
        </label>
        <input
          type="text"
          value={reportData.radiologistName || ''}
          onChange={(e) => onUpdate({ radiologistName: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md text-sm"
          placeholder="Enter radiologist name"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Report Date
        </label>
        <input
          type="date"
          value={reportData.reportDate || new Date().toISOString().split('T')[0]}
          onChange={(e) => onUpdate({ reportDate: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          value={reportData.status || 'draft'}
          onChange={(e) => onUpdate({ status: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-md text-sm"
        >
          <option value="draft">Draft</option>
          <option value="preliminary">Preliminary</option>
          <option value="final">Final</option>
        </select>
      </div>
    </div>
  )

  const renderSectionContent = () => {
    switch (section.type) {
      case 'text':
        return renderTextSection()
      case 'measurements':
        return renderMeasurementsSection()
      case 'findings':
        return renderFindingsSection()
      case 'images':
        return renderImagesSection()
      case 'table':
        return renderTableSection()
      case 'signature':
        return renderSignatureSection()
      default:
        return renderTextSection()
    }
  }

  return (
    <div className="space-y-6">
      {renderSectionContent()}
    </div>
  )
}

export default ReportSection
