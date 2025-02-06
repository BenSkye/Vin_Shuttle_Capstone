import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ITripService } from './trip.port';
import { CreateTripDto, UpdateTripDto } from './trip.dto';
import { TRIP_SERVICE } from './trip.di-token';
import { RolesGuard } from 'src/modules/auth/role.guard';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';

@ApiTags('trips')
@Controller('trips')
export class TripController {
    constructor(
        @Inject(TRIP_SERVICE)
        private readonly tripService: ITripService
    ) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    // @UseGuards(AuthGuard, RolesGuard)
    // @Roles('admin')
    // @ApiBearerAuth('authorization')
    @ApiOperation({ summary: 'Create a new trip' })
    @ApiBody({
        type: 'CreateTripDto',
        description: 'Trip creation payload',
        examples: {
            example1: {
                value: {
                    name: "Morning Shuttle",
                    description: "Morning shuttle service from district 1 to district 2",
                    route: {
                        waypoints: [
                            {
                                id: 1,
                                name: "Start Point",
                                position: { lat: 10.762622, lng: 106.660172 },
                                description: "District 1 Terminal"
                            },
                            {
                                id: 2,
                                name: "End Point",
                                position: { lat: 10.776308, lng: 106.695274 },
                                description: "District 2 Terminal"
                            }
                        ],
                        routeCoordinates: [
                            { lat: 10.762622, lng: 106.660172 },
                            { lat: 10.776308, lng: 106.695274 }
                        ],
                        estimatedDuration: 30,
                        totalDistance: 8.5
                    },
                }
            }
        }
    })
    async createTrip(
        @Body() createTripDto: CreateTripDto) {
        return this.tripService.createTrip(createTripDto);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get all trips' })
    @ApiResponse({
        status: 200,
        description: 'Returns all trips'
    })
    async getAllTrips() {
        return this.tripService.getAllTrips();
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get a trip by id' })
    @ApiResponse({
        status: 200,
        description: 'Returns the trip'
    })
    async getTrip(@Param('id') id: string) {
        return this.tripService.getTrip(id);
    }

    @Put(':id')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth('authorization')
    @ApiOperation({ summary: 'Update a trip' })
    @ApiBody({
        type: 'UpdateTripDto',
        description: 'Trip update payload',
        examples: {
            example1: {
                value: {
                    name: "Updated Morning Shuttle",
                    description: "Updated morning shuttle service route",
                    schedules: [
                        {
                            departureTime: "07:30",
                            daysOfWeek: [1, 2, 3, 4, 5]
                        }
                    ],
                    status: "active"
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Trip has been updated successfully'
    })
    async updateTrip(
        @Param('id') id: string,
        @Body() updateTripDto: UpdateTripDto
    ) {
        return this.tripService.updateTrip(id, updateTripDto);
    }

}
