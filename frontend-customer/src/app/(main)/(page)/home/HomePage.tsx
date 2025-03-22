'use client';

import Image from 'next/image';
import { useState } from 'react';
import { FaCarAlt, FaClock, FaMapMarkedAlt, FaMoneyBillWave, FaPhoneAlt, FaRoute, FaShieldAlt, FaUserTie } from 'react-icons/fa';
import BookingForm from './components/BookingForm';
import ServiceCard from './components/ServiceCard';
import FeatureCard from './components/FeatureCard';

const HomePage = () => {
    const [selectedService, setSelectedService] = useState<'hour' | 'route' | 'destination'>('hour');
    const [tripType, setTripType] = useState<'one-way' | 'roundtrip'>('one-way');
    const [passengers, setPassengers] = useState(1);
    const [selectedDate, setSelectedDate] = useState('');

    const services = [
        {
            id: 'hour',
            title: 'Đặt xe theo giờ',
            description: 'Thuê xe theo giờ với tài xế chuyên nghiệp',
            icon: <FaClock className="w-8 h-8 text-green-500" />,
            href: '/bookhour'
        },
        {
            id: 'route',
            title: 'Đặt xe theo tuyến cố định',
            description: 'Di chuyển theo các tuyến đường quen thuộc',
            icon: <FaRoute className="w-8 h-8 text-green-500" />,
            href: '/bookroute'
        },
        {
            id: 'destination',
            title: 'Đặt xe điểm đến',
            description: 'Đặt xe đi đến điểm đến mong muốn',
            icon: <FaMapMarkedAlt className="w-8 h-8 text-green-500" />,
            href: '/bookdes'
        }
    ];

    const features = [
        {
            icon: <FaShieldAlt className="w-8 h-8 text-green-500" />,
            title: 'An toàn tuyệt đối',
            description: 'Đội ngũ tài xế được đào tạo chuyên nghiệp, xe đời mới được bảo dưỡng định kỳ'
        },
        {
            icon: <FaClock className="w-8 h-8 text-green-500" />,
            title: 'Đặt xe nhanh chóng',
            description: 'Chỉ với vài thao tác đơn giản, xe sẽ đến đón bạn trong thời gian ngắn nhất'
        },
        {
            icon: <FaUserTie className="w-8 h-8 text-green-500" />,
            title: 'Tài xế chuyên nghiệp',
            description: 'Đội ngũ tài xế được tuyển chọn kỹ lưỡng, thân thiện và nhiệt tình'
        },
        {
            icon: <FaCarAlt className="w-8 h-8 text-green-500" />,
            title: 'Xe đời mới',
            description: 'Đội xe hiện đại, sang trọng, đảm bảo trải nghiệm thoải mái cho khách hàng'
        },
        {
            icon: <FaPhoneAlt className="w-8 h-8 text-green-500" />,
            title: 'Hỗ trợ 24/7',
            description: 'Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ mọi lúc mọi nơi'
        },
        {
            icon: <FaMoneyBillWave className="w-8 h-8 text-green-500" />,
            title: 'Giá cả hợp lý',
            description: 'Mức giá cạnh tranh, nhiều ưu đãi hấp dẫn cho khách hàng thân thiết'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="relative h-[900px]">
                <Image
                    src="/images/vinhome-background.jpg"
                    alt="VinHomes Grand Park"
                    fill
                    className="object-cover brightness-80"
                    priority
                />
                < div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50">
                    <div className="container mx-auto px-4 h-full">
                        <div className="h-full grid grid-cols-1 md:grid-cols-2 items-center gap-8">
                            {/* Left side - Text content */}
                            <div className="text-white bg-black/40 backdrop-blur-sm rounded-xl p-8 max-w-2xl">
                                <h1 className="text-4xl md:text-5xl font-bold mb-6">
                                    VinShuttle - Dịch vụ đưa đón nội khu
                                </h1>
                                <p className="text-xl md:text-2xl mb-8">
                                    An toàn - Tiện lợi - Chuyên nghiệp
                                </p>
                            </div>

                            {/* Right side - Booking form */}
                            {/* <div className="w-full max-w-md mx-auto">
                                <BookingForm
                                    tripType={tripType}
                                    setTripType={setTripType}
                                    passengers={passengers}
                                    setPassengers={setPassengers}
                                    selectedDate={selectedDate}
                                    setSelectedDate={setSelectedDate}
                                />
                            </div> */}
                        </div>
                    </div>
                </div>
            </div>


            {/* Services Section */}
            <div className="container mx-auto px-4 py-16">
                <h2 className="text-3xl font-bold text-center mb-12">Các dịch vụ của chúng tôi</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {services.map((service) => (
                        <ServiceCard
                            key={service.id}
                            {...service}
                            isSelected={selectedService === service.id}
                            onSelect={() => setSelectedService(service.id as 'hour' | 'route' | 'destination')}
                        />
                    ))}
                </div>
            </div>

            {/* Features Section */}
            <div className="bg-white py-16">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">Tại sao chọn VinShuttle?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <FeatureCard key={index} {...feature} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;