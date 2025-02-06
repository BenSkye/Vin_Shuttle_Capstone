import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Inject, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IRouteService } from './route.port';
import { CreateRouteDto, UpdateRouteDto } from './route.dto';
import { ROUTE_SERVICE } from './route.di-token';
import { RolesGuard } from 'src/modules/auth/role.guard';
import { AuthGuard } from 'src/modules/auth/auth.guard';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';

@ApiTags('routes')
@Controller('routes')
export class RouteController {
    constructor(
        @Inject(ROUTE_SERVICE)
        private readonly routeService: IRouteService
    ) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    // @UseGuards(AuthGuard, RolesGuard)
    // @Roles('admin')
    // @ApiBearerAuth('authorization')
    @ApiOperation({ summary: 'Create a new route' })
    @ApiBody({
        type: 'CreateRouteDto',
        description: 'Route creation payload',
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
                    routeCoordinates: [
                        { lat: 10.762622, lng: 106.660172 },
                        { lat: 10.776308, lng: 106.695274 }
                    ],
                    estimatedDuration: 30,
                    totalDistance: 8.5

                }
            }
        }
    })
    async createRoute(
        @Body() createRouteDto: CreateRouteDto) {
        return this.routeService.createRoute(createRouteDto);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get all routes' })
    @ApiResponse({
        status: 200,
        description: 'Returns all routes'
    })
    async getAllRoutes() {
        return this.routeService.getAllRoutes();
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Get a route by id' })
    @ApiResponse({
        status: 200,
        description: 'Returns the route'
    })
    async getRoute(@Param('id') id: string) {
        return this.routeService.getRoute(id);
    }

    @Put(':id')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(AuthGuard, RolesGuard)
    @Roles('admin')
    @ApiBearerAuth('authorization')
    @ApiOperation({ summary: 'Update a route' })
    @ApiBody({
        type: 'UpdateRouteDto',
        description: 'Route update payload',
        examples: {
            example1: {
                value: {
                    name: "Updated Morning Shuttle",
                    description: "Updated morning shuttle service route",
                    status: "active"
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Route has been updated successfully'
    })
    async updateRoute(
        @Param('id') id: string,
        @Body() updateRouteDto: UpdateRouteDto
    ) {
        return this.routeService.updateRoute(id, updateRouteDto);
    }

}
