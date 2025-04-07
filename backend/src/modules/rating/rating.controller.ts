import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { RolesGuard } from 'src/modules/auth/role.guard';
import { RATING_SERVICE } from 'src/modules/rating/rating.di-token';
import { ICreateRating, IGetAverageRating } from 'src/modules/rating/rating.dto';
import { IRatingService } from 'src/modules/rating/rating.port';
import { ServiceType, UserRole } from 'src/share/enums';
import { HEADER } from 'src/share/interface';

@ApiTags('rating')
@Controller('rating')
export class RatingController {
  constructor(
    @Inject(RATING_SERVICE)
    private readonly ratingService: IRatingService,
  ) { }

  @Post('create-rating')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.CUSTOMER)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiBody({
    type: Object,
    description: 'Create a Rating for customer',
    examples: {
      'Create a Rating for customer': {
        value: {
          tripId: '67873bb9cf95c847fe62ba5f',
          rate: 5,
          feedback: 'Great',
        },
      },
    },
  })
  async createRating(@Request() req, @Body() data: ICreateRating) {
    return await this.ratingService.createRating(req.user._id, data);
  }

  @Get('get-rating-by-trip-id/:tripId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  @ApiBearerAuth(HEADER.AUTHORIZATION)
  @ApiBearerAuth(HEADER.CLIENT_ID)
  async getRatingByTripId(@Param('tripId') tripId: string) {
    return await this.ratingService.getRatingByTripId(tripId);
  }

  @Get('average-rating')
  @HttpCode(HttpStatus.OK)
  // @UseGuards(AuthGuard)
  // @Roles(UserRole.ADMIN, UserRole.MANAGER)
  // @ApiBearerAuth(HEADER.AUTHORIZATION)
  // @ApiBearerAuth(HEADER.CLIENT_ID)
  @ApiOperation({ summary: 'Get average rating of driver or customer' })
  @ApiQuery({
    name: 'serviceType',
    enum: ServiceType,
    required: true,
  })
  @ApiQuery({
    name: 'driverId',
    type: String,
    required: false,
  })
  @ApiQuery({
    name: 'customerId',
    type: String,
    required: false,
  })
  async averageRating(@Query() query: IGetAverageRating) {
    return await this.ratingService.averageRating(query);
  }
}
