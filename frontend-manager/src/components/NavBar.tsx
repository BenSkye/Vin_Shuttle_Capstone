'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const NavBar = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState('');
    const [userRole, setUserRole] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Check login status on component mount
        const checkLoginStatus = () => {
            const token = localStorage.getItem('accessToken');
            setIsLoggedIn(!!token);

            if (token) {
                try {
                    const user = JSON.parse(localStorage.getItem('user') || '{}');
                    setUserName(user.name || 'User');
                    setUserRole(user.role || 'Admin');
                } catch (error) {
                    console.error('Error parsing user data:', error);
                    setUserName('User');
                    setUserRole('Admin');
                }
            }
        };

        checkLoginStatus();

        // Close dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        document.cookie = "accessToken=; path=/; domain=" + window.location.hostname + "; expires=Thu, 01 Jan 1970 00:00:00 UTC";
        document.cookie = "refreshToken=; path=/; domain=" + window.location.hostname + "; expires=Thu, 01 Jan 1970 00:00:00 UTC";

        setIsLoggedIn(false);
        setShowDropdown(false);
        router.push('/login');
    };

    return (
        <div>
            <div className="flex items-center justify-between p-4">
                {/* SEARCH BAR */}
                <div className='hidden md:flex items-center gap-2 text-xs rounded-full ring-[1.5px] ring-gray-300 px-2'>
                    <Image src='/icons/search.svg' alt="" width={14} height={14} />
                    <input type='text' placeholder='Search...' className='w-[200px] p-2 bg-transparent outline-none' />
                </div>

                {/* Icon and user/auth section */}
                <div className='flex items-center gap-6 justify-end w-full'>
                    {isLoggedIn ? (
                        <>
                            <div className='bg-white rounded-fully w-7 h-7 flex items-center justify-center'>
                                <Image src='/icons/message.svg' alt="" width={20} height={20} />
                            </div>
                            <div className='bg-white rounded-fully w-7 h-7 flex items-center justify-center relative'>
                                <Image src='/icons/bell.svg' alt="" width={20} height={20} />
                                <div
                                    className='absolute -top-3 -right-3 w-5 h-5 flex items-center justify-center bg-purple-500 text-white rounded-full text-xs'>
                                    1
                                </div>
                            </div>

                            {/* User profile section */}
                            <div className='relative' ref={dropdownRef}>
                                <div
                                    className='flex items-center gap-3 cursor-pointer'
                                    onClick={() => setShowDropdown(!showDropdown)}
                                >
                                    <div className='flex flex-col'>
                                        <span className='text-xs leading-3 font-medium'>{userName}</span>
                                        <span className="text-[10px] text-gray-500 text-right">{userRole}</span>
                                    </div>
                                    <Image
                                        src="/icons/user.svg"
                                        alt=""
                                        width={36}
                                        height={36}
                                        className='rounded-full'
                                    />
                                </div>

                                {/* Dropdown menu */}
                                {showDropdown && (
                                    <div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50'>
                                        <Link href="/profile" className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'>
                                            My Profile
                                        </Link>
                                        <Link href="/settings" className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'>
                                            Settings
                                        </Link>
                                        <hr className='my-1' />
                                        <button
                                            onClick={handleLogout}
                                            className='block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100'
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className='flex items-center gap-4'>
                            <Link
                                href="/login"
                                className='text-sm font-medium text-gray-700 hover:text-purple-500'
                            >
                                Login
                            </Link>
                            <Link
                                href="/register"
                                className='text-sm font-medium bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600'
                            >
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NavBar;