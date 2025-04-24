'use client'

import Image from 'next/image'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const data = [
    {
        name: 'Mon',
        hourly: 60,
        route: 40,
    },
    {
        name: 'Tue',
        hourly: 70,
        route: 60,
    },
    {
        name: 'Wed',
        hourly: 70,
        route: 60,
    },
    {
        name: 'Thu',
        hourly: 90,
        route: 75,
    },
    {
        name: 'Fri',
        hourly: 65,
        route: 55,
    },
];

const AttendanceChart = () => {
    return (
        <div className='bg-white rounded-lg p-4 h-full'>
            <div className='flex justify-between items-center'>
                <h1 className='text-lg font-semibold'>Số lượng đặt xe</h1>
                <Image src='/icons/ellipsis.svg' alt="" width={20} height={20} />
            </div>
            <ResponsiveContainer width="100%" height="90%">
                <BarChart
                    width={500}
                    height={300}
                    data={data}
                    barSize={20}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke='#ddd' />
                    <XAxis dataKey="name" axisLine={false} tick={{ fill: "#d1d5db" }} tickLine={false} />
                    <YAxis axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: "10px", borderColor: "lightgray" }} />
                    <Legend align='left' verticalAlign='top' wrapperStyle={{ paddingTop: "20px", paddingBottom: '40px' }} />
                    <Bar dataKey="hourly" fill="#FAE27C" legendType='circle' radius={[10, 10, 0, 0]} name='Đặt theo giờ' />
                    <Bar dataKey="route" fill="#C3EBFA" legendType='circle' radius={[10, 10, 0, 0]} name='Đặt theo lộ trình ngắm cảnh' />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

export default AttendanceChart;
