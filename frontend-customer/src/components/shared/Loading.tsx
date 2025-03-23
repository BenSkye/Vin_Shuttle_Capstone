'use client'

import { LoadingOutlined } from '@ant-design/icons'
import { Spin } from 'antd'

export default function Loading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} tip="Đang tải..." />
    </div>
  )
}
