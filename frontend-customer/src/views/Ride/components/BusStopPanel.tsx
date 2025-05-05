'use client'

import { useState } from 'react'

import { FiChevronDown, FiChevronUp, FiMapPin } from 'react-icons/fi'

import { BusStop } from '@/service/bus.service'

interface BusStopPanelProps {
  busStops: BusStop[]
}

const BusStopPanel = ({ busStops }: BusStopPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(true)

  const handleToggle = () => {
    setIsExpanded((prev) => !prev)
  }

  if (!busStops || busStops.length === 0) {
    return (
      <div className="border-t border-divider">
        <div className="p-4 text-center text-content-secondary">Không có trạm dừng nào</div>
      </div>
    )
  }

  return (
    <div className="border-t border-divider">
      <button
        className="hover:bg-surface-hover flex w-full cursor-pointer items-center justify-between p-4"
        onClick={handleToggle}
        type="button"
      >
        <h3 className="text-content-primary font-medium">Danh sách trạm dừng</h3>
        {isExpanded ? (
          <FiChevronUp className="h-5 w-5 text-content-secondary" />
        ) : (
          <FiChevronDown className="h-5 w-5 text-content-secondary" />
        )}
      </button>

      {isExpanded && (
        <div className="space-y-3 px-4 pb-4">
          {busStops.map((stop) => (
            <div
              key={stop._id}
              className="hover:bg-surface-hover flex items-start gap-3 rounded-lg border border-divider p-3"
            >
              <div className="mt-1">
                <FiMapPin className="h-5 w-5 text-primary-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-content-primary font-medium">{stop.name}</h4>
                <p className="mt-1 text-sm text-content-secondary">
                  {stop.description || 'Không có mô tả'}
                </p>
                <p className="mt-1 text-sm text-content-secondary">{stop.address}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BusStopPanel
