import React, { useState, useRef, useEffect } from 'react';
import SparklesIcon from './icons/SparklesIcon';
import BookOpenIcon from './icons/BookOpenIcon';
import CogIcon from './icons/CogIcon';
import { ApiProviderConfig } from '../types';
import QuestionMarkCircleIcon from './icons/QuestionMarkCircleIcon';
import { useAuth } from '../context/AuthContext';
import UserCircleIcon from './icons/UserCircleIcon';
import LogoutIcon from './icons/LogoutIcon';

interface HeaderProps {
    onManageTemplatesClick: () => void;
    onProviderSettingsClick: () => void;
    onStartTour: () => void;
    apiConfigs: ApiProviderConfig[];
    activeConfigId: string | null;
    onActiveConfigChange: (id: string) => void;
    onLogin: () => void;
    onSignUp: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
    onManageTemplatesClick, 
    onProviderSettingsClick,
    onStartTour,
    apiConfigs,
    activeConfigId,
    onActiveConfigChange,
    onLogin,
    onSignUp,
}) => {
    const { currentUser, logout } = useAuth();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const UserMenu = () => (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-2 bg-gray-700 hover:bg-gray-600 rounded-full text-sm font-medium transition-colors"
            >
                <UserCircleIcon className="h-6 w-6" />
            </button>
            {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-md shadow-lg border border-gray-700 z-20">
                    <div className="p-3 border-b border-gray-700">
                        <p className="text-sm text-gray-400">Signed in as</p>
                        <p className="font-medium truncate">{currentUser?.email}</p>
                    </div>
                    <button
                        onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
                    >
                        <LogoutIcon className="h-5 w-5" />
                        Logout
                    </button>
                </div>
            )}
        </div>
    );

    const AuthButtons = () => (
        <>
            <button
                onClick={onLogin}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm font-medium transition-colors"
            >
                Login
            </button>
            <button
                onClick={onSignUp}
                className="px-4 py-2 bg-brand-primary hover:bg-brand-secondary rounded-md text-sm font-medium transition-colors"
            >
                Sign Up
            </button>
        </>
    );

    return (
        <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
            <div className="container mx-auto px-4 lg:px-8 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <SparklesIcon className="h-8 w-8 text-brand-primary" />
                    <h1 className="text-2xl font-bold text-gray-100 tracking-tight">
                        AI Prompt Generator
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2">
                        <label htmlFor="provider-select" className="text-sm font-medium text-gray-400">Provider:</label>
                        <select
                            id="provider-select"
                            value={activeConfigId || ''}
                            onChange={(e) => onActiveConfigChange(e.target.value)}
                            disabled={apiConfigs.length === 0}
                            className="bg-gray-700 border border-gray-600 rounded-md py-2 pl-3 pr-8 text-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary disabled:opacity-50"
                        >
                            {apiConfigs.length === 0 && <option>No providers configured</option>}
                            {apiConfigs.map(config => (
                                <option key={config.id} value={config.id}>{config.name}</option>
                            ))}
                        </select>
                    </div>
                     <button
                        onClick={onManageTemplatesClick}
                        className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm font-medium transition-colors"
                    >
                        <BookOpenIcon className="h-5 w-5" />
                        Templates
                    </button>
                    <button
                        onClick={onProviderSettingsClick}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm font-medium transition-colors"
                        aria-label="Configure API Providers"
                    >
                        <CogIcon className="h-5 w-5" />
                        <span className="hidden sm:inline">Settings</span>
                    </button>
                    <button
                        onClick={onStartTour}
                        className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full text-sm font-medium transition-colors"
                        aria-label="Start Tour"
                        title="Help / Start Tour"
                    >
                        <QuestionMarkCircleIcon className="h-5 w-5" />
                    </button>
                    <div className="h-6 w-px bg-gray-700"></div>
                    {currentUser ? <UserMenu /> : <AuthButtons />}
                </div>
            </div>
        </header>
    );
};

export default Header;
