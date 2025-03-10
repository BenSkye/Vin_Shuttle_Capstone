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
            {/* Hero Section - Enhanced Design */}
            <section className="relative h-[800px] w-full bg-gradient-to-br from-blue-800 via-blue-600 to-blue-400 overflow-hidden">
                {/* Static Background Image */}
                <div className="absolute inset-0 w-full h-full">
                    <Image
                        src="/images/background.gif"
                        alt="VinShuttle Background"
                        fill
                        className="object-cover opacity-20"
                        priority
                    />
                    {/* Subtle Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-900/50 to-transparent" />
                </div>

                {/* Content */}
                <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="max-w-lg text-white z-10"
                    >
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 drop-shadow-lg">
                            VinShuttle: <br /> Di chuyển tương lai
                        </h1>
                        <p className="text-lg md:text-xl lg:text-2xl font-light mb-8 opacity-90 drop-shadow-md">
                            Trải nghiệm dịch vụ xe điện thông minh, thân thiện môi trường, và tiện lợi trong từng chuyến đi.
                        </p>
                        <div className="flex flex-wrap gap-6">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-4 bg-white text-blue-700 rounded-full font-semibold shadow-lg hover:bg-blue-100 transition-all duration-300"
                            >
                                Đặt xe ngay
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-full font-semibold hover:bg-white/20 transition-all duration-300"
                            >
                                Tìm hiểu thêm
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Animated Visual Element */}
                    <motion.div
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="hidden lg:block relative z-10"
                    >
                        {/* <Image
                            src="/images/busanimation.gif"
                            alt="VinShuttle Electric Bus"
                            width={200}
                            height={200}
                            className="object-contain drop-shadow-2xl"
                        /> */}
                        {/* Floating Icon Animation */}
                        <motion.div
                            animate={{ y: [0, -20, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute top-10 right-10 bg-blue-500 p-3 rounded-full shadow-lg"
                        >
                            <FaCar className="text-white w-6 h-6" />
                        </motion.div>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white text-lg opacity-75"
                >
                    <span>Kéo xuống</span>
                    <div className="mt-2 w-6 h-10 border-2 border-white rounded-full flex items-start justify-center">
                        <div className="w-1 h-3 bg-white rounded-full animate-bounce" />
                    </div>
                </motion.div>
            </section>

            {/* Services Section - Unchanged */}
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

            {/* How It Works Section - Unchanged */}
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

            {/* Testimonials Section - Unchanged */}
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

// Data (unchanged)
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