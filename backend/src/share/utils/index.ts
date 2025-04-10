import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import crypto from 'crypto';
import { Types } from 'mongoose';
import { customAlphabet } from 'nanoid';

export const convertObjectId = (id: string) => {
  return new Types.ObjectId(id);
};

export const getSelectData = (fields: string[]) => {
  return fields.join(' ');
};

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const codeGenerator = customAlphabet(alphabet, 6);

export const generateBookingCode = (): number => {
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000);
  return parseInt(`${timestamp}${random.toString().padStart(3, '0')}`);
};

export const generateSignature = (rawSignature: string): string => {
  const SECRET_KEY = process.env.MOMO_SECRET_KEY;
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(rawSignature).digest('hex');
  return signature;
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

  formatDateTime: (date: Date): string => {
    return dayjs(date).tz('Asia/Ho_Chi_Minh').format('HH:mm DD/MM/YYYY');
  },
};
