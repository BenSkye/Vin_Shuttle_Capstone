import type React from 'react'
import { useState } from 'react'

import { Search } from 'lucide-react'
import { Bus, Menu, Train } from 'lucide-react'

import { Input } from '@/components/ui/input'

import CreateRoute from '../../map/createRoute'

export default function BusRoutes() {
  return (
    <div className="">
      <CreateRoute />
    </div>
  )
}
