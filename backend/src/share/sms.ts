import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ISMSProvider } from 'src/share/share.port';
import * as https from 'https';

@Injectable()
export class SmsService implements ISMSProvider {
  private readonly eSMS_DOMAIN = process.env.ESMS_DOMAIN;
  private readonly eSMS_API_KEY = process.env.ESMS_API_KEY;
  private readonly eSMS_SECRET_KEY = process.env.ESMS_SECRET_KEY;

  private readonly ACCESS_TOKEN = "_rq6cIXLz5g75Hvfhk-pcjFy2AQaqTHh"; // Thay bằng access token thực
  private readonly SMS_API_URL = 'api.speedsms.vn';
  private readonly SMS_API_PATH = '/index.php/sms/send';


  constructor(private readonly httpService: HttpService) { }

  // async sendSms(phone: string, content: string) {
  //   const payload = {
  //     ApiKey: this.eSMS_API_KEY,
  //     Content: content,
  //     Phone: phone,
  //     SecretKey: this.eSMS_SECRET_KEY,
  //     Brandname: 'Baotrixemay',
  //     SmsType: '2',
  //     Sandbox: '1',
  //   };

  //   try {
  //     const response = await firstValueFrom(
  //       this.httpService.post(this.eSMS_DOMAIN, payload, {
  //         headers: { 'Content-Type': 'application/json' },
  //       }),
  //     );
  //     console.log('respone for esms', response.data);
  //   } catch (error) {
  //     throw new Error(`Failed to send SMS: ${error.message}`);
  //   }
  // }


  async sendSms(phone: string, content: string): Promise<boolean> {
    // Validate input
    if (!phone || !/^(\+84|0)[0-9]{9,10}$/.test(phone)) {
      console.error('Số điện thoại không hợp lệ:', phone);
      return false;
    }

    // Chuẩn hóa số điện thoại (đổi đầu số 0 thành +84)
    const normalizedPhone = phone.startsWith('0')
      ? '+84' + phone.substring(1)
      : phone;

    if (!content || content.trim().length === 0) {
      console.error('Nội dung SMS không được trống');
      return false;
    }

    // Tạo payload theo yêu cầu của SpeedSMS
    const params = JSON.stringify({
      to: [normalizedPhone], // Sử dụng số đã chuẩn hóa
      content: content,
      sms_type: 1, // Loại SMS (2 là CSKH)
      // sender: 'VinShuttle' // Brandname đã đăng ký
    });

    // Tạo auth header
    const auth = "Basic " + Buffer.from(this.ACCESS_TOKEN + ':x').toString('base64');

    // Cấu hình options cho request
    const options = {
      hostname: this.SMS_API_URL,
      port: 443,
      path: this.SMS_API_PATH,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': auth,
        'Content-Length': Buffer.byteLength(params) // Sử dụng Buffer.byteLength để tính đúng độ dài
      }
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => body += chunk);

        res.on('end', () => {
          try {
            const result = JSON.parse(body);
            console.log('SMS API Response:', result); // Log chi tiết phản hồi

            if (result.status === 'success') {
              resolve(true);
            } else {
              console.error(`Send SMS failed - Code: ${result.code || 'N/A'}, Message: ${result.message || 'No message'}`);
              resolve(false);
            }
          } catch (e) {
            console.error('Error parsing SMS response:', e, 'Raw response:', body);
            resolve(false);
          }
        });
      });

      req.on('error', (e) => {
        console.error('Send SMS request failed:', e);
        resolve(false);
      });

      req.write(params);
      req.end();
    });
  }


  async sendSmsWithoutBrandname(phone: string, content: string): Promise<boolean> {
    // Validate input
    if (!phone || !/^(\+84|0)[0-9]{9,10}$/.test(phone)) {
      console.error('Invalid phone:', phone);
      return false;
    }

    const normalizedPhone = phone.startsWith('0')
      ? '+84' + phone.substring(1)
      : phone;

    const params = JSON.stringify({
      to: [normalizedPhone],
      content: content,
      sms_type: 1, // QUAN TRỌNG: sms_type = 1 (quảng cáo)
      // KHÔNG có tham số sender
    });

    const options = {
      hostname: 'api.speedsms.vn',
      path: '/index.php/sms/send',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(this.ACCESS_TOKEN + ':x').toString('base64'),
        'Content-Length': Buffer.byteLength(params)
      }
    };

    return new Promise((resolve) => {
      const req = https.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(body);
            console.log('API Response:', result);
            resolve(result.status === 'success');
          } catch (e) {
            console.error('Parse error:', e);
            resolve(false);
          }
        });
      });

      req.on('error', (e) => {
        console.error('Request failed:', e);
        resolve(false);
      });

      req.write(params);
      req.end();
    });
  }
}
