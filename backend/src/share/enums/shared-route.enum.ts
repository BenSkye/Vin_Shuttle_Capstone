export enum SharedRouteStatus {
    PENDING = 'pending',
    PLANNED = 'planned',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

export enum SharedRouteStopsType {
    START_POINT = 'startPoint',
    END_POINT = 'endPoint',
}

export const MaxDistancePercentAvailableToChange = 0.5; // 50%