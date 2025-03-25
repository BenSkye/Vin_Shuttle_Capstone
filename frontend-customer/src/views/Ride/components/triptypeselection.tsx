import React from 'react'

interface TripTypeSelectionProps {
  tripType: 'alone' | 'shared'
  onTripTypeChange: (value: 'alone' | 'shared') => void
  passengerCount: number
  onPassengerCountChange: (value: number) => void
}

const TripTypeSelection: React.FC<TripTypeSelectionProps> = ({
  tripType,
  onTripTypeChange,
  passengerCount,
  onPassengerCountChange,
}) => {
  return (
    <div className="rounded-lg bg-white p-4 shadow-md">
      <div className="flex gap-4">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="radio"
            value="alone"
            checked={tripType === 'alone'}
            onChange={() => onTripTypeChange('alone')}
            className="h-5 w-5 border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Đi một mình
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="radio"
            value="shared"
            checked={tripType === 'shared'}
            onChange={() => onTripTypeChange('shared')}
            className="h-5 w-5 border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Đi chung
        </label>
      </div>

      {tripType === 'shared' && (
        <div className="mt-4 flex items-center gap-2">
          <span className="text-gray-700">Số người đi cùng:</span>
          <input
            type="number"
            min={1}
            max={10}
            value={passengerCount}
            onChange={(e) => onPassengerCountChange(Number(e.target.value))}
            className="w-16 rounded-md border border-gray-300 p-2 text-center"
          />
        </div>
      )}
    </div>
  )
}

export default TripTypeSelection
