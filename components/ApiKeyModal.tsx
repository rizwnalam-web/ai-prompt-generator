import React, { useState, useEffect } from 'react';
import { ApiProviderConfig, ApiProviderType } from '../types';
import TrashIcon from './icons/TrashIcon';
import PlusIcon from './icons/PlusIcon';

interface ProviderManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (config: ApiProviderConfig) => void;
    onDelete: (configId: string) => void;
    configs: ApiProviderConfig[];
}

const PROVIDER_INFO: Record<ApiProviderType, { name: string, defaultModel: string, url: string }> = {
    gemini: { name: 'Google Gemini', defaultModel: 'gemini-2.5-flash', url: 'https://aistudio.google.com/app/apikey' },
    openai: { name: 'OpenAI', defaultModel: 'gpt-4-turbo', url: 'https://platform.openai.com/api-keys' },
    grok: { name: 'Grok', defaultModel: 'grok-1', url: 'https://x.ai/' },
    deepseek: { name: 'DeepSeek', defaultModel: 'deepseek-chat', url: 'https://platform.deepseek.com/api_keys' }
};

const ProviderForm: React.FC<{ onSave: (config: ApiProviderConfig) => void; onCancel: () => void; existingConfig?: ApiProviderConfig | null; }> = ({ onSave, onCancel, existingConfig }) => {
    const [config, setConfig] = useState<Omit<ApiProviderConfig, 'id'>>({
        name: '',
        provider: 'gemini',
        apiKey: '',
        model: PROVIDER_INFO.gemini.defaultModel,
    });

    useEffect(() => {
        if (existingConfig) {
            setConfig(existingConfig);
        }
    }, [existingConfig]);

    const handleProviderChange = (provider: ApiProviderType) => {
        setConfig(prev => ({
            ...prev,
            provider,
            model: PROVIDER_INFO[provider].defaultModel,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!config.name.trim() || !config.apiKey.trim() || !config.model.trim()) {
            alert('Please fill in all fields.');
            return;
        }
        onSave({
            ...config,
            id: existingConfig?.id || `config-${Date.now()}`
        });
    };

    const commonInputClasses = "w-full bg-gray-900 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary";
    const providerData = PROVIDER_INFO[config.provider];

    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-grow overflow-y-auto">
            <div>
                <label htmlFor="provider-type" className="block text-sm font-medium mb-1 text-gray-300">Provider</label>
                <select id="provider-type" value={config.provider} onChange={(e) => handleProviderChange(e.target.value as ApiProviderType)} className={commonInputClasses}>
                    {Object.entries(PROVIDER_INFO).map(([key, value]) => (
                        <option key={key} value={key}>{value.name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="config-name" className="block text-sm font-medium mb-1 text-gray-300">Configuration Name</label>
                <input id="config-name" type="text" value={config.name} onChange={e => setConfig(p => ({ ...p, name: e.target.value }))} placeholder="e.g., My Personal GPT-4 Key" className={commonInputClasses} />
            </div>
            <div>
                <label htmlFor="api-key" className="block text-sm font-medium mb-1 text-gray-300">API Key</label>
                <input id="api-key" type="password" value={config.apiKey} onChange={e => setConfig(p => ({ ...p, apiKey: e.target.value }))} placeholder={`Enter your ${providerData.name} API Key`} className={commonInputClasses} />
                 <p className="text-xs text-gray-500 mt-1">
                    Get your key from the{' '}
                    <a href={providerData.url} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">
                        {providerData.name} website
                    </a>.
                </p>
            </div>
            <div>
                <label htmlFor="model-name" className="block text-sm font-medium mb-1 text-gray-300">Model Name</label>
                <input id="model-name" type="text" value={config.model} onChange={e => setConfig(p => ({ ...p, model: e.target.value }))} placeholder="e.g., gpt-4-turbo" className={commonInputClasses} />
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg transition-colors">{existingConfig ? 'Save Changes' : 'Save Provider'}</button>
            </div>
        </form>
    );
};


const ApiKeyModal: React.FC<ProviderManagerModalProps> = ({ isOpen, onClose, onSave, onDelete, configs }) => {
    const [view, setView] = useState<'list' | 'form'>('list');
    const [editingConfig, setEditingConfig] = useState<ApiProviderConfig | null>(null);

    useEffect(() => {
        if (isOpen) {
           setView('list');
           setEditingConfig(null);
        }
    }, [isOpen]);

    const handleEdit = (config: ApiProviderConfig) => {
        setEditingConfig(config);
        setView('form');
    };

    const handleAddNew = () => {
        setEditingConfig(null);
        setView('form');
    };
    
    const handleSave = (config: ApiProviderConfig) => {
        onSave(config);
        setView('list');
        setEditingConfig(null);
    }
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-700">
                    <h2 className="text-2xl font-bold">{view === 'list' ? 'Manage API Providers' : editingConfig ? 'Edit Provider' : 'Add New Provider'}</h2>
                </div>

                {view === 'list' ? (
                    <div className="p-6 flex-grow overflow-y-auto space-y-4">
                        {configs.length > 0 ? configs.map(config => (
                            <div key={config.id} className="bg-gray-900/50 p-4 rounded-md flex justify-between items-center">
                               <div>
                                    <h3 className="font-semibold">{config.name} <span className="text-xs font-normal bg-gray-700 px-2 py-0.5 rounded-full">{PROVIDER_INFO[config.provider].name}</span></h3>
                                    <p className="text-sm text-gray-400">Model: {config.model}</p>
                               </div>
                               <div className="flex items-center gap-2">
                                   <button onClick={() => handleEdit(config)} className="text-gray-400 hover:text-brand-primary p-2 rounded-full transition-colors text-sm font-medium">Edit</button>
                                   <button onClick={() => onDelete(config.id)} className="text-gray-400 hover:text-red-500 p-2 rounded-full transition-colors">
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                               </div>
                            </div>
                        )) : (
                            <p className="text-gray-500 text-center py-8">You haven't configured any API providers yet.</p>
                        )}
                         <button onClick={handleAddNew} className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-600 hover:bg-gray-700/50 text-gray-300 font-semibold py-2 px-4 rounded-lg transition-colors">
                            <PlusIcon className="h-5 w-5" />
                            Add New Provider
                        </button>
                    </div>
                ) : (
                   <ProviderForm onSave={handleSave} onCancel={() => setView('list')} existingConfig={editingConfig} />
                )}
                
                <div className="p-4 border-t border-gray-700 text-right">
                    <button onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">Close</button>
                </div>
            </div>
        </div>
    );
};

export default ApiKeyModal;
