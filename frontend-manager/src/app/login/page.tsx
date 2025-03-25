'use client';

import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/form/LoginForm';
import { loginUser } from '@/services/api/user';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();

    const handleLogin = async (email: string, password: string) => {
        try {
            const response = await loginUser(email, password);
            console.log("Response:", response);

            await login(response.token.accessToken, response.token.refreshToken, response.userId);

            router.push('/');
        } catch (error) {
            console.error("Login failed:", error);
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
