import React, { useMemo } from 'react';
import { PromptTemplate, PromptInputs } from '../types';
import { TONE_OPTIONS, STYLE_OPTIONS, FORMAT_OPTIONS } from '../constants';

interface PromptFormProps {
    defaultTemplates: PromptTemplate[];
    customTemplates: PromptTemplate[];
    selectedTemplate: PromptTemplate;
    onTemplateChange: (id: string) => void;
    inputs: PromptInputs;
    onInputChange: (field: keyof PromptInputs, value: string) => void;
    formErrors: Partial<Record<keyof PromptInputs, string>>;
}

const PromptForm: React.FC<PromptFormProps> = ({ defaultTemplates, customTemplates, selectedTemplate, onTemplateChange, inputs, onInputChange, formErrors }) => {
    const allTemplates = useMemo(() => [...defaultTemplates, ...customTemplates], [defaultTemplates, customTemplates]);

    const groupedTemplates = useMemo(() => {
        return allTemplates.reduce((acc, template) => {
            const category = template.category || 'General';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(template);
            return acc;
        }, {} as Record<string, PromptTemplate[]>);
    }, [allTemplates]);

    const sortedCategories = useMemo(() => Object.keys(groupedTemplates).sort((a, b) => {
        if (a === 'General') return 1;
        if (b === 'General') return -1;
        return a.localeCompare(b);
    }), [groupedTemplates]);

    return (
        <div className="space-y-6">
            <section className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                <h2 className="text-xl font-semibold mb-4 text-gray-100">1. Choose a Template</h2>
                <select
                    value={selectedTemplate.id}
                    onChange={(e) => onTemplateChange(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                >
                    {sortedCategories.map(category => (
                        <optgroup label={category} key={category}>
                            {groupedTemplates[category].map(template => (
                                <option key={template.id} value={template.id}>{template.name}</option>
                            ))}
                        </optgroup>
                    ))}
                </select>
                <p className="text-sm text-gray-400 mt-2">{selectedTemplate.description}</p>
            </section>

            <section className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 space-y-4">
                <h2 className="text-xl font-semibold mb-4 text-gray-100">2. Fill in Details</h2>
                {selectedTemplate.variables.map(variable => {
                    const hasError = !!formErrors[variable.key];
                    const commonClasses = `w-full bg-gray-800 border rounded-md p-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200 ${hasError ? 'border-red-500' : 'border-gray-600'}`;
                    return (
                        <div key={variable.key}>
                            <label htmlFor={variable.key} className="block text-sm font-medium mb-1 text-gray-300">{variable.label}*</label>
                            {variable.type === 'textarea' ? (
                                <textarea
                                    id={variable.key}
                                    value={inputs[variable.key] || ''}
                                    onChange={(e) => onInputChange(variable.key, e.target.value)}
                                    placeholder={variable.placeholder}
                                    rows={4}
                                    className={commonClasses}
                                    aria-invalid={hasError}
                                    aria-describedby={hasError ? `${variable.key}-error` : undefined}
                                />
                            ) : (
                                <input
                                    type="text"
                                    id={variable.key}
                                    value={inputs[variable.key] || ''}
                                    onChange={(e) => onInputChange(variable.key, e.target.value)}
                                    placeholder={variable.placeholder}
                                    className={commonClasses}
                                    aria-invalid={hasError}
                                    aria-describedby={hasError ? `${variable.key}-error` : undefined}
                                />
                            )}
                            {hasError && <p id={`${variable.key}-error`} className="text-red-500 text-xs mt-1">{formErrors[variable.key]}</p>}
                        </div>
                    );
                })}
            </section>

            <section className="bg-gray-800/50 p-6 rounded-lg border border-gray-700 space-y-4">
                <h2 className="text-xl font-semibold mb-4 text-gray-100">3. Refine the Output</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="persona" className="block text-sm font-medium mb-1 text-gray-300">AI Persona*</label>
                        <input type="text" id="persona" value={inputs.persona} onChange={(e) => onInputChange('persona', e.target.value)} 
                         className={`w-full bg-gray-800 border rounded-md p-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200 ${formErrors.persona ? 'border-red-500' : 'border-gray-600'}`}
                         aria-invalid={!!formErrors.persona}
                         aria-describedby={formErrors.persona ? `persona-error` : undefined}
                        />
                         {formErrors.persona && <p id="persona-error" className="text-red-500 text-xs mt-1">{formErrors.persona}</p>}
                    </div>
                     <div>
                        <label htmlFor="audience" className="block text-sm font-medium mb-1 text-gray-300">Target Audience</label>
                        <input type="text" id="audience" value={inputs.audience} onChange={(e) => onInputChange('audience', e.target.value)} placeholder="e.g., beginner developers" className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary" />
                    </div>
                    <div>
                        <label htmlFor="tone" className="block text-sm font-medium mb-1 text-gray-300">Tone</label>
                        <select id="tone" value={inputs.tone} onChange={(e) => onInputChange('tone', e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary">
                            {TONE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="style" className="block text-sm font-medium mb-1 text-gray-300">Style</label>
                        <select id="style" value={inputs.style} onChange={(e) => onInputChange('style', e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary">
                            {STYLE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="format" className="block text-sm font-medium mb-1 text-gray-300">Format</label>
                         <select id="format" value={inputs.format} onChange={(e) => onInputChange('format', e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary">
                            {FORMAT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="length" className="block text-sm font-medium mb-1 text-gray-300">Length*</label>
                        <input type="text" id="length" value={inputs.length} onChange={(e) => onInputChange('length', e.target.value)}
                         className={`w-full bg-gray-800 border rounded-md p-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary transition duration-200 ${formErrors.length ? 'border-red-500' : 'border-gray-600'}`}
                         aria-invalid={!!formErrors.length}
                         aria-describedby={formErrors.length ? `length-error` : undefined}
                        />
                        {formErrors.length && <p id="length-error" className="text-red-500 text-xs mt-1">{formErrors.length}</p>}
                    </div>
                </div>
                 <div>
                    <label htmlFor="context" className="block text-sm font-medium mb-1 text-gray-300">Context / Background Info</label>
                    <textarea id="context" value={inputs.context} onChange={(e) => onInputChange('context', e.target.value)} rows={5} placeholder="Provide any relevant background information here..." className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"></textarea>
                </div>
                <div>
                    <label htmlFor="negativeConstraints" className="block text-sm font-medium mb-1 text-gray-300">What to Avoid</label>
                    <textarea id="negativeConstraints" value={inputs.negativeConstraints} onChange={(e) => onInputChange('negativeConstraints', e.target.value)} rows={3} placeholder="e.g., using technical jargon, mentioning specific competitors" className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"></textarea>
                </div>
            </section>
        </div>
    );
};

export default PromptForm;