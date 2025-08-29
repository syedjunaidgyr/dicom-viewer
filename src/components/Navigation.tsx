'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, Home, ArrowLeft } from 'lucide-react'

interface NavigationProps {
  showBackButton?: boolean
  backUrl?: string
  title?: string
  subtitle?: string
}

const Navigation: React.FC<NavigationProps> = ({
  showBackButton = false,
  backUrl = '/studies',
  title = 'DICOM Viewer',
  subtitle
}) => {
  const pathname = usePathname()

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <>
                <Link
                  href={backUrl}
                  className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Back
                </Link>
                <div className="w-px h-6 bg-gray-300"></div>
              </>
            )}
            
            <Link
              href="/"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Home className="h-5 w-5 mr-2" />
              Home
            </Link>
            
            <div className="w-px h-6 bg-gray-300"></div>
            
            <Link
              href="/studies"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <FileText className="h-5 w-5 mr-2" />
              Studies
            </Link>
          </div>
          
          <div className="text-right">
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Navigation
