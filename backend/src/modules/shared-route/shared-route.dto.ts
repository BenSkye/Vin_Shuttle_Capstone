import { Types } from "mongoose";
import { SharedRouteStopsType } from "src/share/enums/shared-route.enum";
import { Position } from "src/share/interface";

export interface sharedRouteStop {
    order: number;
    pointType: SharedRouteStopsType;
    trip: Types.ObjectId;
    position: Position;
    address: string;
    isPass: boolean;
}