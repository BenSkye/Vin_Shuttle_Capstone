import { QueryOptions } from "@/interface/index.interface";

export interface ScenicRouteQuery extends QueryOptions {
    totalDistance?: number;
    status?: string;
    name?: string;
}