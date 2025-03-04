'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
    UserOutlined,
    MailOutlined,
    PhoneOutlined,
    CameraOutlined,
    HomeOutlined
} from '@ant-design/icons';
import { profileUser, editProfile } from '@/service/user.service';
import { User } from '@/interface/user';

const EditProfilePage = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [avatar, setAvatar] = useState('/default-avatar.png');
    const [user, setUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',

    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await profileUser();
                setUser(response.data);
                setFormData({
                    name: response.data.name || '',
                    email: response.data.email || '',
                    phone: response.data.phone || '',

                });
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        };
        fetchProfile();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const updatedData = { ...formData }; // Include avatar if needed
            await editProfile(updatedData);
            router.push('/profile');
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 w-full">
            <div className="w-full mx-auto px-4 sm:px-8 py-12">
                <div className="bg-white rounded-xl shadow-md w-full min-h-[600px]">
                    <div className="flex flex-col md:flex-row w-full min-h-[600px]">
                        {/* Left Sidebar */}
                        <div className="w-full md:w-1/4 p-8 md:border-r">
                            <div className="flex flex-col items-center">
                                <div className="relative">
                                    <div className="w-40 h-40 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-blue-100 shadow-md">
                                        <Image src={avatar} alt="Profile" width={224} height={224} className="object-cover" />
                                    </div>
                                    <label htmlFor="avatar-upload" className="absolute bottom-3 right-3 w-12 h-12 bg-blue-500 rounded-full 
                                        flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors shadow-lg">
                                        <CameraOutlined className="text-white text-xl" />
                                        <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Right Content - Form */}
                        <div className="w-full md:w-3/4 p-8">
                            <form onSubmit={handleSubmit} className="space-y-8 w-full">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                                    <div className="w-full">
                                        <label className="block text-base font-medium text-gray-700 mb-3">Họ và tên</label>
                                        <div className="relative w-full">
                                            <UserOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                                            <input type="text" name="name" value={formData.name} onChange={handleInputChange}
                                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 
                                                focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                                                placeholder="Nhập họ và tên" />
                                        </div>
                                    </div>

                                    <div className="w-full">
                                        <label className="block text-base font-medium text-gray-700 mb-3">Email</label>
                                        <div className="relative w-full">
                                            <MailOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                                            <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 
                                                focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                                                placeholder="Nhập email" />
                                        </div>
                                    </div>

                                    <div className="w-full">
                                        <label className="block text-base font-medium text-gray-700 mb-3">Số điện thoại</label>
                                        <div className="relative w-full">
                                            <PhoneOutlined className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                                            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 
                                                focus:ring-blue-500 focus:border-blue-500 transition-colors text-base"
                                                placeholder="Nhập số điện thoại" />
                                        </div>
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
                                <div className="flex justify-end pt-8 w-full">
                                    <button type="submit" disabled={loading}
                                        className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors 
                                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 
                                        disabled:cursor-not-allowed flex items-center text-base font-medium shadow-md">
                                        {loading ? (
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                            </svg>
                                        ) : 'Cập nhật'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditProfilePage;
