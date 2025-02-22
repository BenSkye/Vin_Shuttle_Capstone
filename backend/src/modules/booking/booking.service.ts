import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import dayjs from "dayjs";
import { BOOKING_REPOSITORY } from "src/modules/booking/booking.di-token";
import { IBookingHourBody, IBookingScenicRouteBody, IBookingDestinationBody } from "src/modules/booking/booking.dto";
import { IBookingRepository, IBookingService } from "src/modules/booking/booking.port";
import { BookingDocument } from "src/modules/booking/booking.schema";
import { SCENIC_ROUTE_REPOSITORY } from "src/modules/scenic-route/scenic-route.di-token";
import { IScenicRouteRepository } from "src/modules/scenic-route/scenic-route.port";
import { SEARCH_SERVICE } from "src/modules/search/search.di-token";
import { ISearchService } from "src/modules/search/search.port";
import { TRIP_SERVICE } from "src/modules/trip/trip.di-token";
import { ITripService } from "src/modules/trip/trip.port";
import { BOOKING_BUFFER_MINUTES, ServiceType } from "src/share/enums";

import { DateUtils } from "src/share/utils";

Injectable()
export class BookingService implements IBookingService {
    constructor(
        @Inject(BOOKING_REPOSITORY)
        private readonly bookingRepository: IBookingRepository,
        @Inject(SEARCH_SERVICE)
        private readonly searchService: ISearchService,
        @Inject(TRIP_SERVICE)
        private readonly tripService: ITripService,
        @Inject(SCENIC_ROUTE_REPOSITORY)
        private readonly scenicRouteRepository: IScenicRouteRepository
    ) { }

