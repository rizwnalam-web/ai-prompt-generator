import React from 'react';
import SparklesIcon from './icons/SparklesIcon';
import BookOpenIcon from './icons/BookOpenIcon';
import CogIcon from './icons/CogIcon';
import { ApiProviderConfig } from '../types';

interface HeaderProps {
    onManageTemplatesClick: () => void;
    onProviderSettingsClick: () => void;
    apiConfigs: ApiProviderConfig[];
    activeConfigId: string | null;
    onActiveConfigChange: (id: string) => void;
}

const Header: React.FC<HeaderProps> = ({ 
    onManageTemplatesClick, 
    onProviderSettingsClick,
    apiConfigs,
    activeConfigId,
    onActiveConfigChange
}) => {
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
                    <div className="flex items-center gap-2">
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
                </div>
            </div>
        </header>
    );
};

export default Header;
