import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Param, Post, Query, Request, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "src/modules/auth/auth.guard";
import { Roles } from "src/modules/auth/decorators/roles.decorator";
import { RolesGuard } from "src/modules/auth/role.guard";
import { BOOKING_SERVICE } from "src/modules/booking/booking.di-token";
import { bookingParams, IBookingDestinationBody, IBookingHourBody, IBookingScenicRouteBody, IBookingSharedRouteBody } from "src/modules/booking/booking.dto";
import { IBookingService } from "src/modules/booking/booking.port";
import { BookingStatus, UserRole } from "src/share/enums";
import { PaymentMethod } from "src/share/enums/payment.enum";
import { SortOrderOption } from "src/share/enums/sortOrderOption.enum";
import { HEADER, QueryOptions } from "src/share/interface";

@ApiTags('booking')
@Controller('booking')
export class BookingController {
    constructor(
        @Inject(BOOKING_SERVICE)
        private readonly bookingService: IBookingService
    ) { }

    @Post('create-booking-hour')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.CUSTOMER)
    @ApiBearerAuth(HEADER.AUTHORIZATION)
    @ApiBearerAuth(HEADER.CLIENT_ID)
    @ApiBody({
        type: Object,
        description: 'Create a Booking Hour and their Trip for customer',
        examples: {
            'Create a Booking Hour and their Trip for customer': {
                value: {
                    startPoint: {
                        position: {
                            lat: 10.8376,
                            lng: 106.84268,
                        },
                        address: 'Trường liên cấp VinSchool, Đường V3, Vinhomes Grand Park, Long Binh Ward, Thủ Đức, Ho Chi Minh City, 71216, Vietnam'
                    },
                    date: '2025-02-17',
                    startTime: '11:00',
                    durationMinutes: 30,
                    vehicleCategories: [
                        {
                            categoryVehicleId: '67873bb9cf95c847fe62ba5f',
                            name: 'Xe điện 6 Chỗ',
                            quantity: 2
                        }
                    ],
                    paymentMethod: 'pay_os'
                }
            }
        }
    })
    async bookingHour(
        @Request() req,
        @Body() data: IBookingHourBody,
    ) {
        return await this.bookingService.bookingHour(
            req.user._id,
            data
        )
    }


    @Post('create-booking-scenic-route')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.CUSTOMER)
    @ApiBearerAuth(HEADER.AUTHORIZATION)
    @ApiBearerAuth(HEADER.CLIENT_ID)
    @ApiBody({
        type: Object,
        description: 'Create a Booking Scenic route and their Trip for customer',
        examples: {
            'Create a Booking Scenic route and their Trip for customer': {
                value: {
                    startPoint: {
                        position: {
                            lat: 10.8376,
                            lng: 106.84268,
                        },
                        address: 'Trường liên cấp VinSchool, Đường V3, Vinhomes Grand Park, Long Binh Ward, Thủ Đức, Ho Chi Minh City, 71216, Vietnam'
                    },
                    scenicRouteId: '67ba067fa6cb16fffb59a4e4',
                    date: '2025-02-17',
                    startTime: '11:00',
                    vehicleCategories: [
                        {
                            categoryVehicleId: '67873bb9cf95c847fe62ba5f',
                            name: 'Xe điện 6 Chỗ',
                            quantity: 2
                        }
                    ],
                    paymentMethod: 'pay_os'
                }
            }
        }
    })
    async bookingScenicRoute(
        @Request() req,
        @Body() data: IBookingScenicRouteBody,
    ) {
        return await this.bookingService.bookingScenicRoute(
            req.user._id,
            data
        )
    }


    @Post('create-booking-destination')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.CUSTOMER)
    @ApiBearerAuth(HEADER.AUTHORIZATION)
    @ApiBearerAuth(HEADER.CLIENT_ID)
    @ApiBody({
        type: Object,
        description: 'Create a Booking destination and their Trip for customer',
        examples: {
            'Create a Booking destination and their Trip for customer': {
                value: {
                    startPoint: {
                        position: {
                            lat: 10.8376,
                            lng: 106.84268,
                        },
                        address: 'Trường liên cấp VinSchool, Đường V3, Vinhomes Grand Park, Long Binh Ward, Thủ Đức, Ho Chi Minh City, 71216, Vietnam'
                    },
                    endPoint: {
                        position: {
                            lat: 10.8468,
                            lng: 106.8375,
                        },
                        address: 'Hồ bơi nội khu S9, Đường D7, Vinhomes Grand Park, Long Binh Ward, Thủ Đức, Ho Chi Minh City, 71216, Vietnam'
                    },
                    durationEstimate: 7,
                    distanceEstimate: 2.8,
                    vehicleCategories:
                    {
                        categoryVehicleId: '67873bb9cf95c847fe62ba5f',
                        name: 'Xe điện 6 Chỗ',
                    },
                    paymentMethod: 'pay_os'
                }
            }
        }
    })
    async bookingDestination(
        @Request() req,
        @Body() data: IBookingDestinationBody,
    ) {
        return await this.bookingService.bookingDestination(
            req.user._id,
            data
        )
    }


    @Post('create-booking-shared-route')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.CUSTOMER)
    @ApiBearerAuth(HEADER.AUTHORIZATION)
    @ApiBearerAuth(HEADER.CLIENT_ID)
    @ApiBody({
        type: Object,
        description: 'Create a Booking for shared route',
        examples: {
            'Create a Booking for shared route': {
                value: {
                    startPoint: {
                        position: {
                            lat: 10.8376,
                            lng: 106.84268,
                        },
                        address: 'Trường liên cấp VinSchool, Đường V3, Vinhomes Grand Park, Long Binh Ward, Thủ Đức, Ho Chi Minh City, 71216, Vietnam'
                    },
                    endPoint: {
                        position: {
                            lat: 10.8468,
                            lng: 106.8375,
                        },
                        address: 'Hồ bơi nội khu S9, Đường D7, Vinhomes Grand Park, Long Binh Ward, Thủ Đức, Ho Chi Minh City, 71216, Vietnam'
                    },
                    durationEstimate: 7,
                    distanceEstimate: 2.8,
                    numberOfSeat: 2,
                    paymentMethod: 'pay_os'
                }
            }
        }
    })
    async bookingSharedRoute(
        @Request() req,
        @Body() data: IBookingSharedRouteBody,
    ) {
        return await this.bookingService.bookingSharedRoute(
            req.user._id,
            data
        )
    }

    @Get('customer-personal-booking')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.CUSTOMER)
    @ApiBearerAuth(HEADER.AUTHORIZATION)
    @ApiBearerAuth(HEADER.CLIENT_ID)
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit number of vehicles' })
    @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Skip number of vehicles' })
    @ApiQuery({ name: 'orderBy', required: false, type: String, description: 'Order by field' })
    @ApiQuery({
        name: 'sortOrder',
        required: false,
        enum: SortOrderOption,
        description: 'Sort order (asc, desc)'
    })
    async getCustomerPersonalBooking(
        @Request() req,
        @Query() query: QueryOptions
    ) {
        return await this.bookingService.getCustomerPersonalBooking(req.user._id, query)
    }


    @Get('customer-personal-booking/:id')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.CUSTOMER)
    @ApiBearerAuth(HEADER.AUTHORIZATION)
    @ApiBearerAuth(HEADER.CLIENT_ID)
    @ApiOperation({ summary: 'get customer booking by id' })

    async getCustomerPersonalBookingById(
        @Param('id') id: string,
        @Request() req,
    ) {
        return await this.bookingService.getCustomerPersonalBookingById(req.user._id, id)
    }

    @Get('list-booking')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth(HEADER.AUTHORIZATION)
    @ApiBearerAuth(HEADER.CLIENT_ID)
    @ApiOperation({ summary: 'get list booking by query' })
    @ApiQuery({
        name: 'status',
        required: false,
        enum: BookingStatus,
        description: 'Filter by booking status'
    })
    @ApiQuery({
        name: 'customerId',
        required: false,
        type: String,
        description: 'Filter by customer ID'
    })
    @ApiQuery({
        name: 'bookingCode',
        required: false,
        type: Number,
        description: 'Filter by booking code'
    })
    @ApiQuery({
        name: 'paymentMethod',
        required: false,
        enum: PaymentMethod,
        description: 'Filter by payment method'
    })
    @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Limit number of vehicles' })
    @ApiQuery({ name: 'skip', required: false, type: Number, description: 'Skip number of vehicles' })
    @ApiQuery({ name: 'orderBy', required: false, type: String, description: 'Order by field' })
    @ApiQuery({
        name: 'sortOrder',
        required: false,
        enum: SortOrderOption,
        description: 'Sort order (asc, desc)'
    })
    async getListBookingByQuery(
        @Query() query: bookingParams
    ) {
        return await this.bookingService.getListBookingByQuery(query)
    }

    @Get('total-transaction')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiBearerAuth(HEADER.AUTHORIZATION)
    @ApiBearerAuth(HEADER.CLIENT_ID)
    @ApiOperation({ summary: 'get total transaction has confirm' })
    async totalTransaction() {
        return await this.bookingService.totalTransaction()
    }
}