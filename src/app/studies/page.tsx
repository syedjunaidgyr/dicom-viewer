'use client'

import React, { useState, useMemo, useCallback } from 'react'
import EnhancedStudyList from '../../components/EnhancedStudyList'
import ButtonEvaluator from '../../components/ButtonEvaluator'
import CornerstoneViewer from '../../components/CornerstoneViewer'
import Navigation from '../../components/Navigation'

export default function StudiesPage() {
  const [selectedStudy, setSelectedStudy] = useState<string | null>(null)
  const [buttonStates, setButtonStates] = useState<Record<string, boolean>>({})
  const [viewerMode, setViewerMode] = useState<'basic' | 'segmentation' | 'annotations' | 'metabolic' | 'microscopy' | 'preclinical' | null>(null)
  const [showViewer, setShowViewer] = useState(false)

  // Memoize the study object to prevent unnecessary re-renders
  const studyObject = useMemo(() => {
    if (!selectedStudy) return null
    return { ID: selectedStudy }
  }, [selectedStudy])

  const handleStudySelect = useCallback((studyId: string) => {
    setSelectedStudy(studyId)
    setShowViewer(false)
    setViewerMode(null)
  }, [])

  const handleViewerAction = useCallback((action: string, studyId: string) => {
    if (buttonStates[action]) {
      setViewerMode(action as 'basic' | 'segmentation' | 'annotations' | 'metabolic' | 'microscopy' | 'preclinical')
      setShowViewer(true)
    }
  }, [buttonStates])

  const handleButtonStateChange = useCallback((states: Record<string, boolean>) => {
    setButtonStates(states)
  }, [])

  const handleBackToList = useCallback(() => {
    setShowViewer(false)
    setViewerMode(null)
  }, [])

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation 
        showBackButton={true}
        backUrl="/"
        title="Study List"
        subtitle="Browse and analyze DICOM studies"
      />

      {!showViewer ? (
        <div className="relative">
          {/* Button Evaluator - invisible component that manages button states */}
          <ButtonEvaluator
            study={studyObject}
            onButtonStateChange={handleButtonStateChange}
          />

          {/* Enhanced Study List */}
          <EnhancedStudyList
            onStudySelect={handleStudySelect}
            onViewerAction={handleViewerAction}
            selectedStudy={selectedStudy}
          />
        </div>
      ) : (
        <div className="p-6">
          <div className="mb-6">
            <button
              onClick={handleBackToList}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
            >
              ← Back to Study List
            </button>
          </div>

          {viewerMode && selectedStudy && (
            <CornerstoneViewer
              studyId={selectedStudy}
              mode={viewerMode}
              onViewerReady={() => console.log('Viewer ready')}
            />
          )}
        </div>
      )}
    </div>
  )
}
