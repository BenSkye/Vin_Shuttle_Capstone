'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BusScheduleList } from './BusScheduleList';
import { DriverScheduleList } from './DriverScheduleList';
import { CreateDriverSchedule } from './CreateDriverSchedule';
import { Button } from '@/components/ui/button';

export const ScheduleManagement = () => {
    const [showCreateDriverSchedule, setShowCreateDriverSchedule] = useState(false);

    return (
        <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Quản lý lịch trình
            </h1>

            <Tabs defaultValue="bus-schedules" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="bus-schedules">Lịch trình xe bus</TabsTrigger>
                    <TabsTrigger value="driver-schedules">Lịch trình tài xế</TabsTrigger>
                </TabsList>

                <TabsContent value="bus-schedules" className="space-y-4">
                    <BusScheduleList />
                </TabsContent>

                <TabsContent value="driver-schedules" className="space-y-4">
                    <div className="flex justify-end">
                        <Button
                            onClick={() => setShowCreateDriverSchedule(true)}
                            className="bg-primary text-white hover:bg-primary/90"
                        >
                            Thêm lịch trình tài xế
                        </Button>
                    </div>
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