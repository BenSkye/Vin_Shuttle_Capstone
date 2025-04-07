export interface DriverScheduleEvent {
    title: string;
    vehicles: string;
    start: Date;
    end: Date;
    allDay?: boolean;
}

export interface Activity {
    name: string;
    vehicleName: string;
    driverName: string;
    vehicleId: string;
    id: string;
    driverId: string;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    day: number;
    color?: string;
    date?: string;
    originalDate?: Date;
};

export interface Column<T> {
    header: string;
    accessor: keyof T;
    className?: string;
}

export interface Appointment {
    date: string; // Định dạng yyyy-MM-dd
    startTime: string; // Định dạng HH:mm
    endTime: string; // Định dạng HH:mm
}

export interface Driver {
    _id: string;
    id: number;
    teacherId: string;
    name: string;
    email?: string;
    photo: string;
    phone: string;
    subjects: string[];
    classes: string[];
    address: string;
    action: string;
    avatar: string;
    createdAt?: string; // ISO date string format: 2025-03-28T13:09:36.533+00:00
};

export interface Customer {
    id: number;
    name: string;
    phone: string;
    email: string;
}

export interface Vehicle {
    _id: string;
    name: string;
    categoryId: string;
    description: string;
    vehicleCondition: string;
    operationStatus: string;

}

export interface DriverFilters {
    sortOrder?: string;
    orderBy?: string;
    skip?: number;
    limit?: number;
    role?: string;
    phone?: string;
    email?: string;
    name?: string;
}