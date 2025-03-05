import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Param, Post, Request, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "src/modules/auth/auth.guard";
import { Roles } from "src/modules/auth/decorators/roles.decorator";
import { RolesGuard } from "src/modules/auth/role.guard";
import { RATING_SERVICE } from "src/modules/rating/rating.di-token";
import { ICreateRating } from "src/modules/rating/rating.dto";
import { IRatingService } from "src/modules/rating/rating.port";
import { UserRole } from "src/share/enums";

@ApiTags('rating')
@Controller('rating')
export class RatingController {
    constructor(
        @Inject(RATING_SERVICE)
        private readonly ratingService: IRatingService
    ) { }

    @Post('create-rating')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.CUSTOMER)
    @ApiBearerAuth('authorization')
    @ApiBody({
        type: Object,
        description: 'Create a Rating for customer',
        examples: {
            'Create a Rating for customer': {
                value: {
                    tripId: '67873bb9cf95c847fe62ba5f',
                    rating: 5,
                    comment: 'Great'
                }
            }
        }
    })
    async createRating(
        @Request() req,
        @Body() data: ICreateRating
    ) {
        return await this.ratingService.createRating(
            req.user._id, data
        )
    }

    @Get('get-rating-by-trip-id/:tripId')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiBearerAuth('authorization')
    async getRatingByTripId(
        @Param('tripId') tripId: string
    ) {
        return await this.ratingService.getRatingByTripId(tripId)
    }

}