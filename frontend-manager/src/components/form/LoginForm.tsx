import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface LoginFormProps {
    onSubmit: (email: string, password: string) => Promise<void>;
}

export const LoginForm = ({ onSubmit }: LoginFormProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await onSubmit(email, password);
        } catch (err) {
            setError('Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-lg p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                    <label htmlFor="email" className="block text-lg font-medium">
                        Email
                    </label>
                    <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        className="w-full text-lg"
                    />
                </div>

                <div className="space-y-3">
                    <label htmlFor="password" className="block text-lg font-medium">
                        Password
                    </label>
                    <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                        className="w-full text-lg"
                    />
                </div>

                {error && (
                    <div className="text-red-500 text-lg text-center">{error}</div>
                )}

                <Button
                    type="submit"
                    className="w-full py-3 text-lg"
                    disabled={isLoading}
                >
                    {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
            </form>
        </Card>
    );
};
