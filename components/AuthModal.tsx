import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: 'login' | 'register';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
    const [mode, setMode] = useState(initialMode);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { login, register } = useAuth();

    useEffect(() => {
        if (isOpen) {
            setMode(initialMode);
            setError(null);
            setEmail('');
            setPassword('');
        }
    }, [isOpen, initialMode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (mode === 'login') {
                await login(email, password);
            } else {
                await register(email, password);
            }
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const commonInputClasses = "w-full bg-gray-900 border border-gray-600 rounded-md p-3 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <div className="flex border-b border-gray-700">
                    <button
                        onClick={() => setMode('login')}
                        className={`flex-1 p-4 text-center font-semibold transition-colors ${mode === 'login' ? 'bg-gray-700/50 text-brand-primary' : 'text-gray-400 hover:bg-gray-700/20'}`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => setMode('register')}
                        className={`flex-1 p-4 text-center font-semibold transition-colors ${mode === 'register' ? 'bg-gray-700/50 text-brand-primary' : 'text-gray-400 hover:bg-gray-700/20'}`}
                    >
                        Sign Up
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <fieldset disabled={isLoading}>
                        <div>
                            <label htmlFor="auth-email" className="block text-sm font-medium mb-1 text-gray-300">Email Address</label>
                            <input
                                id="auth-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className={commonInputClasses}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="auth-password"className="block text-sm font-medium mb-1 text-gray-300">Password</label>
                            <input
                                id="auth-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className={commonInputClasses}
                                required
                                minLength={6}
                            />
                        </div>

                        {error && <p className="text-red-400 text-center text-sm">{error}</p>}

                        <button
                            type="submit"
                            className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Processing...
                                </>
                            ) : (
                                mode === 'login' ? 'Login' : 'Create Account'
                            )}
                        </button>
                    </fieldset>
                    <p className="text-xs text-gray-500 text-center">
                        {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
                        <button
                            type="button"
                            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                            className="font-semibold text-brand-primary hover:underline ml-1"
                        >
                            {mode === 'login' ? 'Sign up' : 'Login'}
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default AuthModal;
