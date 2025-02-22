"use client";

import { Calendar, momentLocalizer, View, Views } from "react-big-calendar";
import moment from "moment";
import { driverSchedule } from "@/libs/data";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState } from "react";
import { DriverScheduleEvent } from "@/interfaces";

const localizer = momentLocalizer(moment);


const BigCalendar = () => {
    const [view, setView] = useState<View>(Views.WORK_WEEK);
    const today = new Date();
    const handleOnChangeView = (selectedView: View) => {
        setView(selectedView);
    };

    const EventComponent = ({ event }: { event: DriverScheduleEvent }) => {
        return (
            <div>
                <div>{event.title}</div>
                <div>{event.vehicles}</div>
            </div>
        );
    }

    console.log('kkkk', driverSchedule);

    return (
        <Calendar
            localizer={localizer}
            events={driverSchedule}
            startAccessor="start"
            endAccessor="end"
            views={[Views.WORK_WEEK, Views.DAY]}
            view={view}
            style={{ height: "98%" }}
            onView={handleOnChangeView}
            min={new Date(today.getFullYear(), today.getMonth(), 1, 8, 0, 0)}
            max={new Date(today.getFullYear(), today.getMonth(), 1, 17, 0, 0)}
            defaultDate={new Date(2024, 7, 12)} // Set this to show August 2024
            components={{
                event: EventComponent
            }}
        />
    );
};

export default BigCalendar;