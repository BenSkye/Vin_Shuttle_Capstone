import { Injectable } from "@nestjs/common";
import { ISMSProvider } from "src/share/interface";
import { Twilio } from "twilio";


@Injectable()
export class SmsService implements ISMSProvider {

    private readonly client: Twilio;

    constructor() {
        this.client = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    }

    async sendOTP(phone: string, OTP: string): Promise<any> {
        // Gửi SMS qua Twilio
        phone = '+84' + phone.slice(1); // Định dạng E.164: +84123456789
        console.log('phone', phone);
        await this.client.messages.create({
            body: `Mã OTP của bạn cho hệ thống VinShuttle là: ${OTP} - Hiệu lực 2 phút`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone // Định dạng E.164: +84123456789
        });

        return { success: true, phone };

    } catch(error) {
        console.error('Lỗi gửi OTP:', error);
        return { success: false, error: error.message };
    }
}