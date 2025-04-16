'use client'

import { BusStop } from '@/service/bus.service'
import { FiChevronDown, FiChevronUp, FiMapPin } from 'react-icons/fi'
import { useState } from 'react'

interface BusStopPanelProps {
    busStops: BusStop[]
}

const BusStopPanel = ({ busStops }: BusStopPanelProps) => {
    const [isExpanded, setIsExpanded] = useState(true)

    const handleToggle = () => {
        setIsExpanded(prev => !prev)
    }

    if (!busStops || busStops.length === 0) {
        return (
            <div className="border-t border-divider">
                <div className="p-4 text-center text-content-secondary">
                    Không có trạm dừng nào
                </div>
            </div>
        )
    }

    return (
        <div className="border-t border-divider">
            <button
                className="flex w-full items-center justify-between p-4 cursor-pointer hover:bg-surface-hover"
                onClick={handleToggle}
                type="button"
            >
                <h3 className="font-medium text-content-primary">Danh sách trạm dừng</h3>
                {isExpanded ? (
                    <FiChevronUp className="h-5 w-5 text-content-secondary" />
                ) : (
                    <FiChevronDown className="h-5 w-5 text-content-secondary" />
                )}
            </button>

            {isExpanded && (
                <div className="px-4 pb-4 space-y-3">
                    {busStops.map((stop) => (
                        <div
                            key={stop._id}
                            className="flex items-start gap-3 p-3 rounded-lg border border-divider hover:bg-surface-hover"
                        >
                            <div className="mt-1">
                                <FiMapPin className="h-5 w-5 text-primary-600" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-medium text-content-primary">{stop.name}</h4>
                                <p className="text-sm text-content-secondary mt-1">
                                    {stop.description || 'Không có mô tả'}
                                </p>
                                <p className="text-sm text-content-secondary mt-1">
                                    {stop.address}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default BusStopPanel