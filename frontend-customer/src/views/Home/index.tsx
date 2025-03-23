'use client'

import { useState } from 'react'

import Image from 'next/image'
import {
  FaCarAlt,
  FaClock,
  FaMapMarkedAlt,
  FaMoneyBillWave,
  FaPhoneAlt,
  FaRoute,
  FaShieldAlt,
  FaUserTie,
} from 'react-icons/fa'

import BookingForm from './components/BookingForm'
import FeatureCard from './components/FeatureCard'
import ServiceCard from './components/ServiceCard'
import { Routes } from '@/constants/routers'

const HomePage = () => {
  const [selectedService, setSelectedService] = useState<'hour' | 'route' | 'destination'>('hour')
  const [tripType, setTripType] = useState<'one-way' | 'roundtrip'>('one-way')
  const [passengers, setPassengers] = useState(1)
  const [selectedDate, setSelectedDate] = useState('')

  const services = [
    {
      id: 'hour',
      title: 'Đặt xe theo giờ',
      description: 'Thuê xe theo giờ với tài xế chuyên nghiệp',
      icon: <FaClock className="h-8 w-8 text-green-500" />,
      href: Routes.RIDE.HOURLY,
    },
    {
      id: 'route',
      title: 'Đặt xe theo tuyến cố định',
      description: 'Di chuyển theo các tuyến đường quen thuộc',
      icon: <FaRoute className="h-8 w-8 text-green-500" />,
      href: Routes.RIDE.ROUTES,
    },
    {
      id: 'destination',
      title: 'Đặt xe điểm đến',
      description: 'Đặt xe đi đến điểm đến mong muốn',
      icon: <FaMapMarkedAlt className="h-8 w-8 text-green-500" />,
      href: Routes.RIDE.DESTINATION,
    },
  ]

  const features = [
    {
      icon: <FaShieldAlt className="h-8 w-8 text-green-500" />,
      title: 'An toàn tuyệt đối',
      description: 'Đội ngũ tài xế được đào tạo chuyên nghiệp, xe đời mới được bảo dưỡng định kỳ',
    },
    {
      icon: <FaClock className="h-8 w-8 text-green-500" />,
      title: 'Đặt xe nhanh chóng',
      description: 'Chỉ với vài thao tác đơn giản, xe sẽ đến đón bạn trong thời gian ngắn nhất',
    },
    {
      icon: <FaUserTie className="h-8 w-8 text-green-500" />,
      title: 'Tài xế chuyên nghiệp',
      description: 'Đội ngũ tài xế được tuyển chọn kỹ lưỡng, thân thiện và nhiệt tình',
    },
    {
      icon: <FaCarAlt className="h-8 w-8 text-green-500" />,
      title: 'Xe đời mới',
      description: 'Đội xe hiện đại, sang trọng, đảm bảo trải nghiệm thoải mái cho khách hàng',
    },
    {
      icon: <FaPhoneAlt className="h-8 w-8 text-green-500" />,
      title: 'Hỗ trợ 24/7',
      description: 'Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ mọi lúc mọi nơi',
    },
    {
      icon: <FaMoneyBillWave className="h-8 w-8 text-green-500" />,
      title: 'Giá cả hợp lý',
      description: 'Mức giá cạnh tranh, nhiều ưu đãi hấp dẫn cho khách hàng thân thiết',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[900px]">
        <Image
          src="/images/vinhome-background.jpg"
          alt="VinHomes Grand Park"
          fill
          className="brightness-80 object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50">
          <div className="container mx-auto h-full px-4">
            <div className="grid h-full grid-cols-1 items-center gap-8 md:grid-cols-2">
              {/* Left side - Text content */}
              <div className="max-w-2xl rounded-xl bg-black/40 p-8 text-white backdrop-blur-sm">
                <h1 className="mb-6 text-4xl font-bold md:text-5xl">
                  VinShuttle - Dịch vụ đưa đón nội khu
                </h1>
                <p className="mb-8 text-xl md:text-2xl">An toàn - Tiện lợi - Chuyên nghiệp</p>
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
        <h2 className="mb-12 text-center text-3xl font-bold">Các dịch vụ của chúng tôi</h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
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
          <h2 className="mb-12 text-center text-3xl font-bold">Tại sao chọn VinShuttle?</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
