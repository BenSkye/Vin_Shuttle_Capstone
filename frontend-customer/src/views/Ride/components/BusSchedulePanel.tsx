'use client'

import { useState } from 'react'

import { format } from 'date-fns'
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'

import { BusSchedule } from '@/service/bus.service'

interface BusSchedulePanelProps {
  schedules: BusSchedule[]
  isLoading: boolean
  error: string | null
}

const BusSchedulePanel = ({ schedules, isLoading, error }: BusSchedulePanelProps) => {
  const [isExpanded, setIsExpanded] = useState(true)

  const handleToggle = () => {
    setIsExpanded((prev) => !prev)
  }

  if (isLoading) {
    return (
      <div className="border-t border-divider">
        <div className="p-4 text-center text-content-secondary">Đang tải lịch trình...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="border-t border-divider">
        <div className="p-4 text-center text-red-500">{error}</div>
      </div>
    )
  }

  if (!schedules || schedules.length === 0) {
    return (
      <div className="border-t border-divider">
        <div className="p-4 text-center text-content-secondary">Không có lịch trình nào</div>
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
        <h3 className="text-content-primary font-medium">Lịch trình xe buýt</h3>
        {isExpanded ? (
          <FiChevronUp className="h-5 w-5 text-content-secondary" />
        ) : (
          <FiChevronDown className="h-5 w-5 text-content-secondary" />
        )}
      </button>

      {isExpanded && (
        <div className="space-y-3 px-4 pb-4">
          {schedules.map((schedule) => (
            <div key={schedule._id} className="space-y-3">
              {schedule.dailyTrips?.map((trip, tripIndex) => (
                <div key={tripIndex} className="flex flex-col rounded-lg border border-divider p-3">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium">Chuyến {tripIndex + 1}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        trip.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : trip.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {trip.status === 'active'
                        ? 'Hoạt động'
                        : trip.status === 'in_progress'
                          ? 'Đang chạy'
                          : 'Kết thúc'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-content-secondary">
                    <div className="flex items-center gap-2">
                      <span>Khởi hành:</span>
                      <span className="text-content-primary font-medium">
                        {format(new Date(trip.startTime), 'HH:mm:ss')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Kết thúc:</span>
                      <span className="text-content-primary font-medium">
                        {format(new Date(trip.endTime), 'HH:mm:ss')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BusSchedulePanel
