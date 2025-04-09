'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/form/LoginForm';
import { loginUser } from '@/services/api/user';
import { useAuth } from '@/contexts/AuthContext';

interface CustomError {
    isCustomError: boolean;
    message: string;
}

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [error, setError] = useState<string>('');

    const handleLogin = async (email: string, password: string) => {
        try {
            setError('');
            const response = await loginUser(email, password);

            if (!response) {
                setError('Đã xảy ra lỗi. Vui lòng thử lại.');
                return;
            }

            if (!response.token?.accessToken || !response.token?.refreshToken) {
                setError('Đã xảy ra lỗi xác thực. Vui lòng thử lại.');
                return;
            }

            await login(response.token.accessToken, response.token.refreshToken, response.userId);
            router.push('/');
        } catch (error) {
            if ((error as CustomError)?.isCustomError) {
                setError((error as CustomError).message);
            } else {
                setError('Đã xảy ra lỗi. Vui lòng thử lại.');
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-24 px-8 sm:px-12 lg:px-16">
            <div className="max-w-lg w-full space-y-10">
                <div>
                    <h2 className="mt-8 text-center text-4xl font-extrabold text-gray-900">
                        Đăng nhập
                    </h2>
                    {error && (
                        <p className="mt-2 text-center text-sm text-red-600">
                            {error}
                        </p>
                    )}
                </div>

                <LoginForm onSubmit={handleLogin} />
            </div>
        </div>
    );
}
