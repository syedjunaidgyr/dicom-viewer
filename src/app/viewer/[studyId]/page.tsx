'use client'

import React from 'react'
import DicomViewer from '../../../components/DicomViewer'
import Navigation from '../../../components/Navigation'

interface ViewerPageProps {
  params: Promise<{
    studyId: string
  }>
}

const ViewerPage: React.FC<ViewerPageProps> = ({ params }) => {
  const { studyId } = React.use(params)

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      {/* Navigation */}
      <Navigation 
        showBackButton={true}
        backUrl="/studies"
        title="DICOM Viewer"
        subtitle={`Study ID: ${studyId.substring(0, 8)}...`}
      />

      {/* DICOM Viewer */}
      <div className="w-full h-full">
        <DicomViewer studyId={studyId} />
      </div>
    </div>
  )
}

export default ViewerPage
