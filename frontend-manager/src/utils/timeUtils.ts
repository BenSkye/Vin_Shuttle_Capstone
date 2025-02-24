import { parse, format } from 'date-fns';

export const formatTime = (time: string): string => {
    try {
        const parsedTime = parse(time, 'HH:mm', new Date());
        return format(parsedTime, 'h:mm a');
    } catch {
        return time;
    }
};

export const generateTimeSlots = (
    startHour: number = 8,
    endHour: number = 20,
    interval: number = 60
): string[] => {
    const slots: string[] = [];
    for (let hour = startHour; hour <= endHour; hour++) {
        for (let minute = 0; minute < 60; minute += interval) {
            const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            slots.push(timeString);
        }
    }
    return slots;
};

export const isTimeInRange = (
    time: string,
    startTime: string,
    endTime: string
): boolean => {
    const timeValue = parse(time, 'HH:mm', new Date()).getTime();
    const startValue = parse(startTime, 'HH:mm', new Date()).getTime();
    const endValue = parse(endTime, 'HH:mm', new Date()).getTime();

    return timeValue >= startValue && timeValue <= endValue;
};