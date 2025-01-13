'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Route {
    id: string
    name: string
    from: string
    to: string
    hours: string
    price: string
}

const routes: Route[] = [
    {
        id: 'metro-1',
        name: 'Tuyến số Metro 1',
        from: 'Bến Thành',
        to: 'Suối Tiên',
        hours: '05:00 - 22:00',
        price: '20.000 VND'
    },
    {
        id: 'd4',
        name: 'Tuyến số D4',
        from: 'Vinhomes Grand Park',
        to: 'Bến xe buýt Sài Gòn',
        hours: '05:00 - 22:00',
        price: '7.000 VND'
    },
    {
        id: '01',
        name: 'Tuyến số 01',
        from: 'Bến Thành',
        to: 'Bến Xe buýt Chợ Lớn',
        hours: '05:00 - 20:15',
        price: '5.000 VND'
    },
    {
        id: '03',
        name: 'Tuyến số 03',
        from: 'Bến Thành',
        to: 'Thanh Xuân',
        hours: '04:00 - 20:45',
        price: '6.000 VND'
    }
]

export default function BusRouteMap() {
    const [searchQuery, setSearchQuery] = useState('')

    const filteredRoutes = routes.filter(route =>
        route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        route.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
        route.to.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="h-screen flex flex-col">
            {/* Header */}
            <header className="bg-emerald-500 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">BusMap</span>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="text-white hover:text-white hover:bg-emerald-600">
                        Đăng nhập
                    </Button>
                    <Button variant="ghost" className="text-white hover:text-white hover:bg-emerald-600">
                        EN
                    </Button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-80 border-r bg-background flex flex-col">
                    <div className="p-4 border-b">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="TRA CỨU"
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="p-4 space-y-4">
                            {filteredRoutes.map(route => (
                                <Card key={route.id} className="p-4 cursor-pointer hover:bg-accent">
                                    <div className="space-y-2">
                                        <div className="font-medium">{route.name}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {route.from} - {route.to}
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>{route.hours}</span>
                                            <span>{route.price}</span>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Map Area */}
                <div className="flex-1 bg-muted p-4">
                    <div className="h-full rounded-lg bg-background border flex items-center justify-center text-muted-foreground">
                        Map View
                        {/* In a real implementation, you would integrate a mapping library here */}
                    </div>
                </div>
            </div>
        </div>
    )
}

