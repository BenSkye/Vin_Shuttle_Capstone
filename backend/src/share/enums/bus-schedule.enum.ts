export enum BusTimeSlot {
  MORNING = 'morning',    // 6h-11h 
  NOON = 'noon',         // 11h-14h
  AFTERNOON = 'afternoon', // 14h-18h
  EVENING = 'evening'     // 18h-22h
}

export enum BusScheduleStatus {
  ACTIVE = 'active',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DROPPED_OFF = 'dropped_off',
  CANCELLED = 'cancelled'
}

export const BusTimeSlotHours = {
  [BusTimeSlot.MORNING]: { start: 6, end: 11 },
  [BusTimeSlot.NOON]: { start: 11, end: 14 },
  [BusTimeSlot.AFTERNOON]: { start: 14, end: 18 }, 
  [BusTimeSlot.EVENING]: { start: 18, end: 22 }
};

export enum DriverScheduleTaskType {
  GENERAL = 'general',
  BUS = 'bus',
}