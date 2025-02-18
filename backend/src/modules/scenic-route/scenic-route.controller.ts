import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IScenicRouteService } from './scenic-route.port';
import { SCENIC_ROUTE_SERVICE } from './scenic-route.di-token';
import { RolesGuard } from 'src/modules/auth/role.guard';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { ICreateScenicRouteDto, IUpdateScenicRouteDto } from 'src/modules/scenic-route/scenic-route.dto';

@ApiTags('scenic-routes')
@Controller('scenic-routes')
export class ScenicRouteController {
    constructor(
        @Inject(SCENIC_ROUTE_SERVICE)
        private readonly routeService: IScenicRouteService
    ) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth('authorization')
    @ApiOperation({ summary: 'Create a new route' })
    @ApiBody({
        type: 'CreateScenicRouteDto',
        description: 'ScenicScenicRoute creation payload',
        examples: {
            example1: {
                value: {
                    name: "Morning Shuttle",
                    description: "Morning shuttle service from district 1 to district 2",
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
                    scenicRouteCoordinates: [
                        { lat: 10.762622, lng: 106.660172 },
                        { lat: 10.776308, lng: 106.695274 }
                    ],
                    estimatedDuration: 30,
                    totalDistance: 8.5

                }
            }
        }
    })
    async createScenicRoute(
        @Body() createScenicRouteDto: ICreateScenicRouteDto) {
        return this.routeService.createScenicRoute(createScenicRouteDto);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth('authorization')
    @ApiOperation({ summary: 'Get all routes' })
    @ApiResponse({
        status: 200,
        description: 'Returns all routes'
    })
    async getAllScenicRoutes() {
        return this.routeService.getAllScenicRoutes();
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth('authorization')
    @ApiOperation({ summary: 'Get a route by id' })
    @ApiResponse({
        status: 200,
        description: 'Returns the route'
    })
    async getScenicRoute(@Param('id') id: string) {
        return this.routeService.getScenicRoute(id);
    }

    @Put(':id')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth('authorization')
    @ApiOperation({ summary: 'Update a route' })
    @ApiBody({
        type: 'UpdateScenicRouteDto',
        description: 'ScenicScenicRoute update payload',
        examples: {
            example1: {
                value: {
                    name: "Updated Morning Shuttle",
                    description: "Updated morning shuttle service route",
                    status: "active",
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
                    scenicRouteCoordinates: [
                        { lat: 10.762622, lng: 106.660172 },
                        { lat: 10.776308, lng: 106.695274 }
                    ],
                    estimatedDuration: 30,
                    totalDistance: 8.5
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'ScenicScenicRoute has been updated successfully'
    })
    async updateScenicRoute(
        @Param('id') id: string,
        @Body() updateScenicRouteDto: IUpdateScenicRouteDto
    ) {
        return this.routeService.updateScenicRoute(id, updateScenicRouteDto);
    }

}
