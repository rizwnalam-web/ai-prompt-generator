import React, { useState, useEffect } from 'react';
import { ApiProviderConfig, ApiProviderType } from '../types';
import TrashIcon from './icons/TrashIcon';
import PlusIcon from './icons/PlusIcon';
import WarningIcon from './icons/WarningIcon';
import { useAuth } from '../context/AuthContext';

interface ProviderManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (config: ApiProviderConfig) => void;
    onDelete: (configId: string) => void;
    configs: ApiProviderConfig[];
    apiKeyError?: { configId: string; message: string } | null;
    onRequiresAuth: () => void;
}

const PROVIDER_INFO: Record<ApiProviderType, { name: string, defaultModel: string, url: string }> = {
    gemini: { name: 'Google Gemini', defaultModel: 'gemini-2.5-flash', url: 'https://aistudio.google.com/app/apikey' },
    openai: { name: 'OpenAI', defaultModel: 'gpt-4-turbo', url: 'https://platform.openai.com/api-keys' },
    grok: { name: 'Grok', defaultModel: 'grok-1', url: 'https://x.ai/' },
    deepseek: { name: 'DeepSeek', defaultModel: 'deepseek-chat', url: 'https://platform.deepseek.com/api_keys' }
};

const validateApiKey = (key: string, provider: ApiProviderType): string | null => {
    if (!key.trim()) {
        return "API Key is required.";
    }

    const patterns: Partial<Record<ApiProviderType, { regex: RegExp, message: string }>> = {
        gemini: {
            regex: /^AIzaSy[A-Za-z0-9_-]{33}$/,
            message: 'Invalid Gemini API key format. It should start with "AIzaSy" and be 39 characters long.'
        },
        openai: {
            regex: /^sk-(proj-)?[A-Za-z0-9]{40,}$/,
            message: 'Invalid OpenAI API key format. It should start with "sk-" and be at least 43 characters long.'
        },
        deepseek: {
             regex: /^sk-[a-zA-Z0-9]{32,}$/,
             message: 'Invalid DeepSeek API key format. It should start with "sk-".'
        }
    };

    const validation = patterns[provider];
    if (validation && !validation.regex.test(key)) {
        return validation.message;
    }

    if (!validation && (key.length < 20 || /\s/.test(key))) {
        return "API key seems too short or contains whitespace.";
    }

    return null;
};

const ProviderForm: React.FC<{ 
    onSave: (config: ApiProviderConfig) => void; 
    onCancel: () => void; 
    existingConfig?: ApiProviderConfig | null;
    initialApiError?: string | null;
}> = ({ onSave, onCancel, existingConfig, initialApiError }) => {
    const [name, setName] = useState('');
    const [provider, setProvider] = useState<ApiProviderType>('gemini');
    const [model, setModel] = useState(PROVIDER_INFO.gemini.defaultModel);
    const [apiKey, setApiKey] = useState('');
    const [apiKeyError, setApiKeyError] = useState<string | null>(null);

    useEffect(() => {
        if (existingConfig) {
            setName(existingConfig.name);
            setProvider(existingConfig.provider);
            setModel(existingConfig.model);
            setApiKey(existingConfig.apiKey);
        } else {
            setName('');
            setProvider('gemini');
            setModel(PROVIDER_INFO.gemini.defaultModel);
            setApiKey('');
        }
        setApiKeyError(initialApiError || null);
    }, [existingConfig, initialApiError]);

    const handleProviderChange = (newProvider: ApiProviderType) => {
        setProvider(newProvider);
        setModel(PROVIDER_INFO[newProvider].defaultModel);
        setApiKeyError(null);
    };

    const handleApiKeyChange = (value: string) => {
        setApiKey(value);
        if (apiKeyError) {
            setApiKeyError(null);
        }
    }

    const handleApiKeyBlur = () => {
        const validationError = validateApiKey(apiKey, provider);
        setApiKeyError(validationError);
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validationError = validateApiKey(apiKey, provider);
        if (validationError) {
            setApiKeyError(validationError);
            return;
        }

        if (!name.trim() || !model.trim()) {
            alert('Please fill in Configuration Name and Model Name.');
            return;
        }
        onSave({
            id: existingConfig?.id || `config-${Date.now()}`,
            name,
            provider,
            apiKey,
            model,
        });
    };

    const commonInputClasses = "w-full bg-gray-900 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary";
    const providerData = PROVIDER_INFO[provider];

    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-grow overflow-y-auto">
            <div>
                <label htmlFor="provider-type" className="block text-sm font-medium mb-1 text-gray-300">Provider</label>
                <select id="provider-type" value={provider} onChange={(e) => handleProviderChange(e.target.value as ApiProviderType)} className={commonInputClasses}>
                    {Object.entries(PROVIDER_INFO).map(([key, value]) => (
                        <option key={key} value={key}>{value.name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label htmlFor="config-name" className="block text-sm font-medium mb-1 text-gray-300">Configuration Name</label>
                <input id="config-name" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., My Personal GPT-4 Key" className={commonInputClasses} required />
            </div>
            <div>
                <label htmlFor="api-key" className="block text-sm font-medium mb-1 text-gray-300">API Key</label>
                <input 
                    id="api-key" 
                    type="password" 
                    value={apiKey} 
                    onChange={e => handleApiKeyChange(e.target.value)}
                    onBlur={handleApiKeyBlur}
                    placeholder={`Enter your ${providerData.name} API Key`} 
                    className={`${commonInputClasses} ${apiKeyError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`} 
                    required 
                />
                {apiKeyError && <p className="text-red-400 text-xs mt-1">{apiKeyError}</p>}
                 <p className="text-xs text-gray-500 mt-1">
                    Get your key from the{' '}
                    <a href={providerData.url} target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">
                        {providerData.name} website
                    </a>.
                </p>
            </div>
            <div>
                <label htmlFor="model-name" className="block text-sm font-medium mb-1 text-gray-300">Model Name</label>
                <input id="model-name" type="text" value={model} onChange={e => setModel(e.target.value)} placeholder="e.g., gpt-4-turbo" className={commonInputClasses} required />
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg transition-colors">{existingConfig ? 'Save Changes' : 'Save Provider'}</button>
            </div>
        </form>
    );
};


const ApiKeyModal: React.FC<ProviderManagerModalProps> = ({ isOpen, onClose, onSave, onDelete, configs, apiKeyError, onRequiresAuth }) => {
    const { currentUser } = useAuth();
    const [view, setView] = useState<'list' | 'form'>('list');
    const [editingConfig, setEditingConfig] = useState<ApiProviderConfig | null>(null);

    useEffect(() => {
        if (isOpen) {
            // If there's an error, jump to editing that config
           if (apiKeyError) {
               const configToEdit = configs.find(c => c.id === apiKeyError.configId);
               if (configToEdit) {
                   handleEdit(configToEdit);
                   return;
               }
           }
           setView('list');
           setEditingConfig(null);
        }
    }, [isOpen, apiKeyError, configs]);

    const handleEdit = (config: ApiProviderConfig) => {
        setEditingConfig(config);
        setView('form');
    };

    const handleAddNew = () => {
        if (!currentUser) {
            onRequiresAuth();
        } else {
            setEditingConfig(null);
            setView('form');
        }
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
                            <div key={config.id} className="bg-gray-900/50 p-4 rounded-md">
                               <div className="flex justify-between items-center">
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
                               {apiKeyError && apiKeyError.configId === config.id && (
                                    <div className="mt-2 p-2 bg-red-900/50 border border-red-700 rounded-md flex items-start gap-2 text-red-300 text-sm">
                                        <WarningIcon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                        <span>{apiKeyError.message}</span>
                                    </div>
                                )}
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
                   <ProviderForm 
                        onSave={handleSave} 
                        onCancel={() => setView('list')} 
                        existingConfig={editingConfig}
                        initialApiError={
                            apiKeyError && editingConfig && apiKeyError.configId === editingConfig.id 
                                ? apiKeyError.message 
                                : null
                        }
                    />
                )}
                
                <div className="p-4 border-t border-gray-700 text-right">
                    <button onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">Close</button>
                </div>
            </div>
        </div>
    );
};

export default ApiKeyModal;
