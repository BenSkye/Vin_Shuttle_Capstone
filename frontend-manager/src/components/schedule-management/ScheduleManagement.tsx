'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BusScheduleList } from './BusScheduleList';
import { DriverScheduleList } from './DriverScheduleList';
import { CreateDriverSchedule } from './CreateDriverSchedule';
import { CreateBusSchedule } from './CreateBusSchedule';
import { Button } from '@/components/ui/button';

export const ScheduleManagement = () => {
    const [showCreateDriverSchedule, setShowCreateDriverSchedule] = useState(false);
    const [showCreateBusSchedule, setShowCreateBusSchedule] = useState(false);
    const [activeTab, setActiveTab] = useState('bus-schedules');

    const handleAddSchedule = () => {
        if (activeTab === 'bus-schedules') {
            setShowCreateBusSchedule(true);
        } else {
            setShowCreateDriverSchedule(true);
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    Quản lý lịch trình
                </h1>
                <Button
                    onClick={handleAddSchedule}
                    className="bg-primary text-black hover:bg-primary/90"
                >
                    {activeTab === 'bus-schedules' ? 'Thêm lịch trình xe bus' : 'Thêm lịch trình tài xế'}
                </Button>
            </div>

            <Tabs defaultValue="bus-schedules" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-[400px] grid-cols-2">
                    <TabsTrigger value="bus-schedules">Lịch trình xe bus</TabsTrigger>
                    <TabsTrigger value="driver-schedules">Lịch trình tài xế</TabsTrigger>
                </TabsList>

                <TabsContent value="bus-schedules" className="space-y-4">
                    <BusScheduleList />
                    {showCreateBusSchedule && (
                        <CreateBusSchedule
                            isOpen={showCreateBusSchedule}
                            onClose={() => setShowCreateBusSchedule(false)}
                            onSuccess={() => {
                                setShowCreateBusSchedule(false);
                            }}
                        />
                    )}
                </TabsContent>

                <TabsContent value="driver-schedules" className="space-y-4">
                    <DriverScheduleList />
                    {showCreateDriverSchedule && (
                        <CreateDriverSchedule
                            isOpen={showCreateDriverSchedule}
                            onClose={() => setShowCreateDriverSchedule(false)}
                            onSuccess={() => {
                                setShowCreateDriverSchedule(false);
                            }}
                        />
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}; 