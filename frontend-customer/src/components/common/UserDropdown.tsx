import Link from 'next/link'
import {
  FiCreditCard,
  FiLogOut,
  FiMessageSquare,
  FiUser,
  FiUserCheck,
} from 'react-icons/fi'

import { Routes } from '@/constants/routers'
import { IoCarOutline } from 'react-icons/io5'

interface UserDropdownProps {
  userName: string
  showDropdown: boolean
  dropdownRef: React.RefObject<HTMLDivElement>
  toggleDropdown: () => void
  onLogout: () => void
}

export function UserDropdown({
  userName,
  showDropdown,
  dropdownRef,
  toggleDropdown,
  onLogout,
}: UserDropdownProps) {
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 transition-opacity hover:opacity-80"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 shadow-md ring-2 ring-green-100">
          <FiUser className="text-xl text-white" />
        </div>
        <div className="hidden text-left md:block">
          <p className="text-sm font-medium text-gray-700">{userName}</p>
          <p className="text-xs text-gray-500">Tài khoản của bạn</p>
        </div>
      </button>

      {showDropdown && (
        <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-gray-100 bg-white py-2 shadow-xl">
          <Link
            href={Routes.PROFILE}
            className="flex items-center gap-3 px-4 py-3 transition hover:bg-green-50"
          >
            <FiUserCheck className="text-green-500" />
            <span>Thông tin cá nhân</span>
          </Link>
          <Link
            href={Routes.TRIPS}
            className="flex items-center gap-3 px-4 py-3 transition hover:bg-green-50"
          >
            {/* <FiClock className="text-green-500" /> */}
            <IoCarOutline className="text-green-500" />
            <span>Cuốc xe</span>
          </Link>
          <Link
            href={Routes.BOOKING.ROOT}
            className="flex items-center gap-3 px-4 py-3 transition hover:bg-green-50"
          >
            <FiCreditCard className="text-green-500" />
            <span>Lịch sử thanh toán</span>
          </Link>
          <Link
            href={Routes.CHAT}
            className="flex items-center gap-3 px-4 py-3 transition hover:bg-green-50"
          >
            <FiMessageSquare className="text-green-500" />
            <span>Cuộc trò chuyện</span>
          </Link>
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 border-t border-gray-100 px-4 py-3 text-left text-red-600 transition hover:bg-red-50"
          >
            <FiLogOut className="text-red-500" />
            <span>Đăng xuất</span>
          </button>
        </div>
      )}
    </div>
  )
}
