'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getCustomer } from '@/services/api/user';

interface CustomerData {
    week: string;
    newUsers: number;
    totalUsers: number;
}

interface Customer {
    id: string;
    createdAt: string;
    name?: string;
    email?: string;
    phone?: string;
}

interface WeeklyCustomerData {
    customers: Customer[];
    count: number;
}

const FinanceChart = () => {
    const [chartData, setChartData] = useState<CustomerData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                setLoading(true);
                const response = await getCustomer();

                if (Array.isArray(response)) {
                    // Group customers by week based on their createdAt date
                    const customersByWeek = response.reduce((acc: Record<string, WeeklyCustomerData>, customer: Customer) => {
                        const createdAt = new Date(customer.createdAt);
                        const weekNumber = getWeekNumber(createdAt);
                        const weekKey = `Week ${weekNumber}`;

                        if (!acc[weekKey]) {
                            acc[weekKey] = {
                                customers: [],
                                count: 0
                            };
                        }

                        acc[weekKey].customers.push(customer);
                        acc[weekKey].count += 1;

                        return acc;
                    }, {});

                    // Convert to chart data format
                    const formattedData: CustomerData[] = Object.keys(customersByWeek).map((week, index, weeks) => {
                        const newUsers = customersByWeek[week].count;

                        // Calculate total users up to this week
                        let totalUsers = 0;
                        for (let i = 0; i <= index; i++) {
                            totalUsers += customersByWeek[weeks[i]].count;
                        }

                        return {
                            week,
                            newUsers,
                            totalUsers
                        };
                    });

                    // Sort by week number
                    formattedData.sort((a, b) => {
                        const weekA = parseInt(a.week.replace('Week ', ''));
                        const weekB = parseInt(b.week.replace('Week ', ''));
                        return weekA - weekB;
                    });

                    setChartData(formattedData);
                }
            } catch (error) {
                console.error("Error fetching customer data:", error);
                // Fallback to sample data if API fails
                setChartData(getSampleData());
            } finally {
                setLoading(false);
            }
        };

        fetchCustomers();
    }, []);

    // Helper function to get week number from date
    const getWeekNumber = (date: Date): number => {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    };

    // Sample data as fallback
    const getSampleData = (): CustomerData[] => [
        { week: 'Week 1', newUsers: 120, totalUsers: 120 },
        { week: 'Week 2', newUsers: 150, totalUsers: 270 },
        { week: 'Week 3', newUsers: 180, totalUsers: 450 },
        { week: 'Week 4', newUsers: 200, totalUsers: 650 },
        { week: 'Week 5', newUsers: 250, totalUsers: 900 },
        { week: 'Week 6', newUsers: 300, totalUsers: 1200 },
        { week: 'Week 7', newUsers: 350, totalUsers: 1550 },
        { week: 'Week 8', newUsers: 400, totalUsers: 1950 }
    ];

    return (
        <div className="bg-white rounded-xl w-full h-full p-4">
            {/* TITLE */}
            <div className='flex justify-between items-center'>
                <h1 className='text-lg font-semibold'>Customer Growth</h1>
                <Image src="/icons/ellipsis.svg" alt="" width={20} height={20} />
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-[300px]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height="90%">
                    <LineChart
                        width={500}
                        height={300}
                        data={chartData}
                        margin={{
                            top: 5,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke='#ddd' />
                        <XAxis dataKey="week" axisLine={false} tick={{ fill: "#d1d5db" }} tickLine={false} tickMargin={20} />
                        <YAxis axisLine={false} tick={{ fill: "#d1d5db" }} tickLine={false} tickMargin={20} />
                        <Tooltip />
                        <Legend align='center' verticalAlign='top' wrapperStyle={{ paddingTop: "20px", paddingBottom: '40px' }} />
                        <Line type="monotone" dataKey="newUsers" name="New Customers" stroke="#C3EBFA" strokeWidth={5} />
                        <Line type="monotone" dataKey="totalUsers" name="Total Customers" stroke="#CFCEFF" strokeWidth={5} />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    )
}
export default FinanceChart