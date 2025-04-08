export interface BusSchedule {
    id: string;
    routeId: string;
    routeName: string;
    vehicleId: string;
    vehicleName: string;
    startTime: string;
    endTime: string;
    status: BusScheduleStatus;
}

export type BusScheduleStatus = 'ACTIVE' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';