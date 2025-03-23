import React from 'react'

import { Card, Typography } from 'antd'
import { FaCar } from 'react-icons/fa'

import { AvailableVehicle } from '@/interface/booking'
import { formatVndPrice } from '@/utils/price.until'

const { Title } = Typography

interface VehicleSelectionProps {
  availableVehicles: AvailableVehicle[]
  selectedVehicle: { categoryVehicleId: string; name: string } | null
  onSelectionChange: (categoryId: string, name: string, selected: boolean) => void
}

const DesVehicleSelection: React.FC<VehicleSelectionProps> = ({
  availableVehicles,
  selectedVehicle,
  onSelectionChange,
}) => {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4">
      <Title level={3} className="mb-8 text-center text-2xl font-bold text-gray-800">
        Chọn loại xe phù hợp
      </Title>

      {availableVehicles.length === 0 ? (
        <div className="py-12 text-center">
          <FaCar className="mx-auto mb-4 text-5xl text-gray-400" />
          <p className="text-lg text-gray-500">Không có xe khả dụng cho khoảng thời gian này</p>
        </div>
      ) : (
        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
          {availableVehicles.map((vehicle) => {
            const isSelected = selectedVehicle?.categoryVehicleId === vehicle.vehicleCategory._id

            return (
              <Card
                key={vehicle.vehicleCategory._id}
                className={`transform cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  isSelected ? 'bg-blue-100' : 'border border-gray-200'
                }`}
                bodyStyle={{ padding: '1.5rem' }}
                onClick={() => {
                  console.log('Card clicked:', vehicle.vehicleCategory._id)
                  onSelectionChange(
                    vehicle.vehicleCategory._id,
                    vehicle.vehicleCategory.name,
                    !isSelected // Toggle selection
                  )
                }}
              >
                <div className="mb-4 flex items-center gap-4">
                  <div className="rounded-full bg-blue-100 p-3">
                    <FaCar className="text-2xl text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {vehicle.vehicleCategory.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {vehicle.vehicleCategory.numberOfSeat} chỗ ngồi
                    </p>
                  </div>
                </div>

                <div className="mb-6 space-y-3">
                  <p className="text-gray-600">{vehicle.vehicleCategory.description}</p>
                  <p className="font-medium text-red-500">Còn trống: {vehicle.availableCount} xe</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {formatVndPrice(vehicle.price)}/Xe
                  </p>
                </div>

                {/* Add visual indicator for selection */}
                {isSelected && (
                  <div className="absolute right-3 top-3">
                    <div className="rounded-full bg-blue-500 p-1 text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Debug info */}
      <div className="mt-6 border-t border-gray-200 p-4">
        <p className="text-sm text-gray-500">
          Currently selected:{' '}
          {selectedVehicle
            ? `${selectedVehicle.name} (${selectedVehicle.categoryVehicleId})`
            : 'None'}
        </p>
      </div>
    </div>
  )
}

export default DesVehicleSelection
