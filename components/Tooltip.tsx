import React from 'react';
import QuestionMarkCircleIcon from './icons/QuestionMarkCircleIcon';

interface TooltipProps {
    text: string;
}

const Tooltip: React.FC<TooltipProps> = ({ text }) => {
    return (
        <div className="relative inline-flex items-center group ml-1.5" tabIndex={0} role="tooltip">
            <QuestionMarkCircleIcon className="h-4 w-4 text-gray-500 cursor-help" />
            <div 
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus:opacity-100 group-focus:visible transition-opacity duration-300 pointer-events-none z-10 border border-gray-700"
                aria-hidden="true"
            >
                {text}
                <svg className="absolute text-gray-900 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255">
                    <polygon className="fill-current" points="0,0 127.5,127.5 255,0"/>
                </svg>
            </div>
        </div>
    );
};

export default Tooltip;
