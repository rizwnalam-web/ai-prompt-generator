import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PromptTemplate, PromptInputs, ApiProviderConfig } from './types';
import { PROMPT_TEMPLATES, TONE_OPTIONS, STYLE_OPTIONS, FORMAT_OPTIONS } from './constants';
import { generateResponse, generateSpeech, generateVideo } from './services/llmService';
import { getCustomTemplates, saveCustomTemplates } from './services/templateService';
import { getConfigs, saveConfigs } from './services/apiConfigService';
import Header from './components/Header';
import PromptForm from './components/PromptForm';
import GeneratedPrompt from './components/GeneratedPrompt';
import AiResponse from './components/AiResponse';
import ManageTemplatesModal from './components/ManageTemplatesModal';
import ApiKeyModal from './components/ApiKeyModal';
import { assemblePrompt } from './utils/promptUtils';

const App: React.FC = () => {
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>(PROMPT_TEMPLATES[0].id);
    const [inputs, setInputs] = useState<PromptInputs>({
        persona: 'a helpful assistant',
        audience: '',
        tone: TONE_OPTIONS[0],
        style: STYLE_OPTIONS[0],
        format: FORMAT_OPTIONS[0],
        length: 'about 2-3 paragraphs',
        context: '',
        negativeConstraints: '',
    });
    const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
    const [aiResponse, setAiResponse] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Multimodal state
    const [audioData, setAudioData] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isGeneratingAudio, setIsGeneratingAudio] = useState<boolean>(false);
    const [isGeneratingVideo, setIsGeneratingVideo] = useState<boolean>(false);
    const [videoGenerationStatus, setVideoGenerationStatus] = useState<string>('');

    const [customTemplates, setCustomTemplates] = useState<PromptTemplate[]>([]);
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    
    const [apiConfigs, setApiConfigs] = useState<ApiProviderConfig[]>([]);
    const [activeConfigId, setActiveConfigId] = useState<string | null>(null);
    const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);

    useEffect(() => {
        setCustomTemplates(getCustomTemplates());
        const existingConfigs = getConfigs();
        setApiConfigs(existingConfigs);
        if (existingConfigs.length > 0) {
            setActiveConfigId(localStorage.getItem('activeConfigId') || existingConfigs[0].id);
        } else {
            setIsProviderModalOpen(true); // Open modal on first visit if no providers configured
        }
    }, []);

    const activeConfig = useMemo(() => {
        return apiConfigs.find(c => c.id === activeConfigId) || null;
    }, [apiConfigs, activeConfigId]);

    const handleSetActiveConfig = (id: string) => {
        setActiveConfigId(id);
        localStorage.setItem('activeConfigId', id);
    }

    const allTemplates = useMemo(() => [...PROMPT_TEMPLATES, ...customTemplates], [customTemplates]);

    const selectedTemplate = useMemo(() => {
        return allTemplates.find(t => t.id === selectedTemplateId) || PROMPT_TEMPLATES[0];
    }, [selectedTemplateId, allTemplates]);

    useEffect(() => {
        const newPrompt = assemblePrompt(inputs, selectedTemplate);
        setGeneratedPrompt(newPrompt);
    }, [inputs, selectedTemplate]);

    const handleInputChange = useCallback((field: keyof PromptInputs, value: string) => {
        setInputs(prev => ({ ...prev, [field]: value }));
    }, []);

    const handleGenerate = async () => {
        if (!activeConfig) {
            setError("No active API provider selected.");
            setIsProviderModalOpen(true);
            return;
        }
        setIsLoading(true);
        setError(null);
        setAiResponse('');
        setAudioData(null);
        setVideoUrl(null);
        setVideoGenerationStatus('');

        try {
            const response = await generateResponse(generatedPrompt, activeConfig);
            setAiResponse(response);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
            if (errorMessage.toLowerCase().includes('api key') || errorMessage.toLowerCase().includes('authentication')) {
                setIsProviderModalOpen(true);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateAudio = async () => {
        if (!aiResponse || !activeConfig) return;
        setIsGeneratingAudio(true);
        setError(null);
        try {
            const audioB64 = await generateSpeech(aiResponse, activeConfig);
            setAudioData(audioB64);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate audio.');
        } finally {
            setIsGeneratingAudio(false);
        }
    };

    const handleGenerateVideo = async () => {
        if (!aiResponse || !activeConfig) return;

        if (!window.aistudio || typeof window.aistudio.hasSelectedApiKey !== 'function') {
            setError("Video generation is not available in this environment.");
            return;
        }
        
        try {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            if (!hasKey) {
                await window.aistudio.openSelectKey();
            }
        
            setIsGeneratingVideo(true);
            setVideoGenerationStatus('Starting...');
            setError(null);
            setVideoUrl(null);

            const url = await generateVideo(aiResponse, activeConfig, setVideoGenerationStatus);
            setVideoUrl(url);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to generate video.';
            setError(errorMessage);
            if (errorMessage.includes("Requested entity was not found")) {
                await window.aistudio.openSelectKey();
            }
        } finally {
            setIsGeneratingVideo(false);
        }
    };
    
    useEffect(() => {
      const initialInputs: PromptInputs = {
        persona: 'a helpful assistant',
        audience: '',
        tone: TONE_OPTIONS[0],
        style: STYLE_OPTIONS[0],
        format: FORMAT_OPTIONS[0],
        length: 'about 2-3 paragraphs',
        context: '',
        negativeConstraints: '',
      };
      
      selectedTemplate.variables.forEach(v => {
        initialInputs[v.key] = '';
      });
      setInputs(initialInputs);

    }, [selectedTemplate]);

    const handleSaveTemplate = (newTemplateData: Omit<PromptTemplate, 'id' | 'createdAt'>) => {
        const newTemplate: PromptTemplate = {
            ...newTemplateData,
            id: `custom-${Date.now()}`,
            createdAt: Date.now(),
        };
        const updatedTemplates = [...customTemplates, newTemplate];
        setCustomTemplates(updatedTemplates);
        saveCustomTemplates(updatedTemplates);
    };

    const handleDeleteTemplate = (templateId: string) => {
        if (window.confirm('Are you sure you want to delete this template?')) {
            const updatedTemplates = customTemplates.filter(t => t.id !== templateId);
            setCustomTemplates(updatedTemplates);
            saveCustomTemplates(updatedTemplates);
            if (selectedTemplateId === templateId) {
                setSelectedTemplateId(PROMPT_TEMPLATES[0].id);
            }
        }
    };
    
    const handleSaveApiConfig = (config: ApiProviderConfig) => {
        const existingIndex = apiConfigs.findIndex(c => c.id === config.id);
        let updatedConfigs;
        if (existingIndex > -1) {
            updatedConfigs = [...apiConfigs];
            updatedConfigs[existingIndex] = config;
        } else {
            updatedConfigs = [...apiConfigs, config];
        }
        setApiConfigs(updatedConfigs);
        saveConfigs(updatedConfigs);
        if (!activeConfigId || existingIndex === -1) {
            handleSetActiveConfig(config.id);
        }
    };

    const handleDeleteApiConfig = (configId: string) => {
        const updatedConfigs = apiConfigs.filter(c => c.id !== configId);
        setApiConfigs(updatedConfigs);
        saveConfigs(updatedConfigs);
        if (activeConfigId === configId) {
            const newActiveId = updatedConfigs.length > 0 ? updatedConfigs[0].id : null;
            setActiveConfigId(newActiveId);
            if (newActiveId) {
                localStorage.setItem('activeConfigId', newActiveId);
            } else {
                localStorage.removeItem('activeConfigId');
            }
        }
    };


    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
            <Header
                onManageTemplatesClick={() => setIsManageModalOpen(true)}
                onProviderSettingsClick={() => setIsProviderModalOpen(true)}
                apiConfigs={apiConfigs}
                activeConfigId={activeConfigId}
                onActiveConfigChange={handleSetActiveConfig}
            />
            <main className="container mx-auto p-4 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8">
                    {/* Left Column: Form */}
                    <div className="flex flex-col gap-6">
                        <PromptForm
                            defaultTemplates={PROMPT_TEMPLATES}
                            customTemplates={customTemplates}
                            selectedTemplate={selectedTemplate}
                            onTemplateChange={setSelectedTemplateId}
                            inputs={inputs}
                            onInputChange={handleInputChange}
                        />
                    </div>

                    {/* Right Column: Output */}
                    <div className="flex flex-col gap-6 mt-8 lg:mt-0">
                        <GeneratedPrompt
                            prompt={generatedPrompt}
                            onGenerate={handleGenerate}
                            isLoading={isLoading}
                            activeConfig={activeConfig}
                            onConfigureProvider={() => setIsProviderModalOpen(true)}
                        />
                        <AiResponse 
                            response={aiResponse} 
                            isLoading={isLoading} 
                            error={error}
                            isStoryTemplate={selectedTemplate.id === 'story-generator'}
                            onGenerateAudio={handleGenerateAudio}
                            onGenerateVideo={handleGenerateVideo}
                            audioData={audioData}
                            videoUrl={videoUrl}
                            isGeneratingAudio={isGeneratingAudio}
                            isGeneratingVideo={isGeneratingVideo}
                            videoGenerationStatus={videoGenerationStatus}
                        />
                    </div>
                </div>
            </main>
            <ManageTemplatesModal
                isOpen={isManageModalOpen}
                onClose={() => setIsManageModalOpen(false)}
                templates={customTemplates}
                onSave={handleSaveTemplate}
                onDelete={handleDeleteTemplate}
            />
            <ApiKeyModal
                isOpen={isProviderModalOpen}
                onClose={() => setIsProviderModalOpen(false)}
                onSave={handleSaveApiConfig}
                onDelete={handleDeleteApiConfig}
                configs={apiConfigs}
            />
        </div>
    );
};

export default App;
