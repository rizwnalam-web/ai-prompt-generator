import React, { useState } from 'react';
import { playAudio } from '../utils/audioUtils';
import SpeakerWaveIcon from './icons/SpeakerWaveIcon';
import VideoCameraIcon from './icons/VideoCameraIcon';
import PlayIcon from './icons/PlayIcon';

interface AiResponseProps {
    response: string;
    isLoading: boolean;
    error: string | null;
    isStoryTemplate: boolean;
    onGenerateAudio: () => void;
    onGenerateVideo: () => void;
    audioData: string | null;
    videoUrl: string | null;
    isGeneratingAudio: boolean;
    isGeneratingVideo: boolean;
    videoGenerationStatus: string;
}

const AiResponse: React.FC<AiResponseProps> = ({
    response,
    isLoading,
    error,
    isStoryTemplate,
    onGenerateAudio,
    onGenerateVideo,
    audioData,
    videoUrl,
    isGeneratingAudio,
    isGeneratingVideo,
    videoGenerationStatus
}) => {
    const [isPlaying, setIsPlaying] = useState(false);

    const handlePlayAudio = async () => {
        if (!audioData) return;
        setIsPlaying(true);
        try {
            await playAudio(audioData);
        } catch (e) {
            console.error("Error playing audio", e);
        } finally {
            setIsPlaying(false);
        }
    };

    const commonButtonClasses = "flex items-center justify-center gap-2 font-bold py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm";
    const primaryButtonClasses = `bg-brand-primary hover:bg-brand-secondary text-white ${commonButtonClasses}`;
    const secondaryButtonClasses = `bg-gray-600 hover:bg-gray-500 text-white ${commonButtonClasses}`;

    return (
        <section className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 flex flex-col h-full min-h-[200px]">
            <h2 className="text-xl font-semibold mb-4 text-gray-100">AI Response</h2>
            <div className="bg-gray-900/50 p-4 rounded-md flex-grow overflow-auto">
                {isLoading && (
                    <div className="flex items-center justify-center h-full">
                         <div className="flex items-center gap-2 text-gray-400">
                             <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Thinking...</span>
                        </div>
                    </div>
                )}
                {error && !isGeneratingVideo && (
                    <div className="text-red-400">
                        <p className="font-bold">An error occurred:</p>
                        <p>{error}</p>
                    </div>
                )}
                {!isLoading && !error && !response && (
                     <div className="flex items-center justify-center h-full text-gray-500">
                        The AI's response will appear here.
                    </div>
                )}
                {response && (
                    <pre className="whitespace-pre-wrap text-gray-300 text-sm">{response}</pre>
                )}
            </div>

             {isStoryTemplate && response && !isLoading && (
                <div className="mt-4 pt-4 border-t border-gray-700 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-200">Creative Suite</h3>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 space-y-2">
                             <button
                                onClick={onGenerateAudio}
                                disabled={isGeneratingAudio || !!audioData}
                                className={primaryButtonClasses}
                            >
                                <SpeakerWaveIcon className="h-5 w-5" />
                                {isGeneratingAudio ? 'Generating Voice...' : audioData ? 'Voice Generated' : 'Generate Narration'}
                            </button>
                             {audioData && !isGeneratingAudio && (
                                <button onClick={handlePlayAudio} disabled={isPlaying} className={secondaryButtonClasses}>
                                    <PlayIcon className="h-5 w-5" />
                                    {isPlaying ? 'Playing...' : 'Play Narration'}
                                </button>
                            )}
                        </div>
                         <div className="flex-1 space-y-2">
                             <button
                                onClick={onGenerateVideo}
                                disabled={isGeneratingVideo || !!videoUrl || !audioData}
                                title={!audioData ? "Generate voice first" : "Generate video"}
                                className={`${primaryButtonClasses} ${!audioData ? 'bg-gray-600 hover:bg-gray-600 cursor-not-allowed' : ''}`}
                            >
                                <VideoCameraIcon className="h-5 w-5" />
                                {isGeneratingVideo ? 'Generating Video...' : videoUrl ? 'Video Generated' : 'Generate Video'}
                            </button>
                         </div>
                    </div>

                    {isGeneratingVideo && (
                        <div className="text-sm text-amber-400 p-2 bg-amber-900/50 rounded-md">
                            <p className="font-semibold">Video Generation Status:</p>
                            <p>{videoGenerationStatus}</p>
                        </div>
                    )}
                     {error && isGeneratingVideo && (
                        <div className="text-red-400">
                            <p className="font-bold">An error occurred:</p>
                            <p>{error}</p>
                        </div>
                    )}
                    {videoUrl && (
                        <div className="aspect-video bg-black rounded-lg mt-2 overflow-hidden">
                            <video src={videoUrl} controls className="w-full h-full"></video>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};

export default AiResponse;
