'use client'

import React, { useState } from 'react'
import ButtonEvaluator from '../../components/ButtonEvaluator'
import Navigation from '../../components/Navigation'

interface DemoStudy {
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

export default function DemoPage() {
  const [buttonStates, setButtonStates] = useState<Record<string, boolean>>({})
  const [selectedStudyType, setSelectedStudyType] = useState<string>('')

  const demoStudies: Record<string, DemoStudy> = {
    ct: {
      ID: 'demo-ct',
      MainDicomTags: {
        StudyDescription: 'CT Head and Neck',
        ModalitiesInStudy: 'CT',
        PatientName: 'Demo Patient',
        PatientID: 'DEMO001'
      },
      Series: ['1', '2', '3'],
      Instances: ['100', '100', '100']
    },
    mr: {
      ID: 'demo-mr',
      MainDicomTags: {
        StudyDescription: 'MRI Brain',
        ModalitiesInStudy: 'MR',
        PatientName: 'Demo Patient',
        PatientID: 'DEMO002'
      },
      Series: ['1', '2'],
      Instances: ['50', '50']
    },
    us: {
      ID: 'demo-us',
      MainDicomTags: {
        StudyDescription: 'Ultrasound Abdomen',
        ModalitiesInStudy: 'US',
        PatientName: 'Demo Patient',
        PatientID: 'DEMO003'
      },
      Series: ['1'],
      Instances: ['25']
    },
    pet: {
      ID: 'demo-pet',
      MainDicomTags: {
        StudyDescription: 'PET/CT for Tumor Evaluation',
        ModalitiesInStudy: 'PT/CT',
        PatientName: 'Demo Patient',
        PatientID: 'DEMO004'
      },
      Series: ['1', '2'],
      Instances: ['200', '200']
    },
    microscopy: {
      ID: 'demo-microscopy',
      MainDicomTags: {
        StudyDescription: 'Histology Microscopy',
        ModalitiesInStudy: 'SM',
        PatientName: 'Demo Patient',
        PatientID: 'DEMO005'
      },
      Series: ['1'],
      Instances: ['10']
    }
  }

  const handleButtonStateChange = (states: Record<string, boolean>) => {
    setButtonStates(states)
  }

  const handleStudyTypeSelect = (studyType: string) => {
    setSelectedStudyType(studyType)
  }

  const getButtonStatus = (buttonKey: string) => {
    return buttonStates[buttonKey] ? 'Enabled' : 'Disabled'
  }

  const getButtonStatusColor = (buttonKey: string) => {
    return buttonStates[buttonKey] ? 'text-green-600' : 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navigation 
        showBackButton={true}
        backUrl="/"
        title="Button Evaluator Demo"
        subtitle="Test different study types and see button states"
      />

      <div className="p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Study Type Selection</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(demoStudies).map(([key, study]) => (
              <button
                key={key}
                onClick={() => handleStudyTypeSelect(key)}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  selectedStudyType === key
                    ? 'border-blue-500 bg-blue-600'
                    : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                }`}
              >
                <div className="text-center">
                  <div className="font-semibold mb-2">{study.MainDicomTags.ModalitiesInStudy}</div>
                  <div className="text-sm text-gray-300">{study.MainDicomTags.StudyDescription}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {selectedStudyType && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4">Selected Study Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-gray-400">Study ID:</span>
                <span className="ml-2">{demoStudies[selectedStudyType].ID}</span>
              </div>
              <div>
                <span className="text-gray-400">Modality:</span>
                <span className="ml-2">{demoStudies[selectedStudyType].MainDicomTags.ModalitiesInStudy}</span>
              </div>
              <div>
                <span className="text-gray-400">Description:</span>
                <span className="ml-2">{demoStudies[selectedStudyType].MainDicomTags.StudyDescription}</span>
              </div>
              <div>
                <span className="text-gray-400">Series:</span>
                <span className="ml-2">{demoStudies[selectedStudyType].Series.length}</span>
              </div>
              <div>
                <span className="text-gray-400">Instances:</span>
                <span className="ml-2">{demoStudies[selectedStudyType].Instances.length}</span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Button States</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-700 rounded-lg">
              <div className="font-medium mb-2">Basic Viewer</div>
              <div className={`text-sm ${getButtonStatusColor('basic')}`}>
                {getButtonStatus('basic')}
              </div>
            </div>
            <div className="p-4 bg-gray-700 rounded-lg">
              <div className="font-medium mb-2">Segmentation</div>
              <div className={`text-sm ${getButtonStatusColor('segmentation')}`}>
                {getButtonStatus('segmentation')}
              </div>
            </div>
            <div className="p-4 bg-gray-700 rounded-lg">
              <div className="font-medium mb-2">Annotations</div>
              <div className={`text-sm ${getButtonStatusColor('annotations')}`}>
                {getButtonStatus('annotations')}
              </div>
            </div>
            <div className="p-4 bg-gray-700 rounded-lg">
              <div className="font-medium mb-2">Metabolic Analysis</div>
              <div className={`text-sm ${getButtonStatusColor('metabolic')}`}>
                {getButtonStatus('metabolic')}
              </div>
            </div>
            <div className="p-4 bg-gray-700 rounded-lg">
              <div className="font-medium mb-2">Microscopy</div>
              <div className={`text-sm ${getButtonStatusColor('microscopy')}`}>
                {getButtonStatus('microscopy')}
              </div>
            </div>
            <div className="p-4 bg-gray-700 rounded-lg">
              <div className="font-medium mb-2">Preclinical 4D</div>
              <div className={`text-sm ${getButtonStatusColor('preclinical')}`}>
                {getButtonStatus('preclinical')}
              </div>
            </div>
          </div>
        </div>

        {/* Hidden Button Evaluator for demo */}
        {selectedStudyType && (
          <ButtonEvaluator
            study={demoStudies[selectedStudyType]}
            onButtonStateChange={handleButtonStateChange}
          />
        )}
      </div>
    </div>
  )
}
