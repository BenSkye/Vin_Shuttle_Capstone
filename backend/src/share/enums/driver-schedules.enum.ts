export enum DriverSchedulesStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  IS_PAUSED = 'is_paused',
  COMPLETED = 'completed',
  DROPPED_OFF = 'dropped_off',
  CANCELED = 'canceled',
}

export enum Shift {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
}

export const ShiftHours = {
  [Shift.A]: { start: 6, end: 14 },
  [Shift.B]: { start: 10, end: 18 },
  [Shift.C]: { start: 12, end: 20 },
  [Shift.D]: { start: 15, end: 23 },
};

export enum ShiftDifference {
  IN = -15,
  OUT = +15,
}


export enum DriverScheduleTaskType {
  GENERAL = 'general',
  BUS = 'bus',
}


export const TimeBreakMinToNextTrip = 5; //5 phút
