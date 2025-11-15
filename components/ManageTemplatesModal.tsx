import React, { useState, useMemo, useEffect } from 'react';
import { PromptTemplate } from '../types';
import TemplateCreatorForm from './TemplateCreatorForm';
import TrashIcon from './icons/TrashIcon';
import ArrowUpIcon from './icons/ArrowUpIcon';
import ArrowDownIcon from './icons/ArrowDownIcon';

interface ManageTemplatesModalProps {
    isOpen: boolean;
    onClose: () => void;
    templates: PromptTemplate[];
    onSave: (template: Omit<PromptTemplate, 'id' | 'createdAt'>) => void;
    onDelete: (templateId: string) => void;
}

const ManageTemplatesModal: React.FC<ManageTemplatesModalProps> = ({ isOpen, onClose, templates, onSave, onDelete }) => {
    const [view, setView] = useState<'list' | 'create'>('list');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'category' | 'name' | 'date'>('category');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    useEffect(() => {
        // Default to newest first for date sort, otherwise A-Z
        if (sortBy === 'date') {
            setSortOrder('desc');
        } else {
            setSortOrder('asc');
        }
    }, [sortBy]);

    const filteredTemplates = useMemo(() => {
        return templates.filter(t => 
            t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            t.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [templates, searchTerm]);

    const groupedTemplates = useMemo(() => {
        const grouped = filteredTemplates.reduce((acc, template) => {
            const category = template.category || 'Uncategorized';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(template);
            return acc;
        }, {} as Record<string, PromptTemplate[]>);

        if (sortBy === 'name' || sortBy === 'date') {
            Object.keys(grouped).forEach(category => {
                grouped[category].sort((a, b) => {
                    let compareResult = 0;
                    if (sortBy === 'name') {
                        compareResult = a.name.localeCompare(b.name);
                    } else if (sortBy === 'date') {
                        compareResult = (a.createdAt || 0) - (b.createdAt || 0);
                    }
                    return sortOrder === 'asc' ? compareResult : -compareResult;
                });
            });
        }
        
        return grouped;
    }, [filteredTemplates, sortBy, sortOrder]);


    const sortedCategories = useMemo(() => {
        const categories = Object.keys(groupedTemplates);
        
        categories.sort((a, b) => {
            if (sortBy !== 'category') {
                if (a === 'Uncategorized') return 1;
                if (b === 'Uncategorized') return -1;
                return a.localeCompare(b);
            }

            const compareResult = a.localeCompare(b);
            return sortOrder === 'asc' ? compareResult : -compareResult;
        });
        
        return categories;
    }, [groupedTemplates, sortBy, sortOrder]);

    const handleSaveAndSwitchView = (template: Omit<PromptTemplate, 'id' | 'createdAt'>) => {
        onSave(template);
        setView('list');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-700">
                    <h2 className="text-2xl font-bold">{view === 'list' ? 'Manage Your Templates' : 'Create a New Template'}</h2>
                </div>
                
                {view === 'list' ? (
                    <div className="p-6 flex-grow overflow-y-auto">
                        <div className="flex justify-between items-center mb-4 gap-4 flex-wrap">
                            <input
                                type="text"
                                placeholder="Search templates..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="flex-grow bg-gray-900 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                            />
                            <div className="flex items-center gap-2">
                                <label htmlFor="sort-by" className="text-sm text-gray-400">Sort by:</label>
                                <select
                                    id="sort-by"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as any)}
                                    className="bg-gray-700 border border-gray-600 rounded-md p-2 text-sm focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
                                >
                                    <option value="category">Category</option>
                                    <option value="name">Name</option>
                                    <option value="date">Date Created</option>
                                </select>
                                <button
                                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                                    aria-label={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                                >
                                    {sortOrder === 'asc' ? <ArrowUpIcon className="h-5 w-5" /> : <ArrowDownIcon className="h-5 w-5" />}
                                </button>
                            </div>
                        </div>
                         <div className="flex justify-end mb-4">
                             <button
                                onClick={() => setView('create')}
                                className="bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg transition-colors whitespace-nowrap"
                            >
                                Create New
                            </button>
                         </div>

                        <div className="space-y-4">
                            {sortedCategories.length > 0 ? sortedCategories.map(category => (
                                <div key={category}>
                                    <h3 className="text-sm font-bold uppercase text-gray-500 tracking-wider mb-2 px-1">{category}</h3>
                                    <div className="space-y-3">
                                        {groupedTemplates[category].map(template => (
                                            <div key={template.id} className="bg-gray-900/50 p-4 rounded-md flex justify-between items-center">
                                                <div>
                                                    <h4 className="font-semibold">{template.name}</h4>
                                                    <p className="text-sm text-gray-400">{template.description}</p>
                                                </div>
                                                <button onClick={() => onDelete(template.id)} className="text-gray-400 hover:text-red-500 p-2 rounded-full transition-colors">
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )) : (
                                <p className="text-gray-500 text-center py-8">
                                    {templates.length === 0 ? "You haven't created any templates yet." : "No templates match your search."}
                                </p>
                            )}
                        </div>
                    </div>
                ) : (
                    <TemplateCreatorForm onSave={handleSaveAndSwitchView} onCancel={() => setView('list')} />
                )}
                
                <div className="p-4 border-t border-gray-700 text-right">
                     <button onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">Close</button>
                </div>
            </div>
        </div>
    );
};

export default ManageTemplatesModal;