'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Activity, Users, Database } from 'lucide-react'

const HomePage: React.FC = () => {
  const router = useRouter()

  // Removed auto-redirect to let users choose their destination

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <FileText className="h-24 w-24 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">DICOM Viewer</h1>
          <p className="text-xl text-gray-600 mb-8">
            Professional medical imaging viewer with OHIF-style interface
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <Activity className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced Tools</h3>
            <p className="text-gray-600">
              Professional measurement and annotation tools for medical imaging
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Multi-Viewport</h3>
            <p className="text-gray-600">
              Support for multiple viewport layouts and configurations
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <Database className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">DICOM Support</h3>
            <p className="text-gray-600">
              Full DICOM standard support with Orthanc integration
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-lg max-w-md mx-auto">
          <p className="text-gray-600 mb-4">
            Choose your destination:
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/studies')}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Studies
            </button>
            <button
              onClick={() => router.push('/demo')}
              className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Try Button Evaluator Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
