'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DatePickerDemo } from '../../components/common/DatePicker'

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

export default function BookingInterface() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
    const [bookingDate, setBookingDate] = useState<Date | null>(null)
    const [passengers, setPassengers] = useState(1)

    const filteredRoutes = routes.filter(route =>
        route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        route.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
        route.to.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleBooking = () => {
        if (!selectedRoute || !bookingDate) {
            alert('Vui lòng chọn đủ thông tin để đặt vé!')
            return
        }
        alert(`Đặt vé thành công cho tuyến ${selectedRoute.name}!`)
    }

    return (
        <div className="h-screen flex flex-col">
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
                                <Card
                                    key={route.id}
                                    className={`p-4 cursor-pointer hover:bg-accent ${selectedRoute?.id === route.id ? 'bg-accent' : ''
                                        }`}
                                    onClick={() => setSelectedRoute(route)}
                                >
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

                {/* Main Content */}
                <div className="flex-1 bg-muted p-4">
                    <div className="h-full rounded-lg bg-background border flex flex-col items-center justify-center p-4 space-y-4">
                        {selectedRoute ? (
                            <>
                                <h2 className="text-lg font-medium">{selectedRoute.name}</h2>
                                <p className="text-sm text-muted-foreground">
                                    {selectedRoute.from} - {selectedRoute.to}
                                </p>
                                <div className="space-y-2 w-full">
                                    <DatePickerDemo
                                        placeholder="Chọn ngày"
                                        value={bookingDate}
                                        onChange={(date) => setBookingDate(date)}
                                        className="w-full"
                                    />
                                    <Input
                                        type="number"
                                        min={1}
                                        value={passengers}
                                        onChange={(e) => setPassengers(Number(e.target.value))}
                                        placeholder="Số hành khách"
                                        className="w-full"
                                    />
                                </div>
                                <Button onClick={handleBooking}>Đặt Vé</Button>
                            </>
                        ) : (
                            <p className="text-muted-foreground">Vui lòng chọn tuyến xe để đặt vé.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
