'use client'

const AboutUs = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <header className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">VinShuttle</h1>
                <p className="text-xl text-gray-600">Dịch vụ xe điện nội khu VinHomes Grand Park</p>
            </header>

            <section className="mb-12">
                <p className="text-gray-700 leading-relaxed mb-6">
                    Chào mừng bạn đến với VinShuttle - dịch vụ xe điện hiện đại phục vụ cư dân VinHomes Grand Park.
                    Chúng tôi cung cấp giải pháp di chuyển tiện lợi, an toàn và thân thiện với môi trường trong khuôn viên khu đô thị.
                </p>
            </section>

            <section className="mb-12">
                <h2 className="text-3xl font-semibold text-gray-900 mb-6">Tại sao chọn VinShuttle?</h2>
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Đội xe hiện đại</h3>
                        <p className="text-gray-700">
                            Sở hữu đội xe điện hiện đại, thân thiện môi trường, được bảo dưỡng định kỳ
                            đảm bảo an toàn tối đa cho hành khách.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Giá cả hợp lý</h3>
                        <p className="text-gray-700">
                            Mức giá phải chăng, nhiều gói dịch vụ linh hoạt phù hợp với nhu cầu của mọi cư dân.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Đặt xe dễ dàng</h3>
                        <p className="text-gray-700">
                            Đặt xe nhanh chóng qua ứng dụng di động hoặc website, theo dõi vị trí xe theo thời gian thực.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold text-gray-900 mb-3">Dịch vụ chuyên nghiệp</h3>
                        <p className="text-gray-700">
                            Đội ngũ tài xế được đào tạo chuyên nghiệp, thân thiện và nhiệt tình phục vụ quý khách.
                        </p>
                    </div>
                </div>
            </section>

            <section className="mb-12">
                <h2 className="text-3xl font-semibold text-gray-900 mb-6">Di chuyển thuận tiện</h2>
                <p className="text-gray-700 leading-relaxed mb-6">
                    VinShuttle kết nối mọi điểm đến trong khu đô thị VinHomes Grand Park, từ các tòa nhà
                    chung cư đến trung tâm thương mại, công viên và các tiện ích công cộng khác.
                </p>
            </section>

            <section className="text-center">
                <h2 className="text-3xl font-semibold text-gray-900 mb-6">Đặt xe ngay</h2>
                <p className="text-gray-700 mb-6">
                    Trải nghiệm dịch vụ xe điện tiện lợi cùng VinShuttle ngay hôm nay!
                </p>
                <button className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 transition-colors">
                    Đặt xe
                </button>
                <div className="mt-8 text-gray-700">
                    <p className="font-semibold mb-2">Liên hệ với chúng tôi:</p>
                    <p>Hotline: 1900 xxxx</p>
                    <p>Email: support@vinshuttle.com</p>
                    <p>Website: vinshuttle.com</p>
                </div>
            </section>

            <footer className="mt-12 text-center text-gray-600">
                <p>&copy; {new Date().getFullYear()} VinShuttle. Bản quyền thuộc về VinHomes.</p>
            </footer>
        </div>
    )
}

export default AboutUs