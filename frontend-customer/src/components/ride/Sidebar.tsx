import React from 'react'

import { Card, Input, List } from 'antd'

const routes = [
  {
    id: 1,
    name: 'Tuyến số Metro 1',
    route: 'Bến Thành - Suối Tiên',
    time: '05:00 - 22:00',
    price: '20.000 VNĐ',
  },
  {
    id: 2,
    name: 'Tuyến số D4',
    route: 'Vinhomes Grand Park - Bến xe buýt Sài Gòn',
    time: '05:00 - 22:00',
    price: '7.000 VNĐ',
  },
  {
    id: 3,
    name: 'Tuyến số 01',
    route: 'Bến Thành - Bến Xe buýt Chợ Lớn',
    time: '05:00 - 20:15',
    price: '5.000 VNĐ',
  },
  {
    id: 4,
    name: 'Tuyến số 03',
    route: 'Bến Thành - Thạnh Xuân',
    time: '05:00 - 19:30',
    price: '6.000 VNĐ',
  },
]

const Sidebar = () => {
  return (
    <div
      style={{ width: 350, padding: 10, background: '#fff', height: '100vh', overflowY: 'auto' }}
    >
      <Input placeholder="Tìm tuyến xe" style={{ marginBottom: 10 }} />
      <List
        dataSource={routes}
        renderItem={(route) => (
          <Card title={route.name} size="small" style={{ marginBottom: 10 }}>
            <p>{route.route}</p>
            <p>🕒 {route.time}</p>
            <p>💰 {route.price}</p>
          </Card>
        )}
      />
    </div>
  )
}

export default Sidebar
