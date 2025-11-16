import React, { useState, useEffect } from 'react';
import { PromptTemplate, TemplateVariable } from '../types';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';

interface TemplateCreatorFormProps {
    onSave: (template: Omit<PromptTemplate, 'createdAt'> & { id?: string }) => Promise<void>;
    onCancel: () => void;
    existingTemplate?: PromptTemplate | null;
}

const TemplateCreatorForm: React.FC<TemplateCreatorFormProps> = ({ onSave, onCancel, existingTemplate }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [basePrompt, setBasePrompt] = useState('');
    const [variables, setVariables] = useState<TemplateVariable[]>([]);

    useEffect(() => {
        if (existingTemplate) {
            setName(existingTemplate.name);
            setDescription(existingTemplate.description);
            setCategory(existingTemplate.category || '');
            setBasePrompt(existingTemplate.basePrompt);
            setVariables(existingTemplate.variables);
        } else {
            // Reset form for 'create new'
            setName('');
            setDescription('');
            setCategory('');
            setBasePrompt('');
            setVariables([]);
        }
    }, [existingTemplate]);

    const handleAddVariable = () => {
        setVariables([...variables, { key: '', label: '', placeholder: '', type: 'input' }]);
    };

    const handleRemoveVariable = (index: number) => {
        setVariables(variables.filter((_, i) => i !== index));
    };

    const handleVariableChange = (index: number, field: keyof TemplateVariable, value: string) => {
        const newVariables = [...variables];
        const variableToUpdate = { ...newVariables[index], [field]: value };
        
        if(field === 'key') {
           variableToUpdate.key = value.toUpperCase().replace(/[^A-Z0-9_]/g, '');
        }

        newVariables[index] = variableToUpdate;
        setVariables(newVariables);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !basePrompt) {
            alert('Template Name and Base Prompt are required.');
            return;
        }
        setIsSaving(true);
        try {
            await onSave({
                id: existingTemplate?.id, // Pass ID if editing
                name,
                description,
                category: category.trim(),
                basePrompt,
                variables,
            });
        } catch (error) {
            console.error("Failed to save template", error);
            alert("An error occurred while saving the template. Please try again.");
        } finally {
            // isSaving will be reset by the parent component re-rendering
        }
    };

    const commonInputClasses = "w-full bg-gray-900 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary";

    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-grow overflow-y-auto">
            <fieldset disabled={isSaving} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="templateName" className="block text-sm font-medium mb-1 text-gray-300">Template Name*</label>
                        <input id="templateName" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., My Awesome Blog Post" className={commonInputClasses} required />
                    </div>
                    <div>
                        <label htmlFor="templateCategory" className="block text-sm font-medium mb-1 text-gray-300">Category</label>
                        <input id="templateCategory" type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., Marketing, Development" className={commonInputClasses} />
                    </div>
                </div>
                <div>
                    <label htmlFor="templateDescription" className="block text-sm font-medium mb-1 text-gray-300">Description</label>
                    <input id="templateDescription" type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A short description of what this template does" className={commonInputClasses} />
                </div>
                <div>
                    <label htmlFor="basePrompt" className="block text-sm font-medium mb-1 text-gray-300">Base Prompt*</label>
                    <textarea id="basePrompt" value={basePrompt} onChange={(e) => setBasePrompt(e.target.value)} rows={6} placeholder="e.g., Write an article about [TOPIC] for an audience of [AUDIENCE]." className={commonInputClasses} required />
                    <p className="text-xs text-gray-400 mt-1">Use uppercase bracketed variables like [EXAMPLE] to mark placeholders.</p>
                </div>
                
                <div>
                    <h3 className="text-lg font-semibold mb-2">Variables</h3>
                    <div className="space-y-4">
                        {variables.map((variable, index) => (
                            <div key={index} className="bg-gray-900/50 p-4 rounded-md space-y-3 relative">
                            <button type="button" onClick={() => handleRemoveVariable(index)} className="absolute top-2 right-2 text-gray-500 hover:text-red-500">
                                <TrashIcon className="h-5 w-5" />
                            </button>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                        <label className="text-xs text-gray-400">Variable Key (e.g., TOPIC)</label>
                                        <input type="text" value={variable.key} onChange={(e) => handleVariableChange(index, 'key', e.target.value)} placeholder="TOPIC_NAME" className={commonInputClasses} required />
                                </div>
                                <div>
                                        <label className="text-xs text-gray-400">Input Type</label>
                                        <select value={variable.type} onChange={(e) => handleVariableChange(index, 'type', e.target.value)} className={commonInputClasses}>
                                            <option value="input">Single Line Input</option>
                                            <option value="textarea">Multi-line Text Area</option>
                                        </select>
                                </div>
                            </div>
                            <div>
                                    <label className="text-xs text-gray-400">Label</label>
                                    <input type="text" value={variable.label} onChange={(e) => handleVariableChange(index, 'label', e.target.value)} placeholder="Label for the input field" className={commonInputClasses} required />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400">Placeholder</label>
                                    <input type="text" value={variable.placeholder} onChange={(e) => handleVariableChange(index, 'placeholder', e.target.value)} placeholder="Example text for the input" className={commonInputClasses} />
                            </div>
                            </div>
                        ))}
                        <button type="button" onClick={handleAddVariable} className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-600 hover:bg-gray-700/50 text-gray-300 font-semibold py-2 px-4 rounded-lg transition-colors">
                            <PlusIcon className="h-5 w-5" />
                            Add Variable
                        </button>
                    </div>
                </div>
            </fieldset>
            
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onCancel} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSaving}>Cancel</button>
                <button type="submit" className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center w-40 disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSaving}>
                    {isSaving ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                        </>
                    ) : (
                        existingTemplate ? 'Save Changes' : 'Save Template'
                    )}
                </button>
            </div>
        </form>
    );
};

export default TemplateCreatorForm;
