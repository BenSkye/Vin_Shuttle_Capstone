import React from 'react'

import { Card, Typography } from 'antd'
import { FaCar } from 'react-icons/fa'

import { AvailableVehicle } from '@/interface/booking.interface'
import { BookingHourRequest } from '@/interface/booking.interface'
import { formatVndPrice } from '@/utils/price.until'

const { Title } = Typography

interface VehicleSelectionProps {
  availableVehicles: AvailableVehicle[]
  selectedVehicles: BookingHourRequest['vehicleCategories']
  onSelectionChange: (categoryId: string, quantity: number) => void
}

const VehicleSelection: React.FC<VehicleSelectionProps> = ({
  availableVehicles,
  selectedVehicles,
  onSelectionChange,
}) => {
  const getSelectedQuantity = (categoryId: string) => {
    return selectedVehicles.find((v) => v.categoryVehicleId === categoryId)?.quantity || 0
  }

  const handleQuantityChange = (categoryId: string, value: string) => {
    const quantity = Math.max(
      0,
      Math.min(
        Number(value),
        availableVehicles.find((v) => v.vehicleCategory._id === categoryId)?.availableCount || 0
      )
    )
    onSelectionChange(categoryId, quantity)
  }

  return (
    <div className="w-full">
      <Title level={3} className="mb-8 text-center text-2xl font-bold text-gray-800">
        Chọn loại xe phù hợp
      </Title>

      {availableVehicles.length === 0 ? (
        <div className="py-12 text-center">
          <FaCar className="mx-auto mb-4 text-5xl text-gray-400" />
          <p className="text-lg text-gray-500">Không có xe khả dụng cho khoảng thời gian này</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {availableVehicles.map((vehicle) => {
            const selectedQuantity = getSelectedQuantity(vehicle.vehicleCategory._id)
            const isSelected = selectedQuantity > 0

            return (
              <Card
                key={vehicle.vehicleCategory._id}
                className={`transform transition-all duration-200 hover:shadow-lg ${
                  isSelected ? 'border-2 border-blue-500 bg-blue-50' : 'border border-gray-200'
                }`}
                styles={{ body: { padding: '1.5rem' } }}
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

                <div className="mt-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        handleQuantityChange(
                          vehicle.vehicleCategory._id,
                          Math.max(0, selectedQuantity - 1).toString()
                        )
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 transition-colors hover:bg-gray-100"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={selectedQuantity}
                      min={0}
                      max={vehicle.availableCount}
                      onChange={(e) =>
                        handleQuantityChange(vehicle.vehicleCategory._id, e.target.value)
                      }
                      className="h-10 w-16 rounded-md border text-center"
                    />
                    <button
                      onClick={() =>
                        handleQuantityChange(
                          vehicle.vehicleCategory._id,
                          Math.min(vehicle.availableCount, selectedQuantity + 1).toString()
                        )
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 transition-colors hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">Tối đa: {vehicle.availableCount}</span>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default VehicleSelection
