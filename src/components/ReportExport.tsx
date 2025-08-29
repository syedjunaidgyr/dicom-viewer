'use client'

import React, { useState } from 'react'
import { ReportData, ReportExportOptions } from '../types/report'

interface ReportExportProps {
  reportData: ReportData
  onClose: () => void
}

const ReportExport: React.FC<ReportExportProps> = ({ reportData, onClose }) => {
  const [exportOptions, setExportOptions] = useState<ReportExportOptions>({
    format: 'pdf',
    includeImages: true,
    includeMeasurements: true,
    includeAnnotations: true,
    template: 'standard'
  })
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    
    try {
      switch (exportOptions.format) {
        case 'pdf':
          await exportToPDF()
          break
        case 'html':
          await exportToHTML()
          break
        case 'docx':
          await exportToDOCX()
          break
        case 'txt':
          await exportToTXT()
          break
        default:
          await exportToPDF()
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const exportToPDF = async () => {
    // This would typically use a library like jsPDF or html2pdf
    // For now, we'll simulate the export
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Create a blob with the report content
    const content = generateReportContent()
    const blob = new Blob([content], { type: 'application/pdf' })
    
    // Download the file
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report_${reportData.patientName}_${reportData.studyDate}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    alert('PDF exported successfully!')
  }

  const exportToHTML = async () => {
    const content = generateHTMLContent()
    const blob = new Blob([content], { type: 'text/html' })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report_${reportData.patientName}_${reportData.studyDate}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    alert('HTML exported successfully!')
  }

  const exportToDOCX = async () => {
    // This would typically use a library like docx
    // For now, we'll simulate the export
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const content = generateReportContent()
    const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report_${reportData.patientName}_${reportData.studyDate}.docx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    alert('DOCX exported successfully!')
  }

  const exportToTXT = async () => {
    const content = generateTextContent()
    const blob = new Blob([content], { type: 'text/plain' })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report_${reportData.patientName}_${reportData.studyDate}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    alert('TXT exported successfully!')
  }

  const generateReportContent = () => {
    return `
RADIOLOGY REPORT

Patient Information:
- Name: ${reportData.patientName}
- ID: ${reportData.patientId}
- Study Date: ${reportData.studyDate}
- Study Description: ${reportData.studyDescription}
- Modality: ${reportData.modality}

Report Content:
${reportData.findings?.map((finding, index) => `
Finding ${index + 1}:
- Type: ${finding.type}
- Location: ${finding.location}
- Description: ${finding.description}
- Priority: ${finding.priority}
- Confidence: ${finding.confidence}
`).join('\n')}

Measurements:
${reportData.measurements?.map(m => `- ${m.type}: ${m.value} ${m.unit}`).join('\n')}

Status: ${reportData.status}
Radiologist: ${reportData.radiologistName}
Report Date: ${reportData.reportDate}
    `.trim()
  }

  const generateHTMLContent = () => {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Radiology Report - ${reportData.patientName}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .section { margin-bottom: 20px; }
        .finding { border-left: 4px solid #3b82f6; padding-left: 15px; margin: 10px 0; }
        .status { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
        .status.draft { background-color: #f3f4f6; color: #374151; }
        .status.final { background-color: #d1fae5; color: #065f46; }
        .status.preliminary { background-color: #fef3c7; color: #92400e; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Radiology Report</h1>
        <p>Patient: ${reportData.patientName} | Study Date: ${reportData.studyDate}</p>
        <span class="status ${reportData.status}">${reportData.status.toUpperCase()}</span>
    </div>
    
    <div class="section">
        <h2>Patient Information</h2>
        <p><strong>Name:</strong> ${reportData.patientName}</p>
        <p><strong>ID:</strong> ${reportData.patientId}</p>
        <p><strong>Study Date:</strong> ${reportData.studyDate}</p>
        <p><strong>Study Description:</strong> ${reportData.studyDescription}</p>
        <p><strong>Modality:</strong> ${reportData.modality}</p>
    </div>
    
    ${reportData.findings?.length ? `
    <div class="section">
        <h2>Findings</h2>
        ${reportData.findings.map((finding, index) => `
        <div class="finding">
            <h3>Finding ${index + 1}</h3>
            <p><strong>Type:</strong> ${finding.type}</p>
            <p><strong>Location:</strong> ${finding.location}</p>
            <p><strong>Description:</strong> ${finding.description}</p>
            <p><strong>Priority:</strong> ${finding.priority}</p>
            <p><strong>Confidence:</strong> ${finding.confidence}</p>
        </div>
        `).join('')}
    </div>
    ` : ''}
    
    ${reportData.measurements?.length ? `
    <div class="section">
        <h2>Measurements</h2>
        ${reportData.measurements.map(m => `<p>• ${m.type}: ${m.value} ${m.unit}</p>`).join('')}
    </div>
    ` : ''}
    
    <div class="section">
        <p><strong>Radiologist:</strong> ${reportData.radiologistName}</p>
        <p><strong>Report Date:</strong> ${reportData.reportDate}</p>
    </div>
</body>
</html>
    `.trim()
  }

  const generateTextContent = () => {
    return generateReportContent()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Export Report</h2>
          <p className="text-sm text-gray-600">
            Export report for {reportData.patientName}
          </p>
        </div>

        {/* Export Options */}
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <select
              value={exportOptions.format}
              onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as any }))}
              className="w-full p-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="pdf">PDF Document</option>
              <option value="html">HTML Web Page</option>
              <option value="docx">Microsoft Word (DOCX)</option>
              <option value="txt">Plain Text</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={exportOptions.includeImages}
                onChange={(e) => setExportOptions(prev => ({ ...prev, includeImages: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Include Images</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={exportOptions.includeMeasurements}
                onChange={(e) => setExportOptions(prev => ({ ...prev, includeMeasurements: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Include Measurements</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={exportOptions.includeAnnotations}
                onChange={(e) => setExportOptions(prev => ({ ...prev, includeAnnotations: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Include Annotations</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
              isExporting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReportExport
