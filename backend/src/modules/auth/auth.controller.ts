import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Put,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AUTH_SERVICE } from 'src/modules/auth/auth.di-token';
import { customerLoginDto } from 'src/modules/auth/auth.dto';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { IAuthService } from 'src/modules/auth/auth.port';
import { KEYTOKEN_SERVICE } from 'src/modules/keytoken/keytoken.di-token';
import { IKeyTokenService } from 'src/modules/keytoken/keytoken.port';
import { CreateUserDto, ICreateUserDto } from 'src/modules/users/users.dto';
import { HEADER } from 'src/share/interface';
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AUTH_SERVICE) private readonly authService: IAuthService,
    @Inject(KEYTOKEN_SERVICE) private readonly keyTokenService: IKeyTokenService,

  ) { }

  @Post('register')
  @HttpCode(201)
  @ApiOperation({ summary: 'Register account' })
  @ApiBody({
    type: CreateUserDto,
    description: 'Register account',
    examples: {
      'Register account': {
        value: {
          name: 'khanhHg',
          phone: '0838683868',
          email: 'khanhhg@gmail.com',
          password: 'khanhadmindepzai',
          avatar:
            'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTEBUSERIVFhIWFRYWFRcYEhcXFxcXFRgiFxcXFRUYHSggGRslHhgXITEhJSkrLi4uFyAzODMsNygtLisBCgoKDg0OGxAQGyslHiUtLystLy0rKy0tKy8tLS0tLS8tNS8tLS0tLS0tLi01LS0tLS0rLS0tLS0tNS0tLS0tLf/AABEIAPYAzQMBIgACEQEDEQH/xAAcAAEAAgMBAQEAAAAAAAAAAAAABgcDBAUCAQj/xABAEAACAQIDBQUGAwUHBQEAAAABAgADEQQSIQUxQVFhBgcicYETMkJSkaEUI7FyksHR8BUzYoKissI0U3Ph8Rb/xAAaAQEAAgMBAAAAAAAAAAAAAAAABAUBAgMG/8QAMREAAgIBAwIDBAoDAAAAAAAAAAECAxEEEiExQQVRcRMiYbEGFCMyQoGRwdHwJDOh/9oADAMBAAIRAxEAPwC8YiIAiIgCIiAIiIAiIgCIiAImrjNo0qQvUqKvmdfpvnEpdojiKopYVTlGtSqwsFXjlHM7hf8AhNJWRTx3OkapSWccEliYxWXcGH1EyTc5iIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCcPau2xTxVGhewIZ6h5KFbKPUj7dZ62j2ow1FsrPdhvCi9vOV92t2rTqYg1VY5WChRY5rgWICjU+kjXXqK918kvT6dyfvLjBNsb2tp0qasfFUdQ6oPhVtVzHgbWMi+0e0WJq+9UFJT8I0NvTxfWcGgzE6A5uHEi3L0mKqzD4ST5gH7yFO+cu5Pr00IduTPVIOuYseo/iTPK1WAsGIB1IBtNT8Xb30depAI+qk29bTbohSMxdQu/MWG7oOM4kjBhfEld4e3Ma/YHN9pKOye1SRm/E1MoNrBA6C3Akte/QC84y4+ifdVSRuuAbgc7HQ9dZrna1MvdUNOvu4ZXA4G3vjoQCOFpvGTi8o1nBTWGXJhK4dQwYMOY3fTh5TNKn2V2gq0aucG4PvJ8JHTkessvZW06eIph6ZvzHFTyIllTerFjuVF+ndbz2N2IidyMIiIAiIgCIiAIiIAiIgCIiAJ4qgFTc2FtdbacdeE9zBjlU02z+7YlhzUakeRGnrMPoZXUr7b+OZ/Dh6K06J90hFVnHzcwDw5icOlspi2ZgFJ0uTc232AH1nt9tNUxBdl0Ubr/ABvqTu4AADoxmvtTaTMFt4RnXjrrobnyJlPOTk8l9XDasIY0/BQN2VhY3Fy9/wCh6mZE24LZcQrU355P4ETS2XQNSojp/wB6zfsgBxf90/vCWC+HU7xObN20upXeLx6X8L5+WhFvMHd6TUx1BwA5A9m2oZdUJ6n5vOxlkvs6md6g+YB/UTBQ2PTTMoUezf3k+G/MDh6dIHtEViRa1+Oo6+UVTmFm1/X6yxMNsBEzUyA9FjmVWFyjcbE8D/DfrNHaHY5Dc0iVPLev0Oo+vpM7jO5Ec2dj2UZifEhBzdODHy4/XpLc7NLRq0lxCUkSodHyDL4hvuF389ecpnFYapRco4sbWPEMp09RLE7osYXoVVPwmmb33llIJ/0iStK/fwRNbD7PcifxESyKcREQBERAEREAREQBERAEREATFiqWdGTdmUr9RaZYgH58pYl6b1FdfGHs3CxVQpH1WY8ViWew0ABvaS3vM2H7LEfiEH5dY+LktQDUf5gL+YaRLCYc1Ki0195mAHrx9N/pKecNksM9BXNTipImHZSiyYRqi0y7sxKLcDNayjU7hcXvymT+ysfUOapjBSPBKaXUdL3BPreSLC0BTRUX3VAA9JE8F2hFfE1qTYipQFEXfIMPkQZglqhq3ao1z4sgAGoF9CcV1yn0Oc7EuWSLZVCuila9Vau7KwTI3UMAbHhum9PiUKiDLWylx8SghXHBgpJK35XNjfUjWfZrJNPDNU01lHJ2t+NLWw3sAlveqM5YnyC2A+s1tn7TxSVFpYyiAHOVatO5TMdwcXOW+6+nlNnb23UwwF7Fm3XbKo5FmAJ1OgChmNjYaEjawWIqm3tqQXNfK6OXQkb0bMqujjXRlG468JsoSa3Y4MuSXDIb3j1MuIw5+ZHDejDL+pk47q9nGlgi5FjVfMv7CjKv1IY+sjeN7PnaG1BTNxh8PTQ1mGmrEsKan5mFvIXPKWpSphVCqAFAAAAsABoABykzS1/jZG1ly2Ktde57iIk0rRERAEREAREQBERAEREAREQBPjGwuZ9nmotwRzBH1gER27tQEfmKXUnw0woN7a3Iaw05kzmbO2fhmdcTRXKbMtgMoB3G6cGGo9eOk6OPwVzZhqtwR5zDgsEtLPkAAZg1gLDNlCk265RKWUm293UvIqCgtpuK1iDyMp7E93OJqY9lC/ktVLe2LLlCM18x1vmA+G17jlrLTr17TLQq3ma7dhl1vGTo46qGbw7gLDrNOpVAZVPxEgeYGa30BPpPc0tr0s9PIKZcm1gGyWINw2e91sdbjUcBMSlullmkIqKwiC98uFqFcNVS4RC4ZhplclShJG64Bseh5yTd15xH9nVauKd2avWLoXJLMMqrmF+Hh06L1nYwodKSK75nCgM3zEDU/WGxZJ1JPrOyvUY7TDpcv7+ZqbNx/wCa6inlu7eMOCxZdLsANNFAGp0A3Sb7NxBenc7wbH0kXp0LsDa54DrJRs7D5EAO86n1m+k3bn5HDW7MLHU2oiJYlaIiIAiIgCIiAIiIAiIgCIiAIiIBhr4ZH95b/r9ZrtsunlIA1INiSTab0TR1xfVG6nJdGQjE4U5iCNQdZ7oUrSU43ArU13Nz/nznJrbNqLwuOn8t8rbNNKD45RZ16uM1h8Mhn/6BaOMq4bELiiSwqUnohag9mwGjIwNgGDC4/hru7R7WYHDreo+MJ4KcNlLHfYMyKv3nRxmBSofFcMtwGBsw5g8COhBE1G2AjjLULVF0uhCkGxuMwC8xMxsjjDSO2yD5baM2DqtUopUYFS6h8ptdQ2oUkbyAQCeYM808KSwAFyTYCdqjs6o3w2HXT7b518Ds9aeu9uf8hMQ08rHlrCOUtXGtYXLMmCwopoAALgam2pPHWbERLRJJYRUttvLEREyYEREAREQBERAEREAREQBERAEREAREiHeV2lbB4YCkbVqrZVItdVAuzi4Ou4DT4ukxKSiss6VVysmoR6s7G2u0mGwv99VAe18g1cjnlG4dTYSn+3fbCpj6iU6T1MPh1IB8VmJJsz1MjWIA3KCePPSPvUDPUZg5ZsxYl7km9zc236dZp1dL6HmAd/6SFO6Uuh6DT+HVV8y5ZdNDBAKoVrqFAB33AGhvx85Cu1f4jBY1cZh6jL7RVW490lBYo67mBGov1ta15Ke6+1bZ4zXLU6j09WtYAB1G7gHA9J1O2uyFqbOxC5PEtM1FsSTen4tCeYBHrOdemkveRH+sRhb7OSys4MvYztzQxtNFdlp4k6GmWtmI4077xxtvGu/fJbPzHhKOVh4WsdBruvob6dZY/d320qmvTwmIYslRbU2Y3ZXF7KzHUg5Tv1vbnJNd+XhnLV+G7U519PL+C1YiJJKgREQBERAEREAREQBERAEREAREQBERAEojt9tv8TjKrLUYU6bCilr2smbMd43tmN+QEtvtrtU4bA1qqX9plyU7C5zv4VNul83+WUNVFTxWB9/TThrIuol+EuvCaeXY/RfufGcZ28bbmO7/AA/tTA6glSSSPZsTca6Frcef6T7Vd87XNkseI1su4DzvM1N3IHit4G+NebWO+Ri56ln9ztvwVbLf/qWOotvpU+pk4r0g6sh3MpU+TC0hPdArfgahY3vXJHivp7NB/OTe9z0H38ukn1fcR5nWP7eXqfnVBksGZrpUIPh4i1wfF0mWjVK1EK1HDK7AG25gQQfe4Ezd7UUGp4zFoHtauWHjIsHzMB9Cs59dmufH8dx4juIOn6SA1h4PSxlvin5n6J2LtAYjD0q67qiK1uRI1Hobj0m7Kz7pdtWargncHVqtHXWxPjX7hvVpZksK5bo5PKaml02uH6egiIm5wEREAREQBERAEREAREQBERAEREAq3vnx2tCgQSuV6hF7Xa4VeHAZ/rKzxNO5YgXu9wOe/UHf/wDZO+8/aQq44U/Z2NBSuYneHs2Yjly8z6R/C4KrWH5VNivz6KvoW3/eQbWtzeT0ujeyiKaOTQpm+tI+63zfLu8+EyLTOn5Z9xvm5tp/XOeShDuHQ5wGBtpwta1t/rPqpoPyz7j/ADf4tP65ziydF8Fs906W2cNLXqOba9BfXykxkQ7qxbZyC2XxVDbX52118pL5Y1/dR5fU/wC6fqyme8ehl2lWIC+OnSfVrbgE116SNVKRY6BPcXcQfl8+Rkz716J/GqwA8WHy6gHVal+MjewtnNiK6pmyflsdFUm6kAra44ayFbxN5L7TT/x4v4fI8bJxVTD10rqLFLNfQ3sviW4ubGxHkZ+ilNwDzlGbc2GcPSNX21wCosUym7MFFiDrqd33lr9i9q1MTg6dWqpD6qTbR8ptnHQ/reddNNPOCt8TW5Rn+X8HdiIksqBERAEREAREQBERAEREAREQBERAKK738bWp4/O1HwgoEzL4HVPFqdzXJYdAbcJNez+Np16CVqdirAEbvDzU8iDceknlegrjK6qy8mAI+hnM2jsxVXNSRVy71VQAR5DiP5yFqKMrciyq1iaUGsdinu8PZnscQcSpYJVWzAC4DggHiN4sbdGMjlGsjKNW9x9CADx6mW72g2WMThnomwLC6Ei4DjVTblf7EyqK1OpQPs690cK2mS2mmotoRrvEjweUW+ntWNrZaHdrVy7PpFd16o1/8jcpM6LswubAff7yB93eKRsCq+0BIeoNSA3vX3XJ4yVVsaAPHUAHVlAlnWvcR53VSSvnz3fzIN3qjNWoMFuMlYXvyC2HrIjsaqaeJw7gKpzqCc/wl7N8WujHnvkl7wsbSqtRFI+0KCtmy3IGZRYXAsb25zjdldhGvVXNTIpoSXJLcLFUHmfsD6wtQsTeS90M4vSKWeOfmyydqdkU2hTCVajoiuG8FrsQNNTutfl+klOxtmrhsPToIWK01ygtbMeNzYAceUz4OjkQLxtr5nUzNJVNahFeZRXXSm8Z4ERE6nAREQBERAEREAREQBERAEREAREQBET4YBX+0Ns06bvY3GdrD14dJFNuVziQQ9h8mgOXrY7/AOvRiaueo7/MzN9STMWvSTKdBVXnjOfModR4vqbZLDxjpj4dzlbM2c6oRVK3zG1gCCLDytrebS4Mf0Ju4dS7hEBZmIUAczuF56x+FalUamw8SHKbH9LyVCKglBdiHfdZfOV01y3z5ZObidnBiutgAwPM5hbTgOMkfZjHGgVpIgZcwyrzJO6/M9ZxkCnz67/vN7ZbZa9I8qtM/wCsTlPT1yy2uWdq/ENRFQrU2ox6L1fPr17lziIiVx6QREQBERAEREAREQBERAEREAREQBERAE1tp1slCo/y03b6KTNmcbthWy4GseaZf3yF/jNorMkjnbLbBv4MqZNwhkvv3cv5z6J5qvYXlueQ7kq7u8CHxLVLeGkun7b3A+wb6iYu3+GyY3NwqU1b/MvgP2CyS93GDyYIOfequzny91fst/Wc/vPoaYeryd6f74BH+yQlZm//AIXU9Oo6L49f7+RByomXDGzqeTKfoZjnqnvHmJNfQpl1LuiIlMeyEREAREQBERAEREAREQBERAEREAREQBIx3iVLYK3zVFH0u3/GSeQXvIaoTSQEGnYvl0vmF1vfya1us60rM0RdbLbRL9P1ITNHE1bnTcPvNiuH3BGHp/KeMNhnzKxQ2DAm/hBANyLmWmTzMY+Zd2ycL7KhSpfJTRf3VAnA7yad8CW+SpTb6nJ/ykh2bixVpJVAIDqGAPWcLvDLfgWVQLM6BiTawDZgfqoHrKqvPtF6np78fV5Y6Y/YrNGuLiZKQ8Q8x+s06dOou5SR01H1E3MPTcn3SvU8PIS0bR5ja8l3RNDYNcvhqbsbsV1PMjQ3+k35UNYeD10Zbkn5iIiYNhERAEREAREQBERAEREAREQBERAEinbzBflfiS4CUlOe/wAt73HXpJXIj3gba9jTWmpxCk+Jno4UV8qjcDn8KknW5ufD6zKm4e8h7BX/AGb6MgP9p0XU5K9M6fC4J+gNxPmzsBVxDFaKlyLAkblvuzNuHHfynJ2vtZatBiMZSxiN4fZ1sKtHEUmI0qUmUeKxtezW4EayV9xNQWxaDnRb/eDNlr25bcCf0dUaHc5vjtj0/nyLUoUgiqqiwUBQOQAsJye2GCqVsHUp0lzOShAuBfK4Y2vxsJ2omqeHk0nBSi4vo1go6lWWnUZXNmUlWFxdSDYhh0m5gsdSq1ko06qNVc2Vc4uT/CRPbmIX+1cRUNOnUH4mrZan92fEVUuOKg2JG42kjwe3fZ1Qg2jUrVQQfZ4XZtJqS2N7LcKWUfMoHQzK17lng7W/RuNai3NtNZ6dPn+xb2wcE1HDpTcgsLk23eJibD6zoTW2djBWpLUUMAwvZlKsOYZTqCJszDeeTmobFt8uBERMGRERAEREAREQBERAEREAREQBERAMdaoFFyenqd0i2K7KByWOMxquSTmXElbE8kAygdLSUYmgHUq24zlvsmoPcrG3Iki36/a0bU+pvCxx6FVd4PZjFq9JiRiVJKLVFMLWJOoWvl0awBs/nfhJp3Y9lThKZqP/AHlQWblYblXoOfEnpJFhtiDNmqsXPUk+mZtbdBadcC2g3Tmqoxlu7ku3X2zpVPRfDufZ8In2J0IJRXb3sZUoVmq0ULIxJZVBJUk6lRxUn6HSTDs92OxH4emuIxNSgFUfk4UikL/NWqgE1HO88L7pPsXhVqLZh5HiPKcobGqLpTqkLyzMAPJdROapipOSJ8/EbZ1Rrl279/78T5sbZYwxJFeu6tYFatU1ADuBUsMwOvOd2czDbKswao7OQbgXNvv/AOp050wl0IUpOTyxERBqIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIAiIgCIiAIiIB//9k=',
          role: 'admin',
        },
      },
    },
  })
  async registerCustomer(@Body() data: ICreateUserDto) {
    return this.authService.registerCustomer(data);
  }

  @Post('login-customer')
  @HttpCode(200)
  @ApiOperation({ summary: 'Customer login by phone number' })
  @ApiBody({
    type: customerLoginDto,
    description: 'Customer login by phone number',
    examples: {
      'Customer Login': {
        value: {
          phone: '0838683868',
        },
      },
    },
  })
  async loginCustomer(@Body() data: { phone: string }) {
    return this.authService.loginCustomer(data.phone);
  }

  @Post('login-by-password')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login by email and password' })
  @ApiBody({
    type: customerLoginDto,
    description: 'Login by email and password',
    examples: {
      Login: {
        value: {
          email: 'khanhHg@gmail.com',
          password: '123',
        },
      },
    },
  })
  async loginByPassword(@Body() data: { email: string; password: string }) {
    return this.authService.loginByPassword(data.email, data.password);
  }

  @Put('change-password')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard)
  @ApiBearerAuth('authorization')
  @ApiOperation({ summary: 'Change user password' })
  @ApiBody({
    type: 'changeUserPassword',
    description: 'Change user password',
    examples: {
      'Change Password': {
        value: {
          oldPassword: '123',
          newPassword: '1234',
        },
      },
    },
  })
  async changePassword(@Request() req, @Body() data: { oldPassword: string; newPassword: string }) {
    return this.authService.changePassword(req.user._id, data.oldPassword, data.newPassword);
  }

  @Post('refresh-token')
  @HttpCode(200)
  async refreshToken(@Req() req) {
    console.log('req.headers[HEADER.CLIENT_ID]', req.headers[HEADER.CLIENT_ID]);
    console.log('req.headers[HEADER.REFRESH_TOKEN]', req.headers[HEADER.REFRESH_TOKEN]);
    return this.keyTokenService.handleRefreshToken(req.headers[HEADER.CLIENT_ID], req.headers[HEADER.REFRESH_TOKEN]);
  }
}
