import React, { useState } from 'react'

import { Menu } from 'antd'
import type { MenuProps } from 'antd'

// Updated LookUpProps interface to include setPickup and setDestination
interface LookUpProps {
  onTabChange: (key: string) => void
  setPickup: React.Dispatch<React.SetStateAction<string | null>>
  setDestination: React.Dispatch<React.SetStateAction<string | null>>
}

const LookUp: React.FC<LookUpProps> = ({ onTabChange, setPickup, setDestination }) => {
  const [selected, setSelected] = useState('search')

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    setSelected(e.key)
    onTabChange(e.key)

    // Reset pickup and destination when switching tabs
    if (e.key === 'search') {
      setPickup(null)
      setDestination(null)
    }
  }

  return (
    <Menu mode="horizontal" selectedKeys={[selected]} onClick={handleMenuClick}>
      <Menu.Item key="search">TRA CỨU</Menu.Item>
      <Menu.Item key="directions">TÌM ĐƯỜNG</Menu.Item>
    </Menu>
  )
}

export default LookUp
