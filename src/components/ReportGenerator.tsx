'use client'

import React, { useState, useEffect } from 'react'
import { ReportData, ReportTemplate, Finding, Measurement, Annotation } from '../types/report'
import { reportTemplates, getTemplateByModality, getTemplateById } from '../config/reportTemplates'
import { StudyInfo, Series, Instance } from '../types/dicom'
import ReportSection from './ReportSection'
import ReportPreview from './ReportPreview'
import ReportExport from './ReportExport'

interface ReportGeneratorProps {
  studyInfo: StudyInfo | null
  series: Series[]
  instances: Instance[]
  measurements: Measurement[]
  annotations: Annotation[]
  onClose: () => void
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  studyInfo,
  series,
  instances,
  measurements,
  annotations,
  onClose
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null)
  const [reportData, setReportData] = useState<Partial<ReportData>>({})
  const [currentSection, setCurrentSection] = useState(0)
  const [showPreview, setShowPreview] = useState(false)
  const [findings, setFindings] = useState<Finding[]>([])

  useEffect(() => {
    if (studyInfo && series.length > 0) {
      const modality = series[0]?.MainDicomTags?.Modality || 'Unknown'
      const template = getTemplateByModality(modality)
      setSelectedTemplate(template)
      
      // Initialize report data
      setReportData({
        studyId: studyInfo.ID,
        patientId: studyInfo.MainDicomTags?.PatientID || '',
        patientName: studyInfo.MainDicomTags?.PatientName || '',
        studyDate: studyInfo.MainDicomTags?.StudyDate || '',
        studyDescription: studyInfo.MainDicomTags?.StudyDescription || '',
        modality: modality,
        seriesCount: series.length,
        instanceCount: instances.length,
        measurements: measurements,
        annotations: annotations,
        findings: [],
        conclusion: '',
        recommendations: '',
        radiologistName: '',
        reportDate: new Date().toISOString().split('T')[0],
        status: 'draft'
      })
    }
  }, [studyInfo, series, instances, measurements, annotations])

  const handleSectionUpdate = (sectionId: string, content: any) => {
    setReportData(prev => ({
      ...prev,
      [sectionId]: content
    }))
  }

  const handleFindingsUpdate = (newFindings: Finding[]) => {
    setFindings(newFindings)
    setReportData(prev => ({
      ...prev,
      findings: newFindings
    }))
  }

  const handleNextSection = () => {
    if (selectedTemplate && currentSection < selectedTemplate.sections.length - 1) {
      setCurrentSection(currentSection + 1)
    }
  }

  const handlePreviousSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    }
  }

  const handleTemplateChange = (templateId: string) => {
    const template = getTemplateById(templateId)
    if (template) {
      setSelectedTemplate(template)
      setCurrentSection(0)
    }
  }

  const handleSaveReport = () => {
    // Save report logic here
    console.log('Saving report:', reportData)
    // You can implement API call to save the report
  }

  const handleFinalizeReport = () => {
    setReportData(prev => ({
      ...prev,
      status: 'final'
    }))
    handleSaveReport()
  }

  if (!selectedTemplate || !studyInfo) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-center">Loading report template...</p>
        </div>
      </div>
    )
  }

  const currentSectionData = selectedTemplate.sections[currentSection]
  const isLastSection = currentSection === selectedTemplate.sections.length - 1
  const isFirstSection = currentSection === 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Generate Report</h2>
            <p className="text-sm text-gray-600">
              {studyInfo.MainDicomTags?.PatientName} - {studyInfo.MainDicomTags?.StudyDescription}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {showPreview ? 'Edit' : 'Preview'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>

        <div className="flex h-full">
          {/* Template Selection Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Report Template</h3>
            <select
              value={selectedTemplate.id}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            >
              {reportTemplates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
            
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Template Sections</h4>
              <div className="space-y-1">
                {selectedTemplate.sections.map((section, index) => (
                  <button
                    key={section.id}
                    onClick={() => setCurrentSection(index)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                      index === currentSection
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {showPreview ? (
              <ReportPreview
                reportData={reportData as ReportData}
                template={selectedTemplate}
                onEdit={() => setShowPreview(false)}
              />
            ) : (
              <>
                {/* Section Content */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {currentSectionData.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {currentSectionData.required ? 'Required' : 'Optional'} section
                    </p>
                  </div>

                  <ReportSection
                    section={currentSectionData}
                    reportData={reportData}
                    studyInfo={studyInfo}
                    series={series}
                    instances={instances}
                    measurements={measurements}
                    annotations={annotations}
                    findings={findings}
                    onUpdate={(content) => handleSectionUpdate(currentSectionData.id, content)}
                    onFindingsUpdate={handleFindingsUpdate}
                  />
                </div>

                {/* Navigation Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      Section {currentSection + 1} of {selectedTemplate.sections.length}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handlePreviousSection}
                      disabled={isFirstSection}
                      className={`px-4 py-2 text-sm font-medium rounded-md ${
                        isFirstSection
                          ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      Previous
                    </button>
                    
                    {isLastSection ? (
                      <div className="flex space-x-3">
                        <button
                          onClick={handleSaveReport}
                          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                          Save Draft
                        </button>
                        <button
                          onClick={handleFinalizeReport}
                          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                        >
                          Finalize Report
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleNextSection}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                      >
                        Next
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportGenerator
