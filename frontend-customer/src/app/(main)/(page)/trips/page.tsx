'use client'
import { Spin, notification } from 'antd';
import useTripSocket from '@/hooks/useTripSocket';

const TripListPage = () => {
    const { data, isLoading, error } = useTripSocket();
    if (isLoading) return <Spin tip="Đang tải danh sách chuyến đi..." />;
    if (error) notification.error({
        message: 'Lỗi',
        description: error.message || 'Lỗi khi tải danh sách chuyến đi'
    });

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Lịch sử chuyến đi</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data?.map((trip) => (
                    <div
                        key={trip._id}
                        className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
                    >
                        {/* <h2 className="text-xl font-semibold mb-2">{trip.route.name}</h2> */}
                        {/* <p className="text-gray-600 mb-2">
                            {new Date(trip.startTime).toLocaleDateString()}
                        </p> */}
                        <p className='text-lg font-semibold'>{trip.driverId.name}</p>
                        <p className='text-lg font-semibold'>{trip.vehicleId.name}</p>
                        <p className={`badge ${trip.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}`}>
                            {trip.status}
                        </p>
                        {/* <Link
                            href={`/trips/${trip._id}`}
                            className="mt-4 inline-block text-blue-600 hover:underline"
                        >
                            Xem chi tiết →
                        </Link> */}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TripListPage;
