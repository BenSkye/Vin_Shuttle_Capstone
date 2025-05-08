'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  FaCarAlt,
  FaClock,
  FaMapMarkedAlt,
  FaMoneyBillWave,
  FaPhoneAlt,
  FaRoute,
  FaShieldAlt,
  FaUserTie,
  FaUsers,
  FaArrowRight,
} from 'react-icons/fa'

import { Routes } from '@/constants/routers'
import { motion } from 'framer-motion'

import ServiceCard from './components/ServiceCard'

const HomePage = () => {
  const [selectedService, setSelectedService] = useState<'hour' | 'route' | 'destination' | 'shared'>('hour')

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
      title: 'Đặt xe lộ trình tham quan',
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
    {
      id: 'shared',
      title: 'Đặt xe đi chung',
      description: 'Chia sẻ chuyến đi, tiết kiệm chi phí',
      icon: <FaUsers className="h-8 w-8 text-green-500" />,
      href: Routes.RIDE.SHARED,
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative min-h-screen w-full">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="/images/vinhome-background.jpg"
            alt="VinHomes Grand Park"
            fill
            priority
            className="object-cover brightness-[0.6]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60" />
        </div>

        <div className="relative flex min-h-screen flex-col">
          <div className="container mx-auto flex flex-1 flex-col px-4 sm:px-6 lg:px-8">
            <div className="flex flex-1 flex-col items-center justify-center gap-8 lg:flex-row lg:items-center lg:justify-center lg:gap-12">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-xl space-y-8 text-center lg:text-left"
              >
                <span className="inline-block rounded-full bg-green-500/90 px-4 py-1.5 text-sm font-medium text-white">
                  Dịch vụ đưa đón nội khu
                </span>

                <div className="space-y-4">
                  <h1 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
                    VinShuttle
                    <span className="mt-2 block text-xl font-normal text-green-400 sm:text-2xl">
                      Đồng hành cùng mọi hành trình
                    </span>
                  </h1>

                  <p className="mx-auto text-base text-gray-300 sm:text-lg lg:mx-0">
                    Trải nghiệm dịch vụ vận chuyển hiện đại, an toàn và tiện lợi trong khu đô thị VinHomes Grand Park
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                  <Link
                    href={Routes.RIDE.DESTINATION}
                    className="group flex items-center justify-center gap-2 rounded-full bg-green-500 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-green-600 hover:shadow-lg active:transform active:scale-95 sm:text-base"
                  >
                    <span>Đặt xe ngay</span>
                    <FaArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href={Routes.RIDE.SHARED}
                    className="group flex items-center justify-center gap-2 rounded-full bg-white/10 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:shadow-lg active:transform active:scale-95 sm:text-base"
                  >
                    <span>Đặt xe đi chung</span>
                    <FaArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <div className="rounded-xl bg-black/30 p-3 text-center backdrop-blur-sm sm:p-4">
                    <div className="text-lg font-bold text-green-400 sm:text-xl">500+</div>
                    <div className="mt-1 text-xs text-gray-300 sm:text-sm">Chuyến/Ngày</div>
                  </div>
                  <div className="rounded-xl bg-black/30 p-3 text-center backdrop-blur-sm sm:p-4">
                    <div className="text-lg font-bold text-green-400 sm:text-xl">50+</div>
                    <div className="mt-1 text-xs text-gray-300 sm:text-sm">Xe điện</div>
                  </div>
                  <div className="rounded-xl bg-black/30 p-3 text-center backdrop-blur-sm sm:p-4">
                    <div className="text-lg font-bold text-green-400 sm:text-xl">4.9/5</div>
                    <div className="mt-1 text-xs text-gray-300 sm:text-sm">Đánh giá</div>
                  </div>
                </div>
              </motion.div>

              {/* Right Image */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="hidden w-full max-w-xl lg:block"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-xl ring-1 ring-white/10">
                  <Image
                    src="/images/Xe-bus-dien-11-cho.jpg"
                    alt="VinBus Electric"
                    fill
                    priority
                    className="object-cover object-center transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 w-full p-6">
                    <h3 className="text-xl font-bold text-white">Xe điện VinBus</h3>
                    <p className="mt-1 text-gray-300">Thân thiện với môi trường</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 1,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="mb-8 text-center text-white"
            >
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-medium text-gray-300 sm:text-sm">Cuộn xuống</span>
                <div className="h-5 w-3 rounded-full border-2 border-white/30 sm:h-6 sm:w-4">
                  <div className="mx-auto h-1.5 w-1 animate-bounce rounded-full bg-white sm:h-2" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div id="services" className="container mx-auto px-4 py-16">
        <h2 className="mb-12 text-center text-3xl font-bold">Các dịch vụ của chúng tôi</h2>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              {...service}
              isSelected={selectedService === service.id}
              onSelect={() => setSelectedService(service.id as 'hour' | 'route' | 'destination' | 'shared')}
            />
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl lg:text-4xl">
              Tại sao chọn VinShuttle?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-gray-600 sm:text-base">
              Chúng tôi cung cấp dịch vụ vận chuyển chất lượng cao, an toàn và thân thiện với môi trường
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:mt-10 sm:grid-cols-2 lg:mt-12 lg:grid-cols-3 lg:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative rounded-xl bg-white p-5 shadow-md ring-1 ring-gray-200 transition-all hover:shadow-lg sm:p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-500/10 text-green-600 transition-colors group-hover:text-white sm:h-12 sm:w-12">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 sm:text-lg">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600 sm:text-base">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
