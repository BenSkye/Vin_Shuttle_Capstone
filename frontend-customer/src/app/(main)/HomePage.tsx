'use client';
import { motion } from 'framer-motion';
import { FaCar, FaRoute, FaUsers } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import Image from 'next/image';

const HomePage = () => {
    return (
        <div className="w-full min-h-screen">
            {/* Hero Section - Made taller */}
            <section className="relative h-[700px] w-full bg-gradient-to-r from-blue-700 to-blue-500">
                <div className="absolute inset-0 w-full h-full overflow-hidden">
                    <Image
                        src="/images/hero-bg.jpg"
                        alt="VinShuttle Hero"
                        fill
                        className="object-cover opacity-30"
                        priority
                    />
                </div>
                <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-2xl bg-white bg-opacity-70 p-8 rounded-lg shadow-lg"
                    >
                        <h1 className="text-4xl md:text-6xl font-bold text-blue-900 mb-6">
                            Di chuyển thông minh cùng VinShuttle
                        </h1>
                        <p className="text-xl text-blue-900/90 mb-8">
                            Dịch vụ xe điện thân thiện môi trường, đặt xe dễ dàng,
                            di chuyển thuận tiện trong khu đô thị.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <button className="px-8 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors">
                                Đặt xe ngay
                            </button>
                            <button className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-full font-semibold hover:bg-blue-50 transition-colors">
                                Tìm hiểu thêm
                            </button>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Services Section - Full width */}
            <section className="w-full py-24 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-full">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-blue-900">Dịch vụ của chúng tôi</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {services.map((service, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="bg-gray-50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow h-full"
                            >
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                                    {service.icon}
                                </div>
                                <h3 className="text-xl font-semibold mb-4 text-blue-900">{service.title}</h3>
                                <p className="text-gray-600">{service.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section - Full width */}
            <section className="w-full py-24 bg-gray-100">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-full">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-blue-900">Cách thức hoạt động</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
                        {steps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="text-center h-full flex flex-col items-center"
                            >
                                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-6 text-white text-2xl">
                                    {index + 1}
                                </div>
                                <h3 className="text-xl font-semibold mb-4 text-blue-900">{step.title}</h3>
                                <p className="text-gray-600">{step.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Section - Full width */}
            <section className="w-full py-24 bg-white">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-full">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-blue-900">Khách hàng nói gì về chúng tôi</h2>
                    <div className="max-w-7xl mx-auto">
                        <Swiper
                            modules={[Autoplay, Pagination]}
                            spaceBetween={30}
                            slidesPerView={1}
                            breakpoints={{
                                640: { slidesPerView: 2 },
                                1024: { slidesPerView: 3 }
                            }}
                            autoplay={{ delay: 5000 }}
                            pagination={{ clickable: true }}
                            className="testimonials-swiper"
                        >
                            {testimonials.map((testimonial, index) => (
                                <SwiperSlide key={index}>
                                    <div className="bg-gray-50 p-8 rounded-xl shadow-lg h-full">
                                        <div className="flex items-center mb-6">
                                            <Image
                                                src={testimonial.avatar}
                                                alt={testimonial.name}
                                                width={60}
                                                height={60}
                                                className="rounded-full"
                                            />
                                            <div className="ml-4">
                                                <h4 className="font-semibold text-lg text-blue-900">{testimonial.name}</h4>
                                                <div className="flex text-yellow-400">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i}>★</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-gray-600">{testimonial.comment}</p>
                                    </div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </div>
            </section>
        </div>
    );
};

// Data
const services = [
    {
        icon: <FaCar className="w-8 h-8 text-blue-500" />,
        title: "Đặt xe theo giờ",
        description: "Linh hoạt đặt xe theo nhu cầu thời gian của bạn, phù hợp cho các chuyến đi ngắn hoặc dài."
    },
    {
        icon: <FaRoute className="w-8 h-8 text-blue-500" />,
        title: "Đặt xe theo tuyến",
        description: "Di chuyển theo các tuyến đường có sẵn với giá cả hợp lý và lộ trình rõ ràng."
    },
    {
        icon: <FaUsers className="w-8 h-8 text-blue-500" />,
        title: "Đi chung",
        description: "Chia sẻ chuyến đi với những người khác, tiết kiệm chi phí và thân thiện với môi trường."
    }
];

const steps = [
    {
        title: "Chọn dịch vụ",
        description: "Lựa chọn hình thức đặt xe phù hợp với nhu cầu của bạn"
    },
    {
        title: "Đặt lịch",
        description: "Chọn thời gian và địa điểm đón phù hợp"
    },
    {
        title: "Xác nhận",
        description: "Xác nhận thông tin và thanh toán chuyến đi"
    },
    {
        title: "Tận hưởng",
        description: "Tận hưởng chuyến đi an toàn và thoải mái"
    }
];

const testimonials = [
    {
        name: "Nguyễn Văn A",
        avatar: "/images/avatar1.jpg",
        comment: "Dịch vụ rất tốt, tài xế thân thiện và chuyên nghiệp. Tôi sẽ tiếp tục sử dụng dịch vụ này."
    },
    {
        name: "Trần Thị B",
        avatar: "/images/avatar2.jpg",
        comment: "Đặt xe dễ dàng, giá cả hợp lý. Xe điện rất sạch sẽ và thân thiện với môi trường."
    },
    {
        name: "Lê Văn C",
        avatar: "/images/avatar3.jpg",
        comment: "Chất lượng dịch vụ xuất sắc, đúng giờ và an toàn. Rất hài lòng với VinShuttle."
    }
];

export default HomePage;