import { ReactNode } from 'react'

interface NoTripsProps {
  children?: ReactNode
  isActiveTab?: boolean
}

const NoTrips = ({ children, isActiveTab = true }: NoTripsProps) => (
  <div className="flex h-[70vh] flex-col items-center justify-center space-y-4">
    <svg
      className="h-20 w-20 text-gray-400"
      fill="none"
      strokeWidth="1.5"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
      />
    </svg>
    {children || (
      <p className="text-xl font-medium text-gray-600">
        {isActiveTab
          ? 'Hoạt động sẽ xuất hiện khi bạn sử dụng dịch vụ'
          : 'Không có cuốc xe trong lịch sử'}
      </p>
    )}
  </div>
)

export default NoTrips
