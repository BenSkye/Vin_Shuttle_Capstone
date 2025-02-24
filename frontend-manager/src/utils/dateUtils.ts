import { format, parse, isValid } from 'date-fns';
import { Appointment } from '@/interfaces';

export const formatAppointmentDate = (date: Date): string => {
    return format(date, 'MMM dd, yyyy');
};

export const formatAppointmentTime = (time: string): string => {
    const parsedTime = parse(time, 'HH:mm', new Date());
    return isValid(parsedTime) ? format(parsedTime, 'h:mm a') : time;
};

export const generateTimeSlots = (
    startTime: string = '09:00',
    endTime: string = '17:00',
    intervalMinutes: number = 30
): string[] => {
    const slots: string[] = [];
    const start = parse(startTime, 'HH:mm', new Date());
    const end = parse(endTime, 'HH:mm', new Date());

    let current = start;
    while (current <= end) {
        slots.push(format(current, 'HH:mm'));
        current = new Date(current.getTime() + intervalMinutes * 60000);
    }

    return slots;
};

export const isTimeSlotAvailable = (
    date: Date,
    timeSlot: string,
    appointments: Appointment[]
): boolean => {
    return !appointments.some((appointment) =>
        appointment.date === format(date, "yyyy-MM-dd") &&
        (appointment.startTime === timeSlot || appointment.endTime === timeSlot)
    );
};