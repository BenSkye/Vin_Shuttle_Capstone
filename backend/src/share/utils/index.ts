import * as dayjs from 'dayjs'
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { Types } from "mongoose";


export const convertObjectId = (id: string) => {
    return new Types.ObjectId(id);
}

export const getSelectData = (fields: string[]) => {
    return fields.join(' ')
}



dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Ho_Chi_Minh');

export const DateUtils = {
    parseDate: (dateStr: string, timeStr?: string): dayjs.Dayjs => {
        const format = timeStr ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD';
        return dayjs.utc(`${dateStr}${timeStr ? ` ${timeStr}` : ''}`, format);
    },
    parseTime: (timeStr: string): dayjs.Dayjs => {
        return dayjs.utc(timeStr, 'HH:mm');
    },

    fromDate: (date: Date): dayjs.Dayjs => {
        return dayjs.utc(date, 'Asia/Ho_Chi_Minh'); // Chuyển Date thành dayjs với múi giờ VN
    }
}