import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import dayjs from "dayjs";
import { BOOKING_REPOSITORY } from "src/modules/booking/booking.di-token";
import { IBookingHourBody, IBookingScenicRouteBody, IBookingDestinationBody } from "src/modules/booking/booking.dto";
import { IBookingRepository, IBookingService } from "src/modules/booking/booking.port";
import { BookingDocument } from "src/modules/booking/booking.schema";
import { CHECKOUT_SERVICE } from "src/modules/checkout/checkout.di-token";
import { ICheckoutService } from "src/modules/checkout/checkout.port";
import { SCENIC_ROUTE_REPOSITORY } from "src/modules/scenic-route/scenic-route.di-token";
import { IScenicRouteRepository } from "src/modules/scenic-route/scenic-route.port";
import { SEARCH_SERVICE } from "src/modules/search/search.di-token";
import { ISearchService } from "src/modules/search/search.port";
import { TRIP_REPOSITORY, TRIP_SERVICE } from "src/modules/trip/trip.di-token";
import { ITripRepository, ITripService } from "src/modules/trip/trip.port";
import { BOOKING_BUFFER_MINUTES, BookingStatus, DriverSchedulesStatus, ServiceType, Shift, ShiftHours, TripStatus } from "src/share/enums";

import { DateUtils, generateBookingCode } from "src/share/utils";

Injectable()
export class BookingService implements IBookingService {
    constructor(
        @Inject(BOOKING_REPOSITORY)
        private readonly bookingRepository: IBookingRepository,
        @Inject(SEARCH_SERVICE)
        private readonly searchService: ISearchService,
        @Inject(TRIP_SERVICE)
        private readonly tripService: ITripService,
        @Inject(TRIP_REPOSITORY)
        private readonly tripRepository: ITripRepository,
        @Inject(SCENIC_ROUTE_REPOSITORY)
        private readonly scenicRouteRepository: IScenicRouteRepository,
        @Inject(forwardRef(() => CHECKOUT_SERVICE))
        private readonly checkoutService: ICheckoutService
    ) { }