    async bookingHour(
        customerId: string,
        data: IBookingHourBody
    ): Promise<BookingDocument> {
        const {
            startPoint,
            date,
            startTime,
            durationMinutes,
            vehicleCategories,
            paymentMethod
        } = data

        const scheduleDate = DateUtils.parseDate(date);
        const bookingStartTime = DateUtils.parseDate(date, startTime);
        const bookingEndTime = bookingStartTime.add(durationMinutes, 'minute');


        //check if it is within the start and end of working time
        const [_, matchingShifts] = await Promise.all([
            this.searchService.validateBookingTime(bookingStartTime, bookingEndTime),
            this.searchService.getMatchingShifts(bookingStartTime, bookingEndTime)
        ]);

        //check available schedule in DB
        const schedules = await this.searchService.getAvailableSchedules(
            scheduleDate.toDate(),
            matchingShifts
        );

        //check not conflict time with Trip in that uniqueSchedules 
        const validSchedules = await this.searchService.filterSchedulesWithoutConflicts(
            schedules,
            bookingStartTime,
            bookingEndTime
        );


        const vehicles = await this.searchService.getVehiclesFromSchedules(validSchedules);
        const availableVehicles = await this.searchService.groupByVehicleType(vehicles, ServiceType.BOOKING_HOUR, durationMinutes)
        console.log('availableVehicles', availableVehicles)
        console.log('vehicleCategories', vehicleCategories)
        for (const requestedCategory of vehicleCategories) {
            const availableCategory = availableVehicles.find(
                (vehicle) => vehicle.vehicleCategory._id.toString() === requestedCategory.categoryVehicleId
            );

            if (!availableCategory) {
                throw new HttpException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: `Insufficient availability for category ${requestedCategory.categoryVehicleId}`
                }, HttpStatus.BAD_REQUEST);
            }
            if (availableCategory.availableCount < requestedCategory.quantity) {
                throw new HttpException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: `Not enough quantity for ${availableCategory.name}`
                }, HttpStatus.BAD_REQUEST);
            }
        }

        const vehicleSelected = []

        // for (const requestedCategory of vehicleCategories) {
        //     let vehicleChooseByCategory = vehicles.filter(v => v.categoryId.toString() === requestedCategory.categoryVehicleId.toString())
        //     for (let i = 0; i < requestedCategory.quantity; i++) {
        //         console.log('vehicleChooseByCategory', vehicleChooseByCategory)
        //         const vehicleChoose = vehicleChooseByCategory[0]
        //         console.log('vehicleChoose', vehicleChoose)
        //         vehicleSelected.push(vehicleChoose)
        //         vehicleChooseByCategory = vehicleChooseByCategory.filter(
        //             v => v._id.toString() !== vehicleChoose._id.toString()
        //         );
        //     }
        // }
        for (const requestedCategory of vehicleCategories) {
            const categoryVehicles = vehicles.filter(
                v => v.categoryId.toString() === requestedCategory.categoryVehicleId
            );

            vehicleSelected.push(...categoryVehicles.slice(0, requestedCategory.quantity));
        }

        const ListTrip = []
        let totalAmount = 0
        console.log('vehicleCategories', vehicleCategories)
        console.log('vehicleSelected', vehicleSelected)
        console.log('vehicles', vehicles)
        for (const vehicle of vehicleSelected) {
            const driverSchedule = await validSchedules.filter(s => s.vehicle._id.toString() === vehicle._id.toString())
            const availableCategory = availableVehicles.find(
                (v) => v.vehicleCategory._id.toString() === vehicle.categoryId.toString()
            );
            const TripDto = {
                customerId: customerId,
                driverId: driverSchedule[0].driver._id.toString(),
                timeStartEstimate: bookingStartTime.toDate(),
                timeEndEstimate: bookingEndTime.toDate(),
                vehicleId: vehicle._id,
                scheduleId: driverSchedule[0]._id.toString(),
                serviceType: ServiceType.BOOKING_HOUR,
                amount: Number(availableCategory.price),
                servicePayload: {
                    bookingHour: {
                        totalTime: durationMinutes,
                        startPoint: {
                            lat: startPoint.lat,
                            lng: startPoint.lng
                        }
                    }
                }
            }
            totalAmount = totalAmount + availableCategory.price
            const newTrip = await this.tripService.createTrip(TripDto)
            ListTrip.push(newTrip._id)
        }

        const bookingDto = {
            customerId: customerId,
            trips: ListTrip,
            totalAmount: totalAmount,
            paymentMethod: paymentMethod
        }

        const newBooking = await this.bookingRepository.create(bookingDto)
        return newBooking
    }

    async bookingScenicRoute(
        customerId: string,
        data: IBookingScenicRouteBody
    ): Promise<BookingDocument> {
        const {
            startPoint,
            scenicRouteId,
            date,
            startTime,
            vehicleCategories,
            paymentMethod
        } = data;

        // Lấy thông tin scenic route
        const scenicRoute = await this.scenicRouteRepository.findById(scenicRouteId);
        if (!scenicRoute) {
            throw new HttpException({
                statusCode: HttpStatus.NOT_FOUND,
                message: `Scenic Route not found`
            }, HttpStatus.NOT_FOUND);
        }

        const durationMinutes = scenicRoute.estimatedDuration;//minute 
        const scheduleDate = DateUtils.parseDate(date);
        const bookingStartTime = DateUtils.parseDate(date, startTime);
        const bookingEndTime = bookingStartTime.add(durationMinutes, 'minute');

        // Validate booking time và lấy shifts
        const [_, matchingShifts] = await Promise.all([
            this.searchService.validateBookingTime(bookingStartTime, bookingEndTime),
            this.searchService.getMatchingShifts(bookingStartTime, bookingEndTime)
        ]);

        // Lấy schedules khả dụng
        const schedules = await this.searchService.getAvailableSchedules(
            scheduleDate.toDate(),
            matchingShifts
        );

        // Lọc schedules không xung đột
        const validSchedules = await this.searchService.filterSchedulesWithoutConflicts(
            schedules,
            bookingStartTime,
            bookingEndTime
        );

        // Lấy vehicles từ schedules
        const vehicles = await this.searchService.getVehiclesFromSchedules(validSchedules);

        // Kiểm tra số lượng vehicle theo category
        const availableVehicles = await this.searchService.groupByVehicleType(
            vehicles,
            ServiceType.BOOKING_SCENIC_ROUTE,
            scenicRoute.totalDistance
        );

        // Validate vehicle categories
        for (const requestedCategory of vehicleCategories) {
            const availableCategory = availableVehicles.find(
                v => v.vehicleCategory._id.toString() === requestedCategory.categoryVehicleId
            );

            if (!availableCategory) {
                throw new HttpException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: `Insufficient availability for category ${requestedCategory.categoryVehicleId}`
                }, HttpStatus.BAD_REQUEST);
            }
            if (availableCategory.availableCount < requestedCategory.quantity) {
                throw new HttpException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: `Not enough quantity for ${availableCategory.name}`
                }, HttpStatus.BAD_REQUEST);
            }
        }

        // Chọn vehicles và tạo trips
        const vehicleSelected = [];
        for (const requestedCategory of vehicleCategories) {
            const categoryVehicles = vehicles.filter(
                v => v.categoryId.toString() === requestedCategory.categoryVehicleId
            );

            vehicleSelected.push(...categoryVehicles.slice(0, requestedCategory.quantity));
        }

        // Tạo trips
        const ListTrip = [];
        let totalAmount = 0;

        for (const vehicle of vehicleSelected) {
            const driverSchedule = validSchedules.find(
                s => s.vehicle._id.toString() === vehicle._id.toString()
            );

            const vehicleCategory = availableVehicles.find(
                v => v.vehicleCategory._id.toString() === vehicle.categoryId.toString()
            );

            const TripDto = {
                customerId,
                driverId: driverSchedule.driver._id.toString(),
                timeStartEstimate: bookingStartTime.toDate(),
                timeEndEstimate: bookingEndTime.toDate(),
                vehicleId: vehicle._id,
                scheduleId: driverSchedule._id.toString(),
                serviceType: ServiceType.BOOKING_SCENIC_ROUTE,
                amount: vehicleCategory.price,
                servicePayload: {
                    bookingScenicRoute: {
                        routeId: scenicRouteId,
                        startPoint: {
                            lat: startPoint.lat,
                            lng: startPoint.lng
                        },
                        distanceEstimate: scenicRoute.totalDistance,
                        distance: scenicRoute.totalDistance
                    }
                }
            };

            const newTrip = await this.tripService.createTrip(TripDto);
            ListTrip.push(newTrip._id);
            totalAmount += vehicleCategory.price;
        }

        // Tạo booking
        const bookingDto = {
            customerId,
            trips: ListTrip,
            totalAmount,
            paymentMethod
        };

        return this.bookingRepository.create(bookingDto);
    }

    async bookingDestination(
        customerId: string,
        data: IBookingDestinationBody
    ): Promise<BookingDocument> {
        const {
            startPoint,
            endPoint,
            estimatedDuration,
            distanceEstimate,
            vehicleCategories,
            paymentMethod
        } = data;

        // Validate input
        if (distanceEstimate <= 0) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Invalid distance'
            }, HttpStatus.BAD_REQUEST);
        }

        const now = dayjs();
        const bookingStartTime = now.add(BOOKING_BUFFER_MINUTES, 'minute');
        const bookingEndTime = bookingStartTime.add(estimatedDuration, 'minute');

        // Validate booking time và lấy shifts
        const [_, matchingShifts] = await Promise.all([
            this.searchService.validateBookingTime(bookingStartTime, bookingEndTime),
            this.searchService.getMatchingShifts(bookingStartTime, bookingEndTime)
        ]);

        // Lấy schedules khả dụng
        const midnightUTC = now.utc().startOf('day');

        const schedules = await this.searchService.getAvailableSchedules(
            midnightUTC.toDate(),
            matchingShifts
        );

        // Lọc schedules không xung đột
        const validSchedules = await this.searchService.filterSchedulesWithoutConflicts(
            schedules,
            bookingStartTime,
            bookingEndTime
        );

        // Lấy vehicles từ schedules
        const vehicles = await this.searchService.getVehiclesFromSchedules(validSchedules);

        // Kiểm tra số lượng vehicle theo category (mặc định quantity = 1)
        const availableVehicles = await this.searchService.groupByVehicleType(
            vehicles,
            ServiceType.BOOKING_DESTINATION,
            distanceEstimate
        );

        // Validate vehicle categories
        const availableCategory = availableVehicles.find(
            v => v.vehicleCategory._id.toString() === vehicleCategories.categoryVehicleId
        );

        if (!availableCategory || availableCategory.availableCount < 1) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: `Insufficient vehicles for category ${vehicleCategories.categoryVehicleId}`
            }, HttpStatus.BAD_REQUEST);
        }

        // Chọn vehicles
        const vehicleSelected = [];
        const categoryVehicles = vehicles.filter(
            v => v.categoryId.toString() === vehicleCategories.categoryVehicleId
        );
        vehicleSelected.push(...categoryVehicles.slice(0, 1));

        // Tạo trips
        const ListTrip = [];
        let totalAmount = 0;

        for (const vehicle of vehicleSelected) {
            const driverSchedule = validSchedules.find(
                s => s.vehicle._id.toString() === vehicle._id.toString()
            );

            const vehicleCategory = availableVehicles.find(
                v => v.vehicleCategory._id.toString() === vehicle.categoryId.toString()
            );

            const TripDto = {
                customerId,
                driverId: driverSchedule.driver._id.toString(),
                timeStartEstimate: bookingStartTime.toDate(),
                timeEndEstimate: bookingEndTime.toDate(),
                vehicleId: vehicle._id,
                scheduleId: driverSchedule._id.toString(),
                serviceType: ServiceType.BOOKING_DESTINATION,
                amount: vehicleCategory.price,
                servicePayload: {
                    bookingDestination: {
                        startPoint: {
                            lat: startPoint.lat,
                            lng: startPoint.lng
                        },
                        endPoint: {
                            lat: endPoint.lat,
                            lng: endPoint.lng
                        },
                        distanceEstimate,
                        distance: distanceEstimate
                    }
                }
            };

            const newTrip = await this.tripService.createTrip(TripDto);
            ListTrip.push(newTrip._id);
            totalAmount += vehicleCategory.price;
        }

        // Tạo booking
        const bookingDto = {
            customerId,
            trips: ListTrip,
            totalAmount,
            paymentMethod
        };

        return this.bookingRepository.create(bookingDto);
    }

}