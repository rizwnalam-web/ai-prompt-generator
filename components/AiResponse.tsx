
import React, { useState, useEffect } from 'react';
import { playAudio, createWavBlob } from '../utils/audioUtils';
import SpeakerWaveIcon from './icons/SpeakerWaveIcon';
import VideoCameraIcon from './icons/VideoCameraIcon';
import PlayIcon from './icons/PlayIcon';
import StopIcon from './icons/StopIcon';
import DownloadIcon from './icons/DownloadIcon';
import { ApiProviderConfig } from '../types';
import TwitterIcon from './icons/TwitterIcon';
import LinkedInIcon from './icons/LinkedInIcon';
import ClipboardIcon from './icons/ClipboardIcon';
import FacebookIcon from './icons/FacebookIcon';
import ThreadsIcon from './icons/ThreadsIcon';
import ThumbUpIcon from './icons/ThumbUpIcon';
import ThumbDownIcon from './icons/ThumbDownIcon';
import PhotoIcon from './icons/PhotoIcon';

interface AiResponseProps {
    response: string;
    isLoading: boolean;
    error: string | null;
    isStoryTemplate: boolean;
    onGenerateAudio: () => void;
    onGenerateImage: (model: string, aspectRatio: string) => void;
    onGenerateVideo: (aspectRatio: string, resolution: string, model: string) => void;
    onStopGeneration: () => void;
    audioData: string | null;
    imageUrl: string | null;
    videoUrl: string | null;
    isGeneratingAudio: boolean;
    isGeneratingImage: boolean;
    isGeneratingVideo: boolean;
    videoGenerationStatus: string;
    activeConfig: ApiProviderConfig | null;
    feedback: 'up' | 'down' | null;
    onFeedback: (feedback: 'up' | 'down') => void;
}

const AiResponse: React.FC<AiResponseProps> = ({
    response,
    isLoading,
    error,
    isStoryTemplate,
    onGenerateAudio,
    onGenerateImage,
    onGenerateVideo,
    onStopGeneration,
    audioData,
    imageUrl,
    videoUrl,
    isGeneratingAudio,
    isGeneratingImage,
    isGeneratingVideo,
    videoGenerationStatus,
    activeConfig,
    feedback,
    onFeedback,
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [socialsCopied, setSocialsCopied] = useState(false);
    const [aspectRatio, setAspectRatio] = useState('16:9');
    const [resolution, setResolution] = useState('720p');
    const [videoModel, setVideoModel] = useState('veo-3.1-fast-generate-preview');
    const [imageModel, setImageModel] = useState('imagen-4.0-generate-001');
    const [imageAspectRatio, setImageAspectRatio] = useState('16:9');
    const [videoProgress, setVideoProgress] = useState(0);

    useEffect(() => {
        if (!isGeneratingVideo) {
            if (!videoUrl) {
                setVideoProgress(0);
            }
            return;
        }

        switch (videoGenerationStatus) {
            case 'Starting...':
                setVideoProgress(10);
                break;
            case 'Initializing video generation...':
                setVideoProgress(25);
                break;
            case 'Generation in progress... This may take a few minutes.':
                setVideoProgress(50);
                break;
            case 'Checking progress...':
                setVideoProgress(75);
                break;
            case 'Fetching video...':
                setVideoProgress(90);
                break;
            case 'Video ready!':
                setVideoProgress(100);
                break;
            default:
                 if (videoProgress < 20) setVideoProgress(20);
                break;
        }
    }, [videoGenerationStatus, isGeneratingVideo, videoUrl]);

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

    const handleDownloadAudio = () => {
        if (!audioData) return;
        try {
            const wavBlob = createWavBlob(audioData);
            const url = URL.createObjectURL(wavBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'narration.wav';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error("Failed to create WAV for download", e);
        }
    };
    
    const handleShare = (platform: 'twitter' | 'linkedin' | 'threads' | 'facebook') => {
        const text = encodeURIComponent(response);
        let url = '';
        if (platform === 'twitter') {
            url = `https://twitter.com/intent/tweet?text=${text}`;
        } else if (platform === 'linkedin') {
            url = `https://www.linkedin.com/feed/?shareActive=true&text=${text}`;
        } else if (platform === 'threads') {
            url = `https://www.threads.net/intent/post?text=${text}`;
        } else if (platform === 'facebook') {
            const currentUrl = encodeURIComponent(window.location.href);
            url = `https://www.facebook.com/sharer/sharer.php?u=${currentUrl}&quote=${text}`;
        }

        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    const handleCopyToSocials = () => {
        if (!response) return;
        navigator.clipboard.writeText(response);
        setSocialsCopied(true);
        setTimeout(() => setSocialsCopied(false), 2000);
    };

    const commonButtonClasses = "flex items-center justify-center gap-2 font-bold py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm";
    const primaryButtonClasses = `bg-brand-primary hover:bg-brand-secondary text-white ${commonButtonClasses}`;
    const secondaryButtonClasses = `bg-gray-600 hover:bg-gray-500 text-white ${commonButtonClasses}`;
    const iconButtonClasses = "bg-gray-600 hover:bg-gray-500 text-white flex items-center justify-center font-bold p-2.5 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

    const canGenerateAudio = !!response && !isLoading && activeConfig?.provider === 'gemini';
    const canShare = !!response && !isLoading && !error;

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
                {error && !isGeneratingVideo && !isGeneratingImage && (
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

            {(canShare || canGenerateAudio) && (
                 <div className="mt-4 pt-4 border-t border-gray-700 space-y-4">
                     {canShare && (
                         <div className="flex justify-between items-start gap-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-200 mb-3">Share</h3>
                                <div className="flex flex-wrap items-center gap-3">
                                    <button
                                        onClick={() => handleShare('twitter')}
                                        className={iconButtonClasses}
                                        aria-label="Share on X"
                                        title="Share on X"
                                    >
                                        <TwitterIcon className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => handleShare('linkedin')}
                                        className={iconButtonClasses}
                                        aria-label="Share on LinkedIn"
                                        title="Share on LinkedIn"
                                    >
                                        <LinkedInIcon className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => handleShare('threads')}
                                        className={iconButtonClasses}
                                        aria-label="Share on Threads"
                                        title="Share on Threads"
                                    >
                                        <ThreadsIcon className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => handleShare('facebook')}
                                        className={iconButtonClasses}
                                        aria-label="Share on Facebook"
                                        title="Share on Facebook"
                                    >
                                        <FacebookIcon className="h-5 w-5" />
                                    </button>
                                    <div className="h-6 w-px bg-gray-600"></div>
                                    <button
                                        onClick={handleCopyToSocials}
                                        className={secondaryButtonClasses}
                                        aria-label={socialsCopied ? 'Content copied' : 'Copy text content'}
                                    >
                                        <ClipboardIcon className="h-5 w-5" />
                                        <span>{socialsCopied ? 'Copied!' : 'Copy Text'}</span>
                                    </button>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-200 mb-3">Feedback</h3>
                                 <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => onFeedback('up')}
                                        className={`p-2 rounded-full transition-colors ${feedback === 'up' ? 'bg-green-500/20 text-green-400' : 'bg-gray-600 hover:bg-gray-500 text-gray-300'}`}
                                        aria-label="Good response"
                                        title="Good response"
                                    >
                                        <ThumbUpIcon className="h-5 w-5" />
                                    </button>
                                     <button
                                        onClick={() => onFeedback('down')}
                                        className={`p-2 rounded-full transition-colors ${feedback === 'down' ? 'bg-red-500/20 text-red-400' : 'bg-gray-600 hover:bg-gray-500 text-gray-300'}`}
                                        aria-label="Bad response"
                                        title="Bad response"
                                    >
                                        <ThumbDownIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                         </div>
                    )}
                    {canGenerateAudio && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-200">
                                Creative Tools
                            </h3>
                            
                            <div className="flex flex-col gap-4 mt-3">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {/* Audio Section */}
                                    <div className="bg-gray-900/30 p-3 rounded-lg border border-gray-700/50">
                                        <span className="text-xs text-gray-400 font-medium uppercase mb-2 block">Audio</span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={onGenerateAudio}
                                                disabled={isGeneratingAudio || !!audioData}
                                                className={`${primaryButtonClasses} flex-1`}
                                            >
                                                <SpeakerWaveIcon className="h-5 w-5" />
                                                {isGeneratingAudio ? 'Generating...' : audioData ? 'Voice Ready' : 'Generate Narration'}
                                            </button>
                                            {isGeneratingAudio && (
                                                <button onClick={onStopGeneration} aria-label="Stop generating audio" title="Stop Generation" className={secondaryButtonClasses}>
                                                    <StopIcon className="h-5 w-5" />
                                                </button>
                                            )}
                                        </div>
                                        {audioData && !isGeneratingAudio && (
                                            <div className="flex items-center gap-2 mt-2">
                                                <button onClick={handlePlayAudio} disabled={isPlaying} aria-label={isPlaying ? 'Playing audio' : 'Play audio'} className={`${secondaryButtonClasses} w-full`}>
                                                    <PlayIcon className="h-5 w-5" />
                                                    {isPlaying ? 'Playing...' : 'Play'}
                                                </button>
                                                <button onClick={handleDownloadAudio} aria-label="Download audio" title="Download Audio" className={secondaryButtonClasses}>
                                                    <DownloadIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Image Section */}
                                    <div className="bg-gray-900/30 p-3 rounded-lg border border-gray-700/50">
                                        <span className="text-xs text-gray-400 font-medium uppercase mb-2 block">Image</span>
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            <div>
                                                <label htmlFor="imageModel" className="text-xs text-gray-500">Model</label>
                                                <select 
                                                    id="imageModel"
                                                    value={imageModel} 
                                                    onChange={(e) => setImageModel(e.target.value)}
                                                    disabled={isGeneratingImage}
                                                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-1 text-xs focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
                                                >
                                                    <option value="imagen-4.0-generate-001">Imagen 4 (High Quality)</option>
                                                    <option value="imagen-3.0-generate-001">Imagen 3 (Balanced)</option>
                                                    <option value="imagen-3.0-fast-generate-001">Imagen 3 Fast</option>
                                                    <option value="gemini-2.5-flash-image">Gemini Flash Image (Fast)</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor="imageAspectRatio" className="text-xs text-gray-500">Aspect Ratio</label>
                                                <select 
                                                    id="imageAspectRatio"
                                                    value={imageAspectRatio} 
                                                    onChange={(e) => setImageAspectRatio(e.target.value)}
                                                    disabled={isGeneratingImage}
                                                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-1 text-xs focus:ring-1 focus:ring-brand-primary focus:border-brand-primary"
                                                >
                                                    <option value="1:1">1:1 (Square)</option>
                                                    <option value="16:9">16:9 (Landscape)</option>
                                                    <option value="9:16">9:16 (Portrait)</option>
                                                    <option value="4:3">4:3 (Standard)</option>
                                                    <option value="3:4">3:4 (Portrait Standard)</option>
                                                </select>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => onGenerateImage(imageModel, imageAspectRatio)}
                                            disabled={isGeneratingImage || !!imageUrl}
                                            className={`${primaryButtonClasses} w-full`}
                                        >
                                            <PhotoIcon className="h-5 w-5" />
                                            {isGeneratingImage ? 'Generating...' : imageUrl ? 'Image Ready' : 'Generate Image'}
                                        </button>
                                        {imageUrl && !isGeneratingImage && (
                                            <div className="mt-4 space-y-2">
                                                 <div className="rounded-lg overflow-hidden border border-gray-700">
                                                     <img src={imageUrl} alt="Generated content" className="w-full h-auto object-cover max-h-64" />
                                                 </div>
                                                 <a href={imageUrl} download="generated-image.jpg" aria-label="Download generated image" className={`${primaryButtonClasses} w-full`}>
                                                    <DownloadIcon className="h-5 w-5" />
                                                    Download Image
                                                 </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Video Section - Available for all, with updated controls */}
                                <div className="bg-gray-900/30 p-3 rounded-lg border border-gray-700/50">
                                    <span className="text-xs text-gray-400 font-medium uppercase mb-2 block">Video (Veo)</span>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                                        <div>
                                            <label htmlFor="aspectRatio" className="text-xs text-gray-500">Aspect Ratio</label>
                                            <select id="aspectRatio" value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} disabled={isGeneratingVideo} className="w-full bg-gray-700 border border-gray-600 rounded-md p-1 text-xs focus:ring-1 focus:ring-brand-primary focus:border-brand-primary">
                                                <option value="16:9">16:9 (Landscape)</option>
                                                <option value="9:16">9:16 (Portrait)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="resolution" className="text-xs text-gray-500">Resolution</label>
                                            <select id="resolution" value={resolution} onChange={(e) => setResolution(e.target.value)} disabled={isGeneratingVideo} className="w-full bg-gray-700 border border-gray-600 rounded-md p-1 text-xs focus:ring-1 focus:ring-brand-primary focus:border-brand-primary">
                                                <option value="720p">720p</option>
                                                <option value="1080p">1080p</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="videoModel" className="text-xs text-gray-500">Quality / Model</label>
                                            <select id="videoModel" value={videoModel} onChange={(e) => setVideoModel(e.target.value)} disabled={isGeneratingVideo} className="w-full bg-gray-700 border border-gray-600 rounded-md p-1 text-xs focus:ring-1 focus:ring-brand-primary focus:border-brand-primary">
                                                <option value="veo-3.1-fast-generate-preview">Veo Fast (Preview)</option>
                                                <option value="veo-3.1-generate-preview">Veo High Quality</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => onGenerateVideo(aspectRatio, resolution, videoModel)}
                                            disabled={isGeneratingVideo || !!videoUrl}
                                            className={`${primaryButtonClasses} flex-1`}
                                        >
                                            <VideoCameraIcon className="h-5 w-5" />
                                            {isGeneratingVideo ? 'Generating...' : videoUrl ? 'Video Generated' : 'Generate Video'}
                                        </button>
                                        {isGeneratingVideo && (
                                            <button onClick={onStopGeneration} aria-label="Stop generating video" title="Stop Generation" className={secondaryButtonClasses}>
                                                <StopIcon className="h-5 w-5" />
                                            </button>
                                        )}
                                    </div>
                                        <p className="text-xs text-gray-500 text-center pt-1">
                                        Video generation requires API key selection.
                                        <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-400 ml-1">
                                            See billing info
                                        </a>.
                                    </p>
                                    
                                    {isGeneratingVideo && (
                                        <div className="mt-4">
                                            <div className="flex justify-between mb-1">
                                                <span className="text-sm font-medium text-amber-400">Video Generation</span>
                                                <span className="text-sm font-medium text-amber-400">{videoProgress}%</span>
                                            </div>
                                            <div className="w-full bg-amber-900/50 rounded-full h-2.5">
                                                <div className="bg-amber-500 h-2.5 rounded-full" style={{ width: `${videoProgress}%`, transition: 'width 0.5s ease-in-out' }}></div>
                                            </div>
                                            <p className="text-xs text-center text-amber-300 mt-2">{videoGenerationStatus}</p>
                                        </div>
                                    )}
                                    {error && isGeneratingVideo && (
                                        <div className="text-red-400 mt-4">
                                            <p className="font-bold">An error occurred during video generation:</p>
                                            <p>{error}</p>
                                        </div>
                                    )}
                                    {videoUrl && !isGeneratingVideo && (
                                        <div className="mt-4 space-y-2">
                                            <div className="aspect-video bg-black rounded-lg overflow-hidden border border-gray-700">
                                                <video src={videoUrl} controls className="w-full h-full"></video>
                                            </div>
                                                <a href={videoUrl} download="story-video.mp4" aria-label="Download generated video" className={`${primaryButtonClasses} w-full`}>
                                                <DownloadIcon className="h-5 w-5" />
                                                Download Video
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                 </div>
            )}
        </section>
    );
};

export default AiResponse;
