'use client'

import React from 'react'
import { Grid3X3, Square, Layout, Monitor } from 'lucide-react'

export type LayoutType = '1x1' | '1x2' | '2x2' | '2x3' | '3x3' | 'custom'

interface LayoutManagerProps {
  currentLayout: LayoutType
  onLayoutChange: (layout: LayoutType) => void
  viewportCount: number
}

const LayoutManager: React.FC<LayoutManagerProps> = ({
  currentLayout,
  onLayoutChange,
  viewportCount
}) => {
  const layouts = [
    { id: '1x1', name: 'Single', icon: Monitor, cols: 1, rows: 1 },
    { id: '1x2', name: 'Horizontal', icon: Layout, cols: 2, rows: 1 },
    { id: '2x2', name: '2x2 Grid', icon: Square, cols: 2, rows: 2 },
    { id: '2x3', name: '2x3 Grid', icon: Grid3X3, cols: 3, rows: 2 },
    { id: '3x3', name: '3x3 Grid', icon: Grid3X3, cols: 3, rows: 3 },
  ]

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide">Viewport Layout</h4>
      <div className="grid grid-cols-3 gap-2">
        {layouts.map((layout) => {
          const Icon = layout.icon
          const isActive = currentLayout === layout.id
          const isDisabled = layout.cols * layout.rows > viewportCount
          
          return (
            <button
              key={layout.id}
              onClick={() => onLayoutChange(layout.id as LayoutType)}
              disabled={isDisabled}
              className={`p-1.5 rounded border transition-all ${
                isActive
                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'
              } ${
                isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
              title={`${layout.name} (${layout.cols}x${layout.rows})`}
            >
              <Icon className="h-3 w-3 mx-auto" />
              <div className="text-xs mt-1 font-medium">{layout.name}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default LayoutManager