    async bookingHour(
        customerId: string,
        data: IBookingHourBody
    ): Promise<{ newBooking: BookingDocument, paymentUrl: string }> {
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
        // check bookingStartTime sau thời gian hiện tại

        const now = dayjs();
        const minAllowedTime = now.add(BOOKING_BUFFER_MINUTES, 'minute');

        if (bookingStartTime.isBefore(minAllowedTime)) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: `Booking time must be at least ${BOOKING_BUFFER_MINUTES} minutes from now`,
                vnMessage: `Thời gian đặt phải cách hiện tại ít nhất ${BOOKING_BUFFER_MINUTES} phút`
            }, HttpStatus.BAD_REQUEST);
        }

        //check if it is within the start and end of working time
        const [_, matchingShifts] = await Promise.all([
            this.searchService.validateBookingTime(bookingStartTime, bookingEndTime),
            this.searchService.getMatchingShifts(bookingStartTime, bookingEndTime)
        ]);

        //check available schedule in DB
        let schedules = await this.searchService.getAvailableSchedules(
            scheduleDate.toDate(),
            matchingShifts
        );

        if (scheduleDate.isSame(now, 'day')) {
            const currentHour = now.hour();
            console.log('currentHour', currentHour)
            schedules = schedules.filter(schedule => {
                const shift = schedule.shift as Shift;
                const shiftStartHour = ShiftHours[shift].start;

                // If current time is after shift start, only include IN_PROGRESS schedules
                // Otherwise, include all schedules for shifts that haven't started yet
                if (currentHour >= shiftStartHour) {
                    return schedule.status === DriverSchedulesStatus.IN_PROGRESS;
                }
                return true;
            });
        }

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
                    message: `Insufficient availability for category ${requestedCategory.name}`,
                    vnMesage: `Không đủ số lượng xe`
                }, HttpStatus.BAD_REQUEST);
            }
            if (availableCategory.availableCount < requestedCategory.quantity) {
                throw new HttpException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: `Not enough quantity for ${availableCategory.name}`,
                    vnMesage: `Không đủ số lượng xe`
                }, HttpStatus.BAD_REQUEST);
            }
        }
        const vehicleSelected = []
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
                            position: startPoint.position,
                            address: startPoint.address
                        }
                    }
                }
            }
            totalAmount = totalAmount + availableCategory.price
            const newTrip = await this.tripService.createTrip(TripDto)
            ListTrip.push(newTrip._id)
        }
        const bookingCode = generateBookingCode()
        const bookingDto = {
            bookingCode,
            customerId: customerId,
            trips: ListTrip,
            totalAmount: totalAmount,
            paymentMethod: paymentMethod
        }

        const newBooking = await this.bookingRepository.create(bookingDto)
        if (!newBooking) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'fail to create booking',
                vnMesage: 'Lỗi tạo booking',
            }, HttpStatus.BAD_REQUEST);
        }
        const paymentResult = await this.checkoutService.CheckoutBooking(newBooking._id.toString())
        return {
            newBooking,
            paymentUrl: paymentResult.checkoutUrl
        }
    }

    async bookingScenicRoute(
        customerId: string,
        data: IBookingScenicRouteBody
    ): Promise<{ newBooking: BookingDocument, paymentUrl: string }> {
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
                message: `Scenic Route not found`,
                vnMesage: `Không tìm thấy tuyến đường`
            }, HttpStatus.NOT_FOUND);
        }

        const durationMinutes = scenicRoute.estimatedDuration;//minute 
        const scheduleDate = DateUtils.parseDate(date);
        const bookingStartTime = DateUtils.parseDate(date, startTime);
        const bookingEndTime = bookingStartTime.add(durationMinutes, 'minute');

        const now = dayjs();
        const minAllowedTime = now.add(BOOKING_BUFFER_MINUTES, 'minute');
        if (bookingStartTime.isBefore(minAllowedTime)) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: `Booking time must be at least ${BOOKING_BUFFER_MINUTES} minutes from now`,
                vnMessage: `Thời gian đặt phải cách hiện tại ít nhất ${BOOKING_BUFFER_MINUTES} phút`
            }, HttpStatus.BAD_REQUEST);
        }

        // Validate booking time và lấy shifts
        const [_, matchingShifts] = await Promise.all([
            this.searchService.validateBookingTime(bookingStartTime, bookingEndTime),
            this.searchService.getMatchingShifts(bookingStartTime, bookingEndTime)
        ]);

        // Lấy schedules khả dụng
        let schedules = await this.searchService.getAvailableSchedules(
            scheduleDate.toDate(),
            matchingShifts
        );
        if (scheduleDate.isSame(now, 'day')) {
            console.log('now', now)
            // Lọc schedules chỉ trong ca hiện tại và status IN_PROGRESS
            schedules = schedules.filter(schedule =>
                matchingShifts.includes(schedule.shift as Shift) &&
                schedule.status === DriverSchedulesStatus.IN_PROGRESS
            );
        }

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
                    message: `Insufficient availability for category ${requestedCategory.name}`,
                    vnMesage: `Không đủ số lượng xe`
                }, HttpStatus.BAD_REQUEST);
            }
            if (availableCategory.availableCount < requestedCategory.quantity) {
                throw new HttpException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: `Not enough quantity for ${availableCategory.name}`,
                    vnMesage: `Không đủ số lượng xe`
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
                            position: startPoint.position,
                            address: startPoint.address
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
        const bookingCode = generateBookingCode()
        // Tạo booking
        const bookingDto = {
            bookingCode,
            customerId,
            trips: ListTrip,
            totalAmount,
            paymentMethod
        };

        const newBooking = await this.bookingRepository.create(bookingDto)
        if (!newBooking) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'fail to create booking',
                vnMesage: 'Lỗi tạo booking',
            }, HttpStatus.BAD_REQUEST);
        }
        const paymentResult = await this.checkoutService.CheckoutBooking(newBooking._id.toString())
        return {
            newBooking,
            paymentUrl: paymentResult.checkoutUrl
        }
    }

    async bookingDestination(
        customerId: string,
        data: IBookingDestinationBody
    ): Promise<{ newBooking: BookingDocument, paymentUrl: string }> {
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
                message: 'Invalid distance',
                vnMesage: 'Lỗi khoảng cách đoạn đường'
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
            matchingShifts,
            DriverSchedulesStatus.IN_PROGRESS
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
                message: `Insufficient vehicles for category ${vehicleCategories.name}`,
                vnMesage: `Không đủ số lượng xe`
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
                            position: startPoint.position,
                            address: startPoint.address
                        },
                        endPoint: {
                            position: startPoint.position,
                            address: startPoint.address
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
        const bookingCode = generateBookingCode()
        // Tạo booking
        const bookingDto = {
            bookingCode,
            customerId,
            trips: ListTrip,
            totalAmount,
            paymentMethod
        };

        const newBooking = await this.bookingRepository.create(bookingDto)
        if (!newBooking) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'fail to create booking',
                vnMesage: 'Lỗi tạo booking',
            }, HttpStatus.BAD_REQUEST);
        }
        const paymentResult = await this.checkoutService.CheckoutBooking(newBooking._id.toString())
        return {
            newBooking,
            paymentUrl: paymentResult.checkoutUrl
        }
    }

    async payBookingSuccess(bookingCode: number): Promise<BookingDocument> {
        const booking = await this.bookingRepository.findOneBooking(
            {
                bookingCode
            }, []
        )
        const listTripId = booking.trips
        for (const tripId of listTripId) {
            const tripUpdate = await this.tripRepository.updateStatus(
                tripId.toString(),
                TripStatus.PAYED
            )
            if (!tripUpdate) {
                throw new HttpException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: `Failed to update trip ${tripId}`,
                    vnMesage: `Lỗi cập nhật trip ${tripId}`,
                }, HttpStatus.BAD_REQUEST);
            }
        }
        const updateBooking = await this.bookingRepository.updateStatusBooking(
            booking._id.toString(),
            BookingStatus.CONFIRMED
        )
        if (!updateBooking) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: `Failed to update booking ${booking._id}`,
                vnMesage: `Lỗi cập nhật booking ${booking._id}`,
            }, HttpStatus.BAD_REQUEST);
        }
        return updateBooking
    }

    async payBookingFail(bookingCode: number): Promise<void> {
        const booking = await this.bookingRepository.findOneBooking(
            {
                bookingCode
            }, []
        )
        const listTripId = booking.trips
        for (const tripId of listTripId) {
            await this.tripRepository.deleteTrip(
                tripId.toString()
            )
        }
        await this.bookingRepository.deleteBooking(
            booking._id.toString()
        )
    }


    async getCustomerPersonalBooking(customerId: string): Promise<BookingDocument[]> {
        return await this.bookingRepository.getBookings({ customerId }, [])
    }
    async getCustomerPersonalBookingById(customerId: string, id: string): Promise<BookingDocument> {
        const booking = await this.bookingRepository.findOneBooking({
            _id: id,
            customerId
        }, [])
        if (!booking) {
            throw new HttpException({
                statusCode: HttpStatus.NOT_FOUND,
                message: `Not found booking ${id}`,
                vnMesage: `Không tìm thấy đặt xe ${id}`,
            }, HttpStatus.NOT_FOUND);
        }
        return booking
    }
}