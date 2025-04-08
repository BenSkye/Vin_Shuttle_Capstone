'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BusScheduleList } from './BusScheduleList';
import { DriverScheduleList } from './DriverScheduleList';
import { CreateBusSchedule } from './CreateBusSchedule';
import { CreateDriverSchedule } from './CreateDriverSchedule';
import { Button } from '@/components/ui/button';

export const ScheduleManagement = () => {
    const [showCreateBusSchedule, setShowCreateBusSchedule] = useState(false);
    const [showCreateDriverSchedule, setShowCreateDriverSchedule] = useState(false);

    return (
        <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Schedule Management
            </h1>

            <Tabs defaultValue="bus-schedules" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="bus-schedules">Bus Schedules</TabsTrigger>
                    <TabsTrigger value="driver-schedules">Driver Schedules</TabsTrigger>
                </TabsList>

                <TabsContent value="bus-schedules" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-semibold">Bus Schedules</h2>
                        <Button
                            onClick={() => setShowCreateBusSchedule(true)}
                            className="bg-primary text-white hover:bg-primary/90"
                        >
                            Create Bus Schedule
                        </Button>
                    </div>
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
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-semibold">Driver Schedules</h2>
                        <Button
                            onClick={() => setShowCreateDriverSchedule(true)}
                            className="bg-primary text-white hover:bg-primary/90"
                        >
                            Create Driver Schedule
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