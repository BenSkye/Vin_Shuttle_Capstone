import AuthLayout from '@/components/layouts/AuthLayout';

export default function AuthLayoutPage({ children }: { children: React.ReactNode }) {
    return <AuthLayout>{children}</AuthLayout>;
}
