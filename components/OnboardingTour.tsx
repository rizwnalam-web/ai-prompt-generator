import React, { useState, useEffect, useLayoutEffect } from 'react';

interface OnboardingTourProps {
    isOpen: boolean;
    onClose: () => void;
}

const tourSteps = [
    {
        title: "Welcome to the AI Prompt Generator!",
        content: "Let's take a quick tour to show you how to create powerful AI prompts in just a few steps.",
        targetSelector: null, // For a centered welcome message
    },
    {
        title: "1. Choose a Template",
        content: "Start by selecting a template. Each one is a pre-built prompt designed for a specific task, like writing a blog post or generating code.",
        targetSelector: '[data-tour-id="template-selection"]',
    },
    {
        title: "2. Fill in the Details",
        content: "Next, provide the specific information for your chosen template. The more context you give the AI, the better the result will be!",
        targetSelector: '[data-tour-id="details-form"]',
    },
    {
        title: "3. Refine the Output",
        content: "Here you can fine-tune the AI's persona, tone, style, and format. This gives you granular control over the final response.",
        targetSelector: '[data-tour-id="refine-form"]',
    },
    {
        title: "4. Generate Your Response",
        content: "Your complete prompt is automatically assembled here. When you're ready, click the 'Generate' button to send it to the AI and see the magic happen!",
        targetSelector: '[data-tour-id="generated-prompt"]',
    },
     {
        title: "You're All Set!",
        content: "That's it! You're ready to start creating. You can restart this tour anytime by clicking the help icon in the header.",
        targetSelector: null,
    },
];

const OnboardingTour: React.FC<OnboardingTourProps> = ({ isOpen, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    const step = tourSteps[currentStep];

    useLayoutEffect(() => {
        if (isOpen && step.targetSelector) {
            const element = document.querySelector(step.targetSelector);
            if (element) {
                setTargetRect(element.getBoundingClientRect());
            }
        } else {
            setTargetRect(null);
        }
    }, [currentStep, isOpen, step.targetSelector]);

    useEffect(() => {
        const handleResize = () => {
             if (isOpen && step.targetSelector) {
                const element = document.querySelector(step.targetSelector);
                if (element) {
                    setTargetRect(element.getBoundingClientRect());
                }
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [currentStep, isOpen, step.targetSelector]);

    if (!isOpen) {
        return null;
    }
    
    const handleNext = () => {
        if (currentStep < tourSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onClose();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };
    
    const handleClose = () => {
        setCurrentStep(0);
        onClose();
    };
    
    const isFirstStep = currentStep === 0;
    const isLastStep = currentStep === tourSteps.length - 1;

    const tooltipStyle: React.CSSProperties = targetRect ? {
        top: targetRect.bottom + 10,
        left: targetRect.left,
        maxWidth: 320,
        position: 'fixed',
    } : {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        position: 'fixed',
    };
    
    // Adjust tooltip if it overflows the viewport
    if (targetRect) {
        const viewportWidth = window.innerWidth;
        if (targetRect.left + 320 > viewportWidth) {
            tooltipStyle.left = undefined;
            tooltipStyle.right = 16;
        }
        if (targetRect.bottom + 200 > window.innerHeight) {
            tooltipStyle.top = undefined;
            tooltipStyle.bottom = window.innerHeight - targetRect.top + 10;
        }
    }


    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm" onClick={handleClose}></div>
            
            {/* Highlight Box */}
            {targetRect && (
                <div
                    className="absolute border-2 border-brand-primary rounded-lg shadow-2xl transition-all duration-300 pointer-events-none"
                    style={{
                        width: targetRect.width + 8,
                        height: targetRect.height + 8,
                        top: targetRect.top - 4,
                        left: targetRect.left - 4,
                    }}
                ></div>
            )}
            
            {/* Tooltip */}
            <div
                className="bg-gray-800 text-white p-5 rounded-lg shadow-xl border border-gray-700 z-50 transition-all duration-300"
                style={tooltipStyle}
                role="dialog"
                aria-labelledby="tour-title"
                aria-describedby="tour-content"
            >
                <h3 id="tour-title" className="text-lg font-bold mb-2 text-brand-primary">{step.title}</h3>
                <p id="tour-content" className="text-sm text-gray-300 mb-4">{step.content}</p>
                <div className="flex justify-between items-center">
                    <button onClick={handleClose} className="text-xs text-gray-400 hover:underline">Skip Tour</button>
                    <div className="flex items-center gap-2">
                         {!isFirstStep && (
                             <button
                                onClick={handlePrev}
                                className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-1 px-3 rounded-md text-sm transition-colors"
                            >
                                Previous
                            </button>
                         )}
                        <button
                            onClick={handleNext}
                            className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-1 px-3 rounded-md text-sm transition-colors"
                        >
                            {isLastStep ? "Finish" : "Next"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingTour;
