import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ISMSProvider } from 'src/share/share.port';

@Injectable()
export class SmsService implements ISMSProvider {
  private readonly eSMS_DOMAIN = process.env.ESMS_DOMAIN;
  private readonly eSMS_API_KEY = process.env.ESMS_API_KEY;
  private readonly eSMS_SECRET_KEY = process.env.ESMS_SECRET_KEY;
  constructor(private readonly httpService: HttpService) {}

  async sendSms(phone: string, content: string) {
    const payload = {
      ApiKey: this.eSMS_API_KEY,
      Content: content,
      Phone: phone,
      SecretKey: this.eSMS_SECRET_KEY,
      Brandname: 'Baotrixemay',
      SmsType: '2',
      Sandbox: '1',
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.eSMS_DOMAIN, payload, {
          headers: { 'Content-Type': 'application/json' },
        }),
      );
      console.log('respone for esms', response.data);
    } catch (error) {
      throw new Error(`Failed to send SMS: ${error.message}`);
    }
  }
}
