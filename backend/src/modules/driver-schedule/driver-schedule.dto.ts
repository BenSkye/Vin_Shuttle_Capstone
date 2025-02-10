export interface createDriverSchedule {
    driver: string;
    date: Date;
    shift: string;
    vehicle: string;
}

export interface updateDriverSchedule {
    driver?: string;
    date?: Date;
    shift?: string;
    vehicle?: string;
    status?: string;
    checkinTime?: Date;
    checkoutTime?: Date;
    isLate?: boolean;
    isEarlyCheckout?: boolean;
}