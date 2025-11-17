import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PromptTemplate, PromptInputs, ApiProviderConfig } from './types';
import { PROMPT_TEMPLATES, TONE_OPTIONS, STYLE_OPTIONS, FORMAT_OPTIONS } from './constants';
import { generateResponse, generateSpeech, generateVideo } from './services/llmService';
import { getCustomTemplates, saveCustomTemplates, getGuestTemplates, saveGuestTemplates, clearGuestTemplates } from './services/templateService';
import { getConfigs, saveConfigs, getGuestConfigs, saveGuestConfigs, clearGuestConfigs } from './services/apiConfigService';
import { hasCompletedTour, markTourAsCompleted, resetTour } from './services/onboardingService';
import Header from './components/Header';
import PromptForm from './components/PromptForm';
import GeneratedPrompt from './components/GeneratedPrompt';
import AiResponse from './components/AiResponse';
import ManageTemplatesModal from './components/ManageTemplatesModal';
import ApiKeyModal from './components/ApiKeyModal';
import OnboardingTour from './components/OnboardingTour';
import { assemblePrompt } from './utils/promptUtils';
import { useAuth } from './context/AuthContext';
import AuthModal from './components/AuthModal';

const App: React.FC = () => {
    const { currentUser } = useAuth();
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
    const [formErrors, setFormErrors] = useState<Partial<Record<keyof PromptInputs, string>>>({});
    const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);


    // Multimodal state
    const [audioData, setAudioData] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [isGeneratingAudio, setIsGeneratingAudio] = useState<boolean>(false);
    const [isGeneratingVideo, setIsGeneratingVideo] = useState<boolean>(false);
    const [videoGenerationStatus, setVideoGenerationStatus] = useState<string>('');
    const [generationAbortController, setGenerationAbortController] = useState<AbortController | null>(null);


    const [customTemplates, setCustomTemplates] = useState<PromptTemplate[]>([]);
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    
    const [apiConfigs, setApiConfigs] = useState<ApiProviderConfig[]>([]);
    const [activeConfigId, setActiveConfigId] = useState<string | null>(null);
    const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
    const [apiKeyError, setApiKeyError] = useState<{ configId: string; message: string } | null>(null);
    const [isTourOpen, setIsTourOpen] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

    const handleOpenAuthModal = (mode: 'login' | 'register') => {
        setAuthModalMode(mode);
        setIsAuthModalOpen(true);
    };


    useEffect(() => {
        if (!hasCompletedTour()) {
            setIsTourOpen(true);
        }

        // Load data based on user session
        let loadedCustomTemplates: PromptTemplate[] = [];
        let existingConfigs: ApiProviderConfig[] = [];

        if (currentUser) {
            loadedCustomTemplates = getCustomTemplates(currentUser.id);
            existingConfigs = getConfigs(currentUser.id);
        } else {
             // For guests, you might want to load from a guest-specific key or show nothing
            loadedCustomTemplates = getGuestTemplates();
            existingConfigs = getGuestConfigs();
        }
        
        setCustomTemplates(loadedCustomTemplates);
        setApiConfigs(existingConfigs);
        
        const activeId = localStorage.getItem(currentUser ? `activeConfigId_${currentUser.id}` : 'activeConfigId_guest');
        if (existingConfigs.length > 0) {
            setActiveConfigId(activeId || existingConfigs[0].id);
        } else if (!currentUser) {
            // Only open for guests if they have no configs.
            // Logged-in users can choose to have no configs.
            // setIsProviderModalOpen(true); 
        }


        // Handle shared URL
        const urlParams = new URLSearchParams(window.location.search);
        const shareData = urlParams.get('share');
        if (shareData) {
            try {
                const allCurrentTemplates = [...PROMPT_TEMPLATES, ...loadedCustomTemplates];
                const decodedString = atob(shareData);
                const { selectedTemplateId: sharedTemplateId, inputs: sharedInputs } = JSON.parse(decodedString);
                
                const templateExists = allCurrentTemplates.some(t => t.id === sharedTemplateId);
                if (templateExists && sharedInputs) {
                    setSelectedTemplateId(sharedTemplateId);
                    setInputs(sharedInputs);
                } else {
                   console.warn("Shared prompt data contained an invalid template ID or was malformed.");
                }
            } catch (e) {
                console.error("Failed to parse share data from URL", e);
            } finally {
                // Clean the URL to avoid re-applying on refresh
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        }
    }, [currentUser]);

    const activeConfig = useMemo(() => {
        return apiConfigs.find(c => c.id === activeConfigId) || null;
    }, [apiConfigs, activeConfigId]);

    const handleSetActiveConfig = (id: string) => {
        setActiveConfigId(id);
        const key = currentUser ? `activeConfigId_${currentUser.id}` : 'activeConfigId_guest';
        localStorage.setItem(key, id);
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
        if (formErrors[field]) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    }, [formErrors]);

    const handleSharePrompt = useCallback(() => {
        const stateToShare = {
            selectedTemplateId,
            inputs,
        };
        try {
            const jsonString = JSON.stringify(stateToShare);
            const base64String = btoa(jsonString);
            const shareUrl = `${window.location.origin}${window.location.pathname}?share=${base64String}`;
            navigator.clipboard.writeText(shareUrl);
            // Feedback is handled locally in the component that calls this
        } catch (e) {
            console.error("Failed to create share link", e);
            setError("Could not create a shareable link.");
        }
    }, [selectedTemplateId, inputs]);

    const handleGenerate = async () => {
        // --- Form Validation ---
        const errors: Partial<Record<keyof PromptInputs, string>> = {};
        selectedTemplate.variables.forEach(variable => {
            if (!inputs[variable.key] || inputs[variable.key].trim() === '') {
                errors[variable.key] = `${variable.label} is required.`;
            }
        });
        if (!inputs.persona.trim()) errors.persona = 'AI Persona is required.';
        if (!inputs.length.trim()) errors.length = 'Length is required.';

        setFormErrors(errors);
        if (Object.keys(errors).length > 0) {
            return; // Stop if there are validation errors
        }

        if (!activeConfig) {
            setError("No active API provider selected.");
            if (!currentUser) {
                handleOpenAuthModal('login');
            } else {
                 setIsProviderModalOpen(true);
            }
            return;
        }

        // Clear previous API error before a new attempt
        if (apiKeyError) setApiKeyError(null);

        setIsLoading(true);
        setError(null);
        setAiResponse('');
        setAudioData(null);
        setVideoUrl(null);
        setVideoGenerationStatus('');
        setFeedback(null); // Reset feedback for new response

        try {
            const response = await generateResponse(generatedPrompt, activeConfig);
            setAiResponse(response);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            setError(errorMessage);
            if ((errorMessage.toLowerCase().includes('api key') || errorMessage.toLowerCase().includes('authentication')) && activeConfig) {
                 setApiKeyError({
                    configId: activeConfig.id,
                    message: 'Authentication failed. Please check if your API key is correct, valid, and has the necessary permissions.'
                });
                setIsProviderModalOpen(true);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateAudio = async () => {
        if (!aiResponse || !activeConfig) return;

        const controller = new AbortController();
        setGenerationAbortController(controller);
        setIsGeneratingAudio(true);
        setError(null);

        try {
            const audioB64 = await generateSpeech(aiResponse, activeConfig, controller.signal);
            setAudioData(audioB64);
        } catch (err) {
            if ((err as Error).name !== 'AbortError') {
                 setError(err instanceof Error ? err.message : 'Failed to generate audio.');
            }
        } finally {
            setIsGeneratingAudio(false);
            setGenerationAbortController(null);
        }
    };

    const handleGenerateVideo = async (aspectRatio: string, resolution: string) => {
        if (!aiResponse || !activeConfig) return;

        if (!window.aistudio || typeof window.aistudio.hasSelectedApiKey !== 'function') {
            setError("Video generation is not available in this environment.");
            return;
        }
        
        const controller = new AbortController();
        setGenerationAbortController(controller);

        try {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            if (!hasKey) {
                await window.aistudio.openSelectKey();
            }
        
            setIsGeneratingVideo(true);
            setVideoGenerationStatus('Starting...');
            setError(null);
            setVideoUrl(null);

            const url = await generateVideo(aiResponse, activeConfig, setVideoGenerationStatus, controller.signal, aspectRatio, resolution);
            setVideoUrl(url);
        } catch (err) {
             if ((err as Error).name !== 'AbortError') {
                const errorMessage = err instanceof Error ? err.message : 'Failed to generate video.';
                setError(errorMessage);
                if (errorMessage.includes("Requested entity was not found") || errorMessage.includes("API Key is invalid or not found")) {
                    await window.aistudio.openSelectKey();
                }
            } else {
                setVideoGenerationStatus("Generation cancelled by user.");
            }
        } finally {
            setIsGeneratingVideo(false);
            setGenerationAbortController(null);
        }
    };

    const handleStopGeneration = () => {
        generationAbortController?.abort();
        // Reset states immediately for UI responsiveness
        if (isGeneratingAudio) {
            setIsGeneratingAudio(false);
        }
        if (isGeneratingVideo) {
            setIsGeneratingVideo(false);
            setVideoGenerationStatus('Stopping generation...');
        }
    };

    const handleFeedback = (newFeedback: 'up' | 'down') => {
        const finalFeedback = feedback === newFeedback ? null : newFeedback;
        setFeedback(finalFeedback);
        // In a real app, you would send this to a logging service or backend
        if (finalFeedback) {
            console.log(`Feedback submitted: ${finalFeedback.toUpperCase()}`);
            console.log("Response:", aiResponse);
            console.log("Prompt:", generatedPrompt);
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
      setFormErrors({}); // Clear errors when template changes

    }, [selectedTemplate]);

    const handleSaveTemplate = (templateData: Omit<PromptTemplate, 'createdAt'> & { id?: string }): Promise<void> => {
        return new Promise(resolve => {
            setTimeout(() => {
                let updatedTemplates;
                if (templateData.id) {
                    // Update existing template
                    updatedTemplates = customTemplates.map(t =>
                        t.id === templateData.id ? { ...t, ...templateData } : t
                    );
                } else {
                    // Create new template
                    const newTemplate: PromptTemplate = {
                        ...templateData,
                        id: `custom-${Date.now()}`,
                        createdAt: Date.now(),
                    };
                    updatedTemplates = [...customTemplates, newTemplate];
                }
                setCustomTemplates(updatedTemplates);
                if (currentUser) {
                    saveCustomTemplates(updatedTemplates, currentUser.id);
                } else {
                    saveGuestTemplates(updatedTemplates);
                }
                resolve();
            }, 500);
        });
    };

    const handleDeleteTemplate = (templateId: string) => {
        if (window.confirm('Are you sure you want to delete this template?')) {
            const updatedTemplates = customTemplates.filter(t => t.id !== templateId);
            setCustomTemplates(updatedTemplates);
             if (currentUser) {
                saveCustomTemplates(updatedTemplates, currentUser.id);
            } else {
                saveGuestTemplates(updatedTemplates);
            }
            if (selectedTemplateId === templateId) {
                setSelectedTemplateId(PROMPT_TEMPLATES[0].id);
            }
        }
    };
    
     const handleImportTemplates = (importedTemplates: Omit<PromptTemplate, 'id'|'createdAt'>[]) => {
        try {
            if (!currentUser) {
                handleOpenAuthModal('login');
                alert("Please log in to import templates.");
                return;
            }

            const newTemplates: PromptTemplate[] = importedTemplates.map(t => ({
                ...t,
                id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                createdAt: Date.now(),
                category: t.category || 'Imported'
            }));

            const updatedTemplates = [...customTemplates, ...newTemplates];
            setCustomTemplates(updatedTemplates);
            saveCustomTemplates(updatedTemplates, currentUser.id);

        } catch(e) {
            console.error("Error processing imported templates", e);
            setError("There was an error processing the imported templates.");
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
        if (currentUser) {
            saveConfigs(updatedConfigs, currentUser.id);
        } else {
            saveGuestConfigs(updatedConfigs);
        }
        if (!activeConfigId || existingIndex === -1) {
            handleSetActiveConfig(config.id);
        }
    };

    const handleDeleteApiConfig = (configId: string) => {
        const updatedConfigs = apiConfigs.filter(c => c.id !== configId);
        setApiConfigs(updatedConfigs);
        if (currentUser) {
            saveConfigs(updatedConfigs, currentUser.id);
        } else {
            saveGuestConfigs(updatedConfigs);
        }
        if (activeConfigId === configId) {
            const newActiveId = updatedConfigs.length > 0 ? updatedConfigs[0].id : null;
            setActiveConfigId(newActiveId);
            const key = currentUser ? `activeConfigId_${currentUser.id}` : 'activeConfigId_guest';
            if (newActiveId) {
                localStorage.setItem(key, newActiveId);
            } else {
                localStorage.removeItem(key);
            }
        }
    };

    const handleStartTour = () => {
        resetTour();
        setIsTourOpen(true);
    };

    const handleCloseTour = () => {
        markTourAsCompleted();
        setIsTourOpen(false);
    };


    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
            <Header
                onManageTemplatesClick={() => setIsManageModalOpen(true)}
                onProviderSettingsClick={() => setIsProviderModalOpen(true)}
                onStartTour={handleStartTour}
                apiConfigs={apiConfigs}
                activeConfigId={activeConfigId}
                onActiveConfigChange={handleSetActiveConfig}
                onLogin={() => handleOpenAuthModal('login')}
                onSignUp={() => handleOpenAuthModal('register')}
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
                            formErrors={formErrors}
                        />
                    </div>

                    {/* Right Column: Output */}
                    <div className="flex flex-col gap-6 mt-8 lg:mt-0">
                        <GeneratedPrompt
                            prompt={generatedPrompt}
                            onGenerate={handleGenerate}
                            isLoading={isLoading}
                            activeConfig={activeConfig}
                            onConfigureProvider={() => {
                                if (!currentUser) handleOpenAuthModal('login');
                                else setIsProviderModalOpen(true);
                            }}
                            onShare={handleSharePrompt}
                        />
                        <AiResponse 
                            response={aiResponse} 
                            isLoading={isLoading} 
                            error={error}
                            isStoryTemplate={selectedTemplate.id === 'story-generator'}
                            onGenerateAudio={handleGenerateAudio}
                            onGenerateVideo={handleGenerateVideo}
                            onStopGeneration={handleStopGeneration}
                            audioData={audioData}
                            videoUrl={videoUrl}
                            isGeneratingAudio={isGeneratingAudio}
                            isGeneratingVideo={isGeneratingVideo}
                            videoGenerationStatus={videoGenerationStatus}
                            activeConfig={activeConfig}
                            feedback={feedback}
                            onFeedback={handleFeedback}
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
                onImport={handleImportTemplates}
                onRequiresAuth={() => handleOpenAuthModal('login')}
            />
            <ApiKeyModal
                isOpen={isProviderModalOpen}
                onClose={() => {
                    setIsProviderModalOpen(false);
                    setApiKeyError(null);
                }}
                onSave={handleSaveApiConfig}
                onDelete={handleDeleteApiConfig}
                configs={apiConfigs}
                apiKeyError={apiKeyError}
                onRequiresAuth={() => handleOpenAuthModal('login')}
            />
            <OnboardingTour isOpen={isTourOpen} onClose={handleCloseTour} />
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                initialMode={authModalMode}
            />
        </div>
    );
};

export default App;
