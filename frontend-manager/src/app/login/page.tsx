'use client';

import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/form/LoginForm';
import { loginUser } from '@/services/api/user';

export default function LoginPage() {
    const router = useRouter();

    const handleLogin = async (email: string, password: string) => {
        try {
            const response = await loginUser(email, password);
            console.log("Response:", response);

            localStorage.setItem('accessToken', response.token.accessToken);
            localStorage.setItem('refreshToken', response.token.refreshToken);
            localStorage.setItem('userId', response.userId);

            document.cookie = `accessToken=${response.token.accessToken}; path=/; max-age=${60 * 60 * 24}; secure`;

            router.push('/');
        } catch (error) {
            throw error;
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-24 px-8 sm:px-12 lg:px-16">
            <div className="max-w-lg w-full space-y-10">
                <div>
                    <h2 className="mt-8 text-center text-4xl font-extrabold text-gray-900">
                        Đăng nhập
                    </h2>
                </div>

                <LoginForm onSubmit={handleLogin} />
            </div>
        </div>
    );
}
