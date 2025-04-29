'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getAllRating } from '@/services/api/rating';

interface BookingData {
    name: string;
    booking_hour: number;
    booking_scenic_route: number;
    booking_share: number;
    booking_destination: number;
}

interface Rating {
    createdAt: string;
    id: string;
    serviceType: 'booking_hour' | 'booking_scenic_route' | 'booking_share' | 'booking_destination';
    // Add other fields as needed
}

const initialData = [
    {
        name: 'Mon',
        booking_hour: 0,
        booking_scenic_route: 0,
        booking_share: 0,
        booking_destination: 0,
    },
    {
        name: 'Tue',
        booking_hour: 0,
        booking_scenic_route: 0,
        booking_share: 0,
        booking_destination: 0,
    },
    {
        name: 'Wed',
        booking_hour: 0,
        booking_scenic_route: 0,
        booking_share: 0,
        booking_destination: 0,
    },
    {
        name: 'Thu',
        booking_hour: 0,
        booking_scenic_route: 0,
        booking_share: 0,
        booking_destination: 0,
    },
    {
        name: 'Fri',
        booking_hour: 0,
        booking_scenic_route: 0,
        booking_share: 0,
        booking_destination: 0,
    },
    {
        name: 'Sat',
        booking_hour: 0,
        booking_scenic_route: 0,
        booking_share: 0,
        booking_destination: 0,
    },
    {
        name: 'Sun',
        booking_hour: 0,
        booking_scenic_route: 0,
        booking_share: 0,
        booking_destination: 0,
    },
];

const AttendanceChart = () => {
    const [data, setData] = useState<BookingData[]>(initialData);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        fetchBookingData();
    }, []);

    const fetchBookingData = async () => {
        try {
            setLoading(true);

            // Fetch data for each service type
            const hourlyData = await getAllRating({ serviceType: 'booking_hour' });
            const scenicRouteData = await getAllRating({ serviceType: 'booking_scenic_route' });
            const shareData = await getAllRating({ serviceType: 'booking_share' });
            const destinationData = await getAllRating({ serviceType: 'booking_destination' });

            // Process data by day of week
            const newData = [...initialData];

            // Helper function to process each rating by day
            const processRatingsByDay = (ratings: Rating[], serviceType: keyof Omit<BookingData, 'name'>) => {
                ratings.forEach(rating => {
                    const date = new Date(rating.createdAt);
                    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
                    const dayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to array index (Mon=0, Sun=6)

                    // Increment the count for this service type on this day
                    newData[dayIndex][serviceType] += 1;
                });
            };

            processRatingsByDay(hourlyData, 'booking_hour');
            processRatingsByDay(scenicRouteData, 'booking_scenic_route');
            processRatingsByDay(shareData, 'booking_share');
            processRatingsByDay(destinationData, 'booking_destination');

            setData(newData);
        } catch (error) {
            console.error('Error fetching booking data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='bg-white rounded-lg p-4 h-full'>
            <div className='flex justify-between items-center mb-2'>
                <h1 className='text-lg font-semibold'>Số lượng đặt xe theo loại dịch vụ</h1>
                <Image src='/icons/ellipsis.svg' alt="" width={20} height={20} />
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">Đang tải dữ liệu...</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                        data={data}
                        barSize={15}
                        margin={{ top: 5, right: 5, bottom: 5, left: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke='#ddd' />
                        <XAxis dataKey="name" axisLine={false} tick={{ fill: "#d1d5db" }} tickLine={false} />
                        <YAxis axisLine={false} />
                        <Tooltip contentStyle={{ borderRadius: "10px", borderColor: "lightgray" }} />
                        <Legend align='left' verticalAlign='top' wrapperStyle={{ paddingTop: "10px", paddingBottom: '20px' }} />
                        <Bar dataKey="booking_hour" fill="#FAE27C" legendType='circle' radius={[5, 5, 0, 0]} name='Đặt theo giờ' />
                        <Bar dataKey="booking_scenic_route" fill="#C3EBFA" legendType='circle' radius={[5, 5, 0, 0]} name='Đặt theo lộ trình ngắm cảnh' />
                        <Bar dataKey="booking_share" fill="#A5D6A7" legendType='circle' radius={[5, 5, 0, 0]} name='Đặt xe đi chung' />
                        <Bar dataKey="booking_destination" fill="#FFAB91" legendType='circle' radius={[5, 5, 0, 0]} name='Đặt xe điểm đến' />
                    </BarChart>
                </ResponsiveContainer>
            )}
        </div>
    )
}

export default AttendanceChart;
