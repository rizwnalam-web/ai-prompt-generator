import React, { useState } from 'react';
import ClipboardIcon from './icons/ClipboardIcon';
import SparklesIcon from './icons/SparklesIcon';
import CogIcon from './icons/CogIcon';
import { ApiProviderConfig } from '../types';

interface GeneratedPromptProps {
    prompt: string;
    onGenerate: () => void;
    isLoading: boolean;
    activeConfig: ApiProviderConfig | null;
    onConfigureProvider: () => void;
}

const GeneratedPrompt: React.FC<GeneratedPromptProps> = ({ prompt, onGenerate, isLoading, activeConfig, onConfigureProvider }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const getProviderDisplayName = (provider: string) => {
        const names: Record<string, string> = {
            gemini: 'Gemini',
            openai: 'OpenAI',
            grok: 'Grok',
            deepseek: 'DeepSeek',
        };
        return names[provider] || 'AI';
    };

    const GenerateButtonContent = () => {
        if (!activeConfig) {
            return (
                <>
                    <CogIcon className="h-5 w-5" />
                    Configure Provider to Generate
                </>
            );
        }
        if (isLoading) {
            return (
                <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                </>
            );
        }
        return (
            <>
                <SparklesIcon className="h-5 w-5" />
                Generate with {getProviderDisplayName(activeConfig.provider)}
            </>
        );
    };

    return (
        <section className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-100">Generated Prompt</h2>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md text-sm transition-colors"
                >
                    <ClipboardIcon className="h-4 w-4" />
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <pre className="whitespace-pre-wrap text-gray-300 text-sm bg-gray-900/50 p-4 rounded-md flex-grow overflow-auto h-64 lg:h-auto">
                {prompt}
            </pre>
            <button
                onClick={activeConfig ? onGenerate : onConfigureProvider}
                disabled={!!activeConfig && isLoading}
                className={`w-full mt-4 flex items-center justify-center gap-2 font-bold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${!activeConfig ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-brand-primary hover:bg-brand-secondary text-white'}`}
            >
                <GenerateButtonContent />
            </button>
        </section>
    );
};

export default GeneratedPrompt;
