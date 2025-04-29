import Image from 'next/image'
const currentYear = new Date().getFullYear();

const AboutUsPage = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      {/* Header */}
      <header className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">VinShuttle</h1>
        <p className="text-xl text-gray-600">Dịch vụ xe điện nội khu VinHomes Grand Park</p>
      </header>

      {/* Giới thiệu chung */}
      <section className="mb-12">
        <div className="flex flex-col items-center md:flex-row md:items-start">
          <p className="mb-6 leading-relaxed text-gray-700 md:mb-0 md:w-1/2">
            Chào mừng bạn đến với VinShuttle - dịch vụ xe điện hiện đại phục vụ cư dân VinHomes
            Grand Park. Chúng tôi cung cấp giải pháp di chuyển tiện lợi, an toàn và thân thiện với
            môi trường trong khuôn viên khu đô thị.
          </p>
          <div className="grid grid-cols-1 gap-8 md:w-1/2 md:grid-cols-2">
            <div className="relative h-[250px] w-full">
              <Image
                src="https://via.placeholder.com/600x400"
                alt="VinShuttle Xe Điện"
                fill
                className="rounded-lg object-cover shadow-md"
              />
            </div>
            <div className="relative h-[250px] w-full">
              <Image
                src="https://via.placeholder.com/600x400"
                alt="VinShuttle Dịch Vụ"
                fill
                className="rounded-lg object-cover shadow-md"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Lý do chọn VinShuttle */}
      <section className="mb-12">
        <h2 className="mb-6 text-3xl font-semibold text-gray-900">Tại sao chọn VinShuttle?</h2>
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h3 className="mb-3 text-xl font-semibold text-gray-900">Đội xe hiện đại</h3>
            <p className="text-gray-700">
              Sở hữu đội xe điện hiện đại, thân thiện môi trường, được bảo dưỡng định kỳ đảm bảo an
              toàn tối đa cho hành khách.
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h3 className="mb-3 text-xl font-semibold text-gray-900">Giá cả hợp lý</h3>
            <p className="text-gray-700">
              Mức giá phải chăng, nhiều gói dịch vụ linh hoạt phù hợp với nhu cầu của mọi cư dân.
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h3 className="mb-3 text-xl font-semibold text-gray-900">Đặt xe dễ dàng</h3>
            <p className="text-gray-700">
              Đặt xe nhanh chóng qua ứng dụng di động hoặc website, theo dõi vị trí xe theo thời
              gian thực.
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-md">
            <h3 className="mb-3 text-xl font-semibold text-gray-900">Dịch vụ chuyên nghiệp</h3>
            <p className="text-gray-700">
              Đội ngũ tài xế được đào tạo chuyên nghiệp, thân thiện và nhiệt tình phục vụ quý khách.
            </p>
          </div>
        </div>
      </section>

      {/* Di chuyển thuận tiện */}
      <section className="mb-12">
        <h2 className="mb-6 text-3xl font-semibold text-gray-900">Di chuyển thuận tiện</h2>
        <div className="flex flex-col items-center md:flex-row md:items-start">
          <p className="mb-6 leading-relaxed text-gray-700 md:mb-0 md:w-1/2">
            VinShuttle kết nối mọi điểm đến trong khu đô thị VinHomes Grand Park, từ các tòa nhà
            chung cư đến trung tâm thương mại, công viên và các tiện ích công cộng khác.
          </p>
          <div className="grid grid-cols-1 gap-8 md:w-1/2 md:grid-cols-2">
            <div className="relative h-[250px] w-full">
              <Image
                src="https://via.placeholder.com/600x400"
                alt="VinShuttle Kết Nối"
                fill
                className="rounded-lg object-cover shadow-md"
              />
            </div>
            <div className="relative h-[250px] w-full">
              <Image
                src="https://via.placeholder.com/600x400"
                alt="VinShuttle Tiện Ích"
                fill
                className="rounded-lg object-cover shadow-md"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Đặt xe ngay */}
      <section className="text-center">
        <h2 className="mb-6 text-3xl font-semibold text-gray-900">Đặt xe ngay</h2>
        <p className="mb-6 text-gray-700">
          Trải nghiệm dịch vụ xe điện tiện lợi cùng VinShuttle ngay hôm nay!
        </p>
        <button className="rounded-lg bg-green-500 px-8 py-3 text-white transition-colors hover:bg-green-600">
          Đặt xe
        </button>
        <div className="mt-8 text-gray-700">
          <p className="mb-2 font-semibold">Liên hệ với chúng tôi:</p>
          <p>Hotline: 1900 xxxx</p>
          <p>Email: support@vinshuttle.com</p>
          <p>Website: vinshuttle.com</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-12 text-center text-gray-600">
        <p>&copy; {currentYear} VinShuttle. Bản quyền thuộc về VinHomes.</p>
      </footer>
    </div>
  )
}

export default AboutUsPage
