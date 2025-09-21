import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, PlusIcon, KeyRoundIcon, TrashIcon, FilePenLineIcon } from '../common/Icons';
import Modal from '../common/Modal';
import ColorPicker from '../common/ColorPicker';
import { Label } from '../../types';

interface ManageLabelsViewProps {
    onBack: () => void;
    labels: Label[];
    onSave: (label: Label) => void;
    onDelete: (id: string) => void;
}

const ManageLabelsView: React.FC<ManageLabelsViewProps> = ({ onBack, labels, onSave, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLabel, setEditingLabel] = useState<Label | null>(null);

    const handleOpenModal = (label: Label | null = null) => {
        setEditingLabel(label);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingLabel(null);
    };

    const handleSaveLabel = (labelToSave: Label) => {
        onSave(labelToSave);
        handleCloseModal();
    };
    
    const handleDeleteLabel = (id: string) => {
        onDelete(id);
    };

    return (
        <div className="flex flex-col h-full w-full bg-gray-900/95">
            <header className="flex items-center justify-between p-4 border-b border-gray-800 flex-shrink-0 bg-gray-900">
                <div className="flex items-center">
                    <button onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-gray-700">
                        <ArrowLeftIcon />
                    </button>
                    <h1 className="text-xl font-bold text-white">Manage Labels</h1>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
                >
                    <PlusIcon size={16} />
                    <span>New Label</span>
                </button>
            </header>
            <main className="flex-grow overflow-y-auto p-4 md:p-6">
                 <div className="max-w-3xl mx-auto">
                    <div className="space-y-3">
                        {labels.map(label => (
                            <div key={label.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-700/50 transition-colors group">
                                <div className="flex items-center">
                                    <span className="w-4 h-4 rounded-full mr-4" style={{ backgroundColor: label.color }}></span>
                                    <span className="font-medium text-gray-200">{label.name}</span>
                                    {label.apiKey && (
                                        <KeyRoundIcon size={14} className="ml-3 text-yellow-500" title="This label uses a custom API key." />
                                    )}
                                </div>
                                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleOpenModal(label)} className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded-md" aria-label={`Edit ${label.name}`}>
                                        <FilePenLineIcon size={16} />
                                    </button>
                                    <button onClick={() => handleDeleteLabel(label.id)} className="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-md" aria-label={`Delete ${label.name}`}>
                                        <TrashIcon size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            
            {isModalOpen && (
                <LabelEditorModal
                    label={editingLabel}
                    onClose={handleCloseModal}
                    onSave={handleSaveLabel}
                />
            )}
        </div>
    );
};

interface LabelEditorModalProps {
    label: Label | null;
    onClose: () => void;
    onSave: (label: Label) => void;
}

const LabelEditorModal: React.FC<LabelEditorModalProps> = ({ label, onClose, onSave }) => {
    const [name, setName] = useState(label?.name || '');
    const [color, setColor] = useState(label?.color || '#4ADE80');
    const [apiKey, setApiKey] = useState(label?.apiKey || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: label?.id || '', // App.tsx will generate a new ID if this is empty
            name,
            color,
            apiKey,
        });
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={label ? 'Edit Label' : 'Create New Label'}
            footer={
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-200 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">Cancel</button>
                    <button type="submit" form="label-editor-form" className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">Save</button>
                </div>
            }
        >
            <form id="label-editor-form" onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="label-name" className="block text-sm font-medium text-gray-300 mb-1">Label Name</label>
                    <input
                        id="label-name"
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g., 'Work Projects'"
                        className="w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        required
                    />
                </div>
                <div>
                    <ColorPicker label="Color" color={color} onChange={setColor} />
                </div>
                 <div>
                    <label htmlFor="api-key" className="block text-sm font-medium text-gray-300 mb-1">Custom API Key (Optional)</label>
                    <input
                        id="api-key"
                        type="password"
                        value={apiKey}
                        onChange={e => setApiKey(e.target.value)}
                        placeholder="Default API Key will be used if empty"
                        className="w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                     <p className="text-xs text-gray-500 mt-1">This key will override the default key for any conversation with this label.</p>
                </div>
            </form>
        </Modal>
    );
};

export default ManageLabelsView;