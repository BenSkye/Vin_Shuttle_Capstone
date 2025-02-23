export interface DriverScheduleEvent {
    title: string;
    vehicles: string;
    start: Date;
    end: Date;
    allDay?: boolean;
}