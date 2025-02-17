export enum DriverSchedulesStatus {
    NOT_STARTED = 'not_started',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
}


export enum Shift {
    A = 'A',
    B = 'B',
    C = 'C',
    D = 'D'
}

export const ShiftHours = {
    [Shift.A]: { start: 6, end: 14 },
    [Shift.B]: { start: 10, end: 18 },
    [Shift.C]: { start: 12, end: 20 },
    [Shift.D]: { start: 15, end: 23 }
};


export enum ShiftDifference {
    IN = -15,
    OUT = +15
}
