'use client'

import { useEffect, useState } from 'react'

import { MailOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

import { User } from '@/interface/user.interface'
import { editProfile, profileUser } from '@/service/user.service'

const EditProfilePage = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  })
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await profileUser()
        setUser(response.data)
        setFormData({
          name: response.data.name || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
        })
      } catch (error) {
        console.error('Error fetching profile:', error)
      }
    }
    fetchProfile()
  }, [])

  const validatePhoneNumber = (phone: string): boolean => {
    // Check if phone contains exactly 10 digits
    const phoneRegex = /^\d{10}$/
    return phoneRegex.test(phone)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    // Clear previous error for this field
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }))

    // Special validation for phone number
    if (name === 'phone') {
      // Only allow digits
      const digitsOnly = value.replace(/\D/g, '')

      // Update with digits only
      setFormData(prev => ({
        ...prev,
        [name]: digitsOnly
      }))

      // Validate if the field is not empty
      if (digitsOnly && !validatePhoneNumber(digitsOnly)) {
        setErrors(prev => ({
          ...prev,
          phone: 'Số điện thoại phải có đúng 10 chữ số'
        }))
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate all fields before submission
    const newErrors = {
      name: '',
      email: '',
      phone: '',
    }

    let hasErrors = false

    if (!formData.name.trim()) {
      newErrors.name = 'Vui lòng nhập họ và tên'
      hasErrors = true
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email'
      hasErrors = true
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại'
      hasErrors = true
    } else if (!validatePhoneNumber(formData.phone)) {
      newErrors.phone = 'Số điện thoại phải có đúng 10 chữ số'
      hasErrors = true
    }

    setErrors(newErrors)

    if (hasErrors) {
      return
    }

    setLoading(true)

    try {
      const updatedData = { ...formData } // Include avatar if needed
      await editProfile(updatedData)
      toast.success('Cập nhật thông tin thành công')
      router.push('/profile')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Cập nhật thông tin thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full">
      <div className="mx-auto w-full px-4 py-12 sm:px-8">
        <div className="min-h-[600px] w-full rounded-xl bg-white shadow-md">
          <div className="flex min-h-[600px] w-full flex-col md:flex-row">
            {/* Left Sidebar */}
            <div className="w-full p-8 md:w-1/4 md:border-r">
              <div className="flex flex-col items-center">
                <div className="h-40 w-40 overflow-hidden rounded-full border-4 border-blue-100 shadow-md md:h-56 md:w-56">
                  <Image
                    src="/images/default-images.jpg"
                    alt="Profile"
                    width={224}
                    height={224}
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Right Content - Form */}
            <div className="w-full p-8 md:w-3/4">
              <form onSubmit={handleSubmit} className="w-full space-y-8">
                <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-2">
                  <div className="w-full">
                    <label className="mb-3 block text-base font-medium text-gray-700">
                      Họ và tên
                    </label>
                    <div className="relative w-full">
                      <UserOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full rounded-lg border ${errors.name ? 'border-red-500' : 'border-gray-300'} py-3 pl-12 pr-4 text-base transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500`}
                        placeholder="Nhập họ và tên"
                      />
                    </div>
                    {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                  </div>

                  <div className="w-full">
                    <label className="mb-3 block text-base font-medium text-gray-700">Email</label>
                    <div className="relative w-full">
                      <MailOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'} py-3 pl-12 pr-4 text-base transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500`}
                        placeholder="Nhập email"
                      />
                    </div>
                    {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                  </div>

                  <div className="w-full">
                    <label className="mb-3 block text-base font-medium text-gray-700">
                      Số điện thoại
                    </label>
                    <div className="relative w-full">
                      <PhoneOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full rounded-lg border ${errors.phone ? 'border-red-500' : 'border-gray-300'} py-3 pl-12 pr-4 text-base transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500`}
                        placeholder="Nhập số điện thoại"
                        maxLength={10}
                      />
                    </div>
                    {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                  </div>

                  {/* <div className="col-span-1 md:col-span-2 w-full">
                                        <label className="block text-base font-medium text-gray-700 mb-3">Địa chỉ</label>
                                        <div className="relative w-full">
                                            <HomeOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                                            <input type="text" name="address" value={formData.address} onChange={handleInputChange}
                                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 
                                                focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                                                placeholder="Nhập địa chỉ" />
                                        </div>
                                    </div> */}
                </div>

                {/* Submit Button */}
                <div className="flex w-full justify-end pt-8">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center rounded-lg bg-blue-500 px-8 py-3 text-base font-medium text-white shadow-md transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <svg
                        className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        ></path>
                      </svg>
                    ) : (
                      'Cập nhật'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditProfilePage
