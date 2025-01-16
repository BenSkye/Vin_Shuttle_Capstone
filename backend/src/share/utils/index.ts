import { Types } from "mongoose";

export const convertObjectId = (id: string) => {
    return new Types.ObjectId(id);
}

