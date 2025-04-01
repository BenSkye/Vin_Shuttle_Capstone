export interface ICreateBusScheduleDto {
    busRoute: string;
    date: Date;
    driverScheduleIds: string[];
    isValid: boolean;
}

export interface IUpdateBusScheduleDto {
    busRoute?: string;
    date?: Date;
    driverScheduleIds?: string[];
    isValid?: boolean;
}