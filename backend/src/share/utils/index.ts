import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Types } from 'mongoose';

export const convertObjectId = (id: string) => {
  return new Types.ObjectId(id);
};

export const getSelectData = (fields: string[]) => {
  return fields.join(' ');
};

export const generateBookingCode = (): number => {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000);
  return parseInt(`${timestamp}${random.toString().padStart(3, '0')}`);
};


dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Asia/Ho_Chi_Minh');

export const timeUtc = 7;

export const DateUtils = {
  parseDate: (dateStr: string, timeStr?: string): dayjs.Dayjs => {
    const format = timeStr ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD';
    return dayjs.tz(`${dateStr}${timeStr ? ` ${timeStr}` : ''}`, format, 'Asia/Ho_Chi_Minh');
    // return dayjs.utc(`${dateStr}${timeStr ? ` ${timeStr}` : ''}`, format);
  },

  toUTCDate: (date: Date): dayjs.Dayjs => {
    return dayjs(date).add(timeUtc, 'hour');
  },


  parseTime: (timeStr: string): dayjs.Dayjs => {
    return dayjs.utc(timeStr, 'HH:mm');
  },

  fromDate: (date: Date): dayjs.Dayjs => {
    return dayjs.utc(date, 'Asia/Ho_Chi_Minh'); // Chuyển Date thành dayjs với múi giờ VN
  },
};
