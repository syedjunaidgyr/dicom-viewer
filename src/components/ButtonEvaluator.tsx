'use client'

import React, { useEffect, useState } from 'react'

interface SimpleStudy {
  ID: string
}

interface FullStudy {
  ID: string
  MainDicomTags: {
    StudyDate?: string
    StudyDescription?: string
    PatientName?: string
    PatientID?: string
    ModalitiesInStudy?: string
    AccessionNumber?: string
  }
  Series: string[]
  Instances: string[]
}

interface ButtonEvaluatorProps {
  study: SimpleStudy | null
  onButtonStateChange: (buttonStates: Record<string, boolean>) => void
}

export default function ButtonEvaluator({ study, onButtonStateChange }: ButtonEvaluatorProps) {
  const [fullStudy, setFullStudy] = useState<FullStudy | null>(null)

  // Fetch full study details when study ID changes
  useEffect(() => {
    if (!study) {
      setFullStudy(null)
      onButtonStateChange({})
      return
    }

    const fetchStudyDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8080/orthanc/studies/${study.ID}`)
        if (response.ok) {
          const studyData = await response.json()
          setFullStudy(studyData)
        }
      } catch (err) {
        console.error('Failed to fetch study details:', err)
        // Fall back to enabling all buttons if we can't fetch details
        onButtonStateChange({
          basic: true,
          segmentation: true,
          annotations: true,
          metabolic: true,
          microscopy: true,
          preclinical: true,
        })
      }
    }

    fetchStudyDetails()
  }, [study, onButtonStateChange])

  // Evaluate button states when full study data is available
  useEffect(() => {
    if (!fullStudy) return

    const evaluateButtonStates = () => {
      const modalities = fullStudy.MainDicomTags.ModalitiesInStudy?.toUpperCase() || ''
      const studyDescription = fullStudy.MainDicomTags.StudyDescription?.toLowerCase() || ''
      const instances = fullStudy.Instances?.length || 0
      
      const buttonStates: Record<string, boolean> = {
        basic: true, // Basic viewer is always available
        segmentation: false,
        annotations: false,
        metabolic: false,
        microscopy: false,
        preclinical: false,
      }

      // Segmentation: Available for CT, MR, and studies with multiple series
      if (modalities.includes('CT') || modalities.includes('MR')) {
        buttonStates.segmentation = true
      }

      // US Pleura B-line Annotations: Only for Ultrasound studies
      if (modalities.includes('US')) {
        buttonStates.annotations = true
      }

      // Total Metabolic Tumor Volume: For PET/CT studies
      if (modalities.includes('PT') || modalities.includes('PET')) {
        buttonStates.metabolic = true
      }

      // Microscopy: For studies with high-resolution images or specific descriptions
      if (modalities.includes('SM') || studyDescription.includes('microscopy') || studyDescription.includes('histology')) {
        buttonStates.microscopy = true
      }

      // Preclinical 4D: For studies with multiple time points or specific modalities
      if (modalities.includes('OT') || instances > 100) {
        buttonStates.preclinical = true
      }

      // Additional logic based on study characteristics
      if (studyDescription.includes('tumor') || studyDescription.includes('cancer')) {
        buttonStates.metabolic = true
      }

      if (studyDescription.includes('cardiac') || studyDescription.includes('heart')) {
        buttonStates.annotations = true
      }

      onButtonStateChange(buttonStates)
    }

    evaluateButtonStates()
  }, [fullStudy, onButtonStateChange])

  // This component doesn't render anything visible
  // It just evaluates button states and calls the callback
  return null
}
