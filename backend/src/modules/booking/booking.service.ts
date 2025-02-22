import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { BOOKING_REPOSITORY } from "src/modules/booking/booking.di-token";
import { IBookingHourBody } from "src/modules/booking/booking.dto";
import { IBookingRepository, IBookingService } from "src/modules/booking/booking.port";
import { BookingDocument } from "src/modules/booking/booking.schema";
import { SEARCH_SERVICE } from "src/modules/search/search.di-token";
import { ISearchService } from "src/modules/search/search.port";
import { TRIP_SERVICE } from "src/modules/trip/trip.di-token";
import { ITripService } from "src/modules/trip/trip.port";
import { ServiceType } from "src/share/enums";

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

        for (const requestedCategory of vehicleCategories) {
            let vehicleChooseByCategory = vehicles.filter(v => v.categoryId.toString() === requestedCategory.categoryVehicleId.toString())
            for (let i = 0; i < requestedCategory.quantity; i++) {
                console.log('vehicleChooseByCategory', vehicleChooseByCategory)
                const vehicleChoose = vehicleChooseByCategory[0]
                console.log('vehicleChoose', vehicleChoose)
                vehicleSelected.push(vehicleChoose)
                vehicleChooseByCategory = vehicleChooseByCategory.filter(
                    v => v._id.toString() !== vehicleChoose._id.toString()
                );
            }
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

}