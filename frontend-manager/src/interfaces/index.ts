export interface DriverScheduleEvent {
    title: string;
    vehicles: string;
    start: Date;
    end: Date;
    allDay?: boolean;
}

export interface Activity {
    id: string;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    day: number;
    color?: string;
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