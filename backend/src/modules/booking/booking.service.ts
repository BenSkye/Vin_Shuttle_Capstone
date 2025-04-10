import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import dayjs from "dayjs";
import { BOOKING_REPOSITORY } from "src/modules/booking/booking.di-token";
import { IBookingHourBody, IBookingScenicRouteBody, IBookingDestinationBody, bookingParams, IBookingSharedItineraryBody } from "src/modules/booking/booking.dto";
import { IBookingRepository, IBookingService } from "src/modules/booking/booking.port";
import { BookingDocument } from "src/modules/booking/booking.schema";
import { CHECKOUT_SERVICE } from "src/modules/checkout/checkout.di-token";
import { ICheckoutService } from "src/modules/checkout/checkout.port";
import { CONVERSATION_SERVICE } from "src/modules/conversation/conversation.di-token";
import { IConversationService } from "src/modules/conversation/conversation.port";
import { NOTIFICATION_SERVICE } from "src/modules/notification/notification.di-token";
import { INotificationService } from "src/modules/notification/notification.port";
import { PRICING_SERVICE } from "src/modules/pricing/pricing.di-token";
import { IPricingService } from "src/modules/pricing/pricing.port";
import { SCENIC_ROUTE_REPOSITORY } from "src/modules/scenic-route/scenic-route.di-token";
import { IScenicRouteRepository } from "src/modules/scenic-route/scenic-route.port";
import { SEARCH_SERVICE } from "src/modules/search/search.di-token";
import { ISearchService } from "src/modules/search/search.port";
import { SHARE_ITINERARY_GATEWAY, SHARE_ITINERARY_SERVICE } from "src/modules/shared-itinerary/shared-itinerary.di-token";
import { ICreateSharedItineraryDTO, searchSharedItineraryDTO } from "src/modules/shared-itinerary/shared-itinerary.dto";
import { SharedItineraryGateway } from "src/modules/shared-itinerary/shared-itinerary.gateway";
import { ISharedItineraryService } from "src/modules/shared-itinerary/shared-itinerary.port";
import { TRIP_GATEWAY, TRIP_REPOSITORY, TRIP_SERVICE } from "src/modules/trip/trip.di-token";
import { ICreateTripDto } from "src/modules/trip/trip.dto";
import { TripGateway } from "src/modules/trip/trip.gateway";
import { ITripRepository, ITripService } from "src/modules/trip/trip.port";
import { TripDocument } from "src/modules/trip/trip.schema";
import { VEHICLE_REPOSITORY } from "src/modules/vehicles/vehicles.di-token";
import { IVehiclesRepository } from "src/modules/vehicles/vehicles.port";
import { BOOKING_BUFFER_MINUTES, BookingStatus, DriverSchedulesStatus, ServiceType, serviceTypeText, Shift, ShiftHours, TripStatus } from "src/share/enums";
import { timeToCloseConversation, timeToOpenConversation } from "src/share/enums/conversation.enum";
import { PaymentMethod } from "src/share/enums/payment.enum";
import { SharedItineraryStatus, SharedItineraryStopsType } from "src/share/enums/shared-itinerary.enum";
import { QueryOptions } from "src/share/interface";

import { convertObjectId, DateUtils, generateBookingCode } from "src/share/utils";
import { processQueryParams } from "src/share/utils/query-params.util";

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
        private readonly checkoutService: ICheckoutService,
        @Inject(SHARE_ITINERARY_SERVICE)
        private readonly sharedItineraryService: ISharedItineraryService,
        @Inject(PRICING_SERVICE)
        private readonly pricingService: IPricingService,
        @Inject(VEHICLE_REPOSITORY)
        private readonly vehicleRepository: IVehiclesRepository,
        @Inject(NOTIFICATION_SERVICE)
        private readonly notificationService: INotificationService,
        @Inject(CONVERSATION_SERVICE)
        private readonly conversationService: IConversationService,
        @Inject(TRIP_GATEWAY)
        private readonly tripGateway: TripGateway,
        @Inject(SHARE_ITINERARY_GATEWAY)
        private readonly sharedItineraryGateway: SharedItineraryGateway
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
                    vnMessage: `Không đủ số lượng xe`
                }, HttpStatus.BAD_REQUEST);
            }
            if (availableCategory.availableCount < requestedCategory.quantity) {
                throw new HttpException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: `Not enough quantity for ${availableCategory.vehicleCategory.name}`,
                    vnMessage: `Không đủ số lượng xe`
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
                vehicleId: vehicle._id.toString(),
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
                vnMessage: 'Lỗi tạo booking',
            }, HttpStatus.BAD_REQUEST);
        }
        let paymentResult;
        if (paymentMethod === PaymentMethod.PAY_OS) {
            const result = await this.checkoutService.CheckoutBooking(newBooking._id.toString())
            paymentResult = result.checkoutUrl
        }
        if (paymentMethod === PaymentMethod.MOMO) {
            paymentResult = await this.checkoutService.CheckoutBookingMomo(newBooking._id.toString())
        }
        return {
            newBooking,
            paymentUrl: paymentResult
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
                vnMessage: `Không tìm thấy tuyến đường`
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
                    vnMessage: `Không đủ số lượng xe`
                }, HttpStatus.BAD_REQUEST);
            }
            if (availableCategory.availableCount < requestedCategory.quantity) {
                throw new HttpException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: `Not enough quantity for ${availableCategory.vehicleCategory.name}`,
                    vnMessage: `Không đủ số lượng xe`
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
                vehicleId: vehicle._id.toString(),
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
                vnMessage: 'Lỗi tạo booking',
            }, HttpStatus.BAD_REQUEST);
        }
        let paymentResult;
        if (paymentMethod === PaymentMethod.PAY_OS) {
            const result = await this.checkoutService.CheckoutBooking(newBooking._id.toString())
            paymentResult = result.checkoutUrl
        }
        if (paymentMethod === PaymentMethod.MOMO) {
            paymentResult = await this.checkoutService.CheckoutBookingMomo(newBooking._id.toString())
        }
        return {
            newBooking,
            paymentUrl: paymentResult
        }
    }

    async bookingDestination(
        customerId: string,
        data: IBookingDestinationBody
    ): Promise<{ newBooking: BookingDocument, paymentUrl?: string }> {
        const {
            startPoint,
            endPoint,
            durationEstimate,
            distanceEstimate,
            vehicleCategories,
            paymentMethod
        } = data;

        // Validate input
        if (distanceEstimate <= 0) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Invalid distance',
                vnMessage: 'Lỗi khoảng cách đoạn đường'
            }, HttpStatus.BAD_REQUEST);
        }

        const now = dayjs();
        const bookingStartTime = now.add(BOOKING_BUFFER_MINUTES, 'minute');
        const bookingEndTime = bookingStartTime.add(durationEstimate, 'minute');

        // Validate booking time và lấy shifts
        const [_, matchingShifts] = await Promise.all([
            this.searchService.validateBookingTime(bookingStartTime, bookingEndTime),
            this.searchService.getMatchingShifts(bookingStartTime, bookingEndTime)
        ]);

        // Lấy schedules khả dụng
        const midnightUTC = now.startOf('day');

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
                vnMessage: `Không đủ số lượng xe`
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
            let TripDto = {
                customerId,
                driverId: driverSchedule.driver._id.toString(),
                timeStartEstimate: bookingStartTime.toDate(),
                timeEndEstimate: bookingEndTime.toDate(),
                vehicleId: vehicle._id.toString(),
                scheduleId: driverSchedule._id.toString(),
                serviceType: ServiceType.BOOKING_DESTINATION,
                amount: vehicleCategory.price,
                isPrepaid: true,
                isPayed: true,
                servicePayload: {
                    bookingDestination: {
                        startPoint: {
                            position: startPoint.position,
                            address: startPoint.address
                        },
                        endPoint: {
                            position: endPoint.position,
                            address: endPoint.address
                        },
                        distanceEstimate,
                        distance: distanceEstimate
                    }
                }
            };
            if (paymentMethod === PaymentMethod.CASH) {
                TripDto = {
                    ...TripDto,
                    isPrepaid: false,
                    isPayed: false
                }
            }


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
                vnMessage: 'Lỗi tạo booking',
            }, HttpStatus.BAD_REQUEST);
        }
        if (paymentMethod === PaymentMethod.CASH) {
            // xác nhận booking và trips
            const updatedBooking = await this.payBookingSuccess(newBooking.bookingCode)
            return {
                newBooking: updatedBooking,
                paymentUrl: null
            }
        }
        let paymentResult;
        if (paymentMethod === PaymentMethod.PAY_OS) {
            const result = await this.checkoutService.CheckoutBooking(newBooking._id.toString())
            paymentResult = result.checkoutUrl
        }
        if (paymentMethod === PaymentMethod.MOMO) {
            paymentResult = await this.checkoutService.CheckoutBookingMomo(newBooking._id.toString())
        }
        return {
            newBooking,
            paymentUrl: paymentResult
        }
    }

    async bookingSharedItinerary(
        customerId: string,
        data: IBookingSharedItineraryBody,
    ): Promise<{ newBooking: BookingDocument; paymentUrl: string }> {
        const {
            startPoint,
            endPoint,
            durationEstimate,
            distanceEstimate,
            numberOfSeat,
            paymentMethod
        } = data;

        //chặn 1 người đặt 2 chuyến xe cùng lúc
        const trip = await this.tripRepository.findOne({
            customerId: customerId,
            status: {
                $nin: [TripStatus.COMPLETED, TripStatus.CANCELLED, TripStatus.DROPPED_OFF]
            },
            serviceType: ServiceType.BOOKING_SHARE
        }, [])
        if (trip) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'You have a trip in progress',
                vnMessage: 'Bạn đang có cuốc xe khác đang diễn ra'
            }, HttpStatus.BAD_REQUEST
            )
        }

        const searchSharedItineraryDto: searchSharedItineraryDTO = {
            startPoint: startPoint,
            endPoint: endPoint,
            distanceEstimate: distanceEstimate,
            numberOfSeats: numberOfSeat
        }
        // Lấy thông tin shared route phù hợp nhất để ghép với trip
        const sharedItineraryFinded = await this.sharedItineraryService.findBestItineraryForNewTrip(searchSharedItineraryDto);
        const ListTrip = [];
        let totalAmount = 0;
        let TripDto: ICreateTripDto = null
        let newTrip: TripDocument = null
        if (sharedItineraryFinded) {
            const now = dayjs();
            console.log('durationToNewTripStart', sharedItineraryFinded.durationToNewTripStart)
            console.log('durationToNewTripEnd', sharedItineraryFinded.durationToNewTripEnd)
            const bookingStartTime = now.add(BOOKING_BUFFER_MINUTES + (sharedItineraryFinded.durationToNewTripStart) / 60, 'minute');
            const bookingEndTime = now.add(BOOKING_BUFFER_MINUTES + (sharedItineraryFinded.durationToNewTripEnd / 60), 'minute');
            console.log('distanceToNewTripEnd', sharedItineraryFinded.distanceToNewTripEnd)
            console.log('distanceToNewTripStart', sharedItineraryFinded.distanceToNewTripStart)
            const vehicle = await this.vehicleRepository.getById(sharedItineraryFinded.SharedItineraryDocument.vehicleId.toString())
            const newTripPrice = await this.pricingService.calculatePrice(
                ServiceType.BOOKING_SHARE,
                vehicle.categoryId.toString(),
                distanceEstimate
            )
            console.log('newTripPrice', newTripPrice)

            TripDto = {
                customerId,
                driverId: sharedItineraryFinded.SharedItineraryDocument.driverId.toString(),
                timeStartEstimate: bookingStartTime.toDate(),
                timeEndEstimate: bookingEndTime.toDate(),
                vehicleId: sharedItineraryFinded.SharedItineraryDocument.vehicleId.toString(),
                scheduleId: sharedItineraryFinded.SharedItineraryDocument.scheduleId.toString(),
                serviceType: ServiceType.BOOKING_SHARE,
                amount: newTripPrice,
                servicePayload: {
                    bookingShare: {
                        sharedItinerary: sharedItineraryFinded.SharedItineraryDocument._id.toString(),
                        numberOfSeat: numberOfSeat,
                        startPoint: startPoint,
                        endPoint: endPoint,
                        distanceEstimate: distanceEstimate,
                        distance: distanceEstimate,
                        // isSharedItineraryMain: false
                    }
                }
            };
            newTrip = await this.tripService.createTrip(TripDto);

        } else {
            //create new trip
            if (distanceEstimate <= 0) {
                throw new HttpException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: 'Invalid distance',
                    vnMessage: 'Lỗi khoảng cách đoạn đường'
                }, HttpStatus.BAD_REQUEST);
            }

            const now = dayjs();
            const bookingStartTime = now.add(BOOKING_BUFFER_MINUTES, 'minute');
            const bookingEndTime = bookingStartTime.add(durationEstimate, 'minute');

            // Validate booking time và lấy shifts
            const [_, matchingShifts] = await Promise.all([
                this.searchService.validateBookingTime(bookingStartTime, bookingEndTime),
                this.searchService.getMatchingShifts(bookingStartTime, bookingEndTime)
            ]);

            // Lấy schedules khả dụng
            const midnightUTC = now.startOf('day');

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
                ServiceType.BOOKING_SHARE,
                distanceEstimate
            );

            // Validate vehicle categories
            const availableCategory = availableVehicles.find(
                v => v.vehicleCategory.numberOfSeat >= numberOfSeat
            );

            if (!availableCategory || availableCategory.availableCount < 1) {
                throw new HttpException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: `Insufficient vehicles have ${numberOfSeat} seats`,
                    vnMessage: `Không còn xe đủ số lượng chỗ ngồi`
                }, HttpStatus.BAD_REQUEST);
            }

            // Chọn vehicles
            vehicles.filter(
                v => v.categoryId.toString() === availableCategory.vehicleCategory._id.toString()
            );
            const vehicle = vehicles[0]

            // Tạo trips

            const driverSchedule = validSchedules.find(
                s => s.vehicle._id.toString() === vehicle._id.toString()
            );

            const vehicleCategory = availableVehicles.find(
                v => v.vehicleCategory._id.toString() === vehicle.categoryId.toString()
            );

            TripDto = {
                customerId,
                driverId: driverSchedule.driver._id.toString(),
                timeStartEstimate: bookingStartTime.toDate(),
                timeEndEstimate: bookingEndTime.toDate(),
                vehicleId: vehicle._id.toString(),
                scheduleId: driverSchedule._id.toString(),
                serviceType: ServiceType.BOOKING_SHARE,
                amount: vehicleCategory.price,
                servicePayload: {
                    bookingShare: {
                        sharedItinerary: null,
                        numberOfSeat: numberOfSeat,
                        startPoint: startPoint,
                        endPoint: endPoint,
                        distanceEstimate: distanceEstimate,
                        distance: distanceEstimate,
                        // isSharedItineraryMain: true
                    }
                }
            };


            const createSharedItineraryDto: ICreateSharedItineraryDTO = {
                driverId: TripDto.driverId.toString(),
                vehicleId: TripDto.vehicleId.toString(),
                scheduleId: TripDto.scheduleId.toString(),
                // distanceEstimate: distanceEstimate,
                // durationEstimate: durationEstimate,
            }


            const newSharedItinerary = await this.sharedItineraryService.createSharedItinerary(createSharedItineraryDto)

            TripDto = {
                ...TripDto,
                servicePayload: {
                    bookingShare: {
                        sharedItinerary: newSharedItinerary._id.toString(),
                        numberOfSeat: numberOfSeat,
                        startPoint: startPoint,
                        endPoint: endPoint,
                        distanceEstimate: distanceEstimate,
                        distance: distanceEstimate,
                        // isSharedItineraryMain: true
                    }
                }
            }
            console.log('TripDto', TripDto)


            newTrip = await this.tripService.createTrip(TripDto);


            //create new shared route

            const sharedItineraryStop = [{
                order: 1,
                pointType: SharedItineraryStopsType.START_POINT,
                trip: newTrip._id.toString(),
                tripCode: newTrip.code,
                point: newTrip.servicePayload.bookingShare.startPoint,
                isPass: false,
                isCancel: false
            }, {
                order: 2,
                pointType: SharedItineraryStopsType.END_POINT,
                trip: newTrip._id.toString(),
                tripCode: newTrip.code,
                point: newTrip.servicePayload.bookingShare.endPoint,
                isPass: false,
                isCancel: false
            }]

            const updateSharedItineraryDto: ICreateSharedItineraryDTO = {
                ...createSharedItineraryDto,
                stops: sharedItineraryStop
            }
            await this.sharedItineraryService.updateSharedItinerary(newSharedItinerary._id.toString(), updateSharedItineraryDto)
        }

        ListTrip.push(newTrip._id);
        console.log('newTrip', newTrip)
        totalAmount += newTrip.amount;
        const bookingCode = generateBookingCode()

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
                vnMessage: 'Lỗi tạo booking',
            }, HttpStatus.BAD_REQUEST);
        }
        console.log('newBooking', newBooking)
        let paymentResult;
        if (paymentMethod === PaymentMethod.PAY_OS) {
            const result = await this.checkoutService.CheckoutBooking(newBooking._id.toString())
            paymentResult = result.checkoutUrl
        }
        if (paymentMethod === PaymentMethod.MOMO) {
            paymentResult = await this.checkoutService.CheckoutBookingMomo(newBooking._id.toString())
        }
        return {
            newBooking,
            paymentUrl: paymentResult
        }
    }

    async payBookingSuccess(bookingCode: number): Promise<BookingDocument> {
        const booking = await this.bookingRepository.findOneBooking(
            {
                bookingCode
            }, []
        )
        const listTripId = booking.trips
        console.log('listTripId', listTripId)
        for (const tripId of listTripId) {
            const tripUpdate = await this.tripRepository.updateStatus(
                tripId.toString(),
                TripStatus.CONFIRMED
            )
            if (!tripUpdate) {
                throw new HttpException({
                    statusCode: HttpStatus.BAD_REQUEST,
                    message: `Failed to update trip ${tripId}`,
                    vnMessage: `Lỗi cập nhật trip ${tripId}`,
                }, HttpStatus.BAD_REQUEST);
            }
            if (tripUpdate.serviceType === ServiceType.BOOKING_SHARE) {
                const sharedItinerary = await this.sharedItineraryService.getSharedItineraryById(
                    tripUpdate.servicePayload.bookingShare.sharedItinerary.toString()
                )
                console.log('sharedItinerary865', sharedItinerary)
                if (sharedItinerary.status === SharedItineraryStatus.PENDING) {
                    const updatedSharedItinerary = await this.sharedItineraryService.updateStatusSharedItinerary(
                        tripUpdate.servicePayload.bookingShare.sharedItinerary.toString(),
                        SharedItineraryStatus.PLANNED
                    )
                    console.log('updatedSharedItinerary871', updatedSharedItinerary)
                } else if (sharedItinerary.status === SharedItineraryStatus.PLANNED) {
                    const updatedSharedItinerary = await this.sharedItineraryService.saveASharedItineraryFromRedisToDBByTripID(tripId.toString())
                    const message = "Cuốc xe mới được ghép"
                    await this.sharedItineraryGateway.emitUpdatedSharedItineraryDetail(
                        tripUpdate.driverId.toString(),
                        updatedSharedItinerary._id.toString(),
                        updatedSharedItinerary,
                        message
                    )
                }
            }
            const notificationForCustomer = {
                received: tripUpdate.customerId.toString(),
                title: `Cuốc xe ${tripUpdate.code} đã được xác nhận`,
                body: `Cuốc xe ${serviceTypeText[tripUpdate.serviceType]} lúc ${DateUtils.formatDateTime(tripUpdate.timeStartEstimate)} của bạn đã được xác nhận thành công`,
            }
            const notificationForDriver = {
                received: tripUpdate.driverId.toString(),
                title: `Cuốc xe ${serviceTypeText[tripUpdate.serviceType]} mới ${tripUpdate.code}`,
                body: `Bạn có cuốc xe ${serviceTypeText[tripUpdate.serviceType]} mới lúc ${DateUtils.formatDateTime(tripUpdate.timeStartEstimate)}`,
            }
            await this.notificationService.createNotification(notificationForCustomer)
            await this.notificationService.createNotification(notificationForDriver)
            await this.conversationService.createConversation({
                tripId: tripUpdate._id.toString(),
                tripCode: tripUpdate.code,
                customerId: tripUpdate.customerId.toString(),
                driverId: tripUpdate.driverId.toString(),
                timeToOpen: new Date(tripUpdate.timeStartEstimate.getTime() + timeToOpenConversation), // 30 minutes before trip start
                timeToClose: new Date(tripUpdate.timeEndEstimate.getTime() + timeToCloseConversation) //30 minutes after trip end
            })
            const listDriverTrip = await this.tripService.getPersonalDriverTrip(tripUpdate.driverId.toString())
            this.tripGateway.emitTripUpdate(
                tripUpdate.driverId.toString(),
                listDriverTrip
            );
        }
        const updateBooking = await this.bookingRepository.updateStatusBooking(
            booking._id.toString(),
            BookingStatus.CONFIRMED
        )
        if (!updateBooking) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: `Failed to update booking ${booking._id}`,
                vnMessage: `Lỗi cập nhật booking ${booking._id}`,
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

    async cancelBooking(userId: string, bookingId: string): Promise<boolean> {
        const booking = await this.bookingRepository.findOneBooking(
            {
                customerId: userId,
                _id: convertObjectId(bookingId)
            }, ["bookingCode", "status"]
        )
        if (!booking) {
            throw new HttpException({
                statusCode: HttpStatus.NOT_FOUND,
                message: `Not found booking ${bookingId}`,
                vnMessage: `Không tìm thấy đơn đăt ${bookingId}`,
            }, HttpStatus.NOT_FOUND);
        }
        if (booking.status !== BookingStatus.PENDING) {
            throw new HttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: `Booking ${bookingId} is not cancellable`,
                vnMessage: `Đơn đặt ${bookingId} không thể hủy`,
            }, HttpStatus.BAD_REQUEST);
        }
        await this.payBookingFail(booking.bookingCode)
        return true
    }


    async getCustomerPersonalBooking(customerId: string, query: QueryOptions): Promise<BookingDocument[]> {
        const { options } = processQueryParams(query, []);
        return await this.bookingRepository.getBookings({ customerId }, [], options)
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
                vnMessage: `Không tìm thấy đặt xe ${id}`,
            }, HttpStatus.NOT_FOUND);
        }
        return booking
    }


    async getListBookingByQuery(query: bookingParams): Promise<BookingDocument[]> {
        const { filter, options } = processQueryParams(query, []);
        const result = await this.bookingRepository.getBookings(filter, [], options)
        return result;
    }

    async getBookingById(id: string): Promise<BookingDocument> {
        const booking = await this.bookingRepository.getBookingById(id)
        if (!booking) {
            throw new HttpException({
                statusCode: HttpStatus.NOT_FOUND,
                message: `Not found booking ${id}`,
                vnMessage: `Không tìm thấy đặt xe ${id}`,
            }, HttpStatus.NOT_FOUND);
        }
        return booking
    }

    async totalTransaction(): Promise<number> {
        const confirmedBookings = await this.bookingRepository.getBookings(
            { status: BookingStatus.CONFIRMED },
            ['_id']
        );
        return confirmedBookings.length
    }
}