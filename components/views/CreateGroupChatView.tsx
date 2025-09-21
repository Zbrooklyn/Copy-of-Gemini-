import React, { useState } from 'react';
import * as Icons from '../common/Icons';
import { Persona } from '../../types';

interface PersonaSelectItemProps {
    persona: Persona;
    isSelected: boolean;
    onToggle: (id: string) => void;
}

const PersonaSelectItem: React.FC<PersonaSelectItemProps> = ({ persona, isSelected, onToggle }) => {
    const IconComponent = (Icons as any)[`${persona.avatar}Icon`] || Icons.BotIcon;

    return (
        <button
            onClick={() => onToggle(persona.id)}
            className="w-full flex items-center p-3 text-left rounded-lg transition-colors hover:bg-gray-700/50"
        >
            <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center
                           ${isSelected ? 'bg-accent border-accent' : 'border-gray-500'}`}>
                {isSelected && <Icons.CheckIcon size={12} className="text-white" />}
            </div>
            <div className="p-2 bg-gray-700/50 rounded-full mx-3">
                <IconComponent size={20} className="text-gray-300" />
            </div>
            <div>
                <p className="font-semibold text-white">{persona.name}</p>
                <p className="text-xs text-gray-400">{persona.description}</p>
            </div>
        </button>
    );
};


interface CreateGroupChatViewProps {
    personas: Persona[];
    onBack: () => void;
    onCreate: (title: string, participants: Persona[]) => void;
}

const CreateGroupChatView: React.FC<CreateGroupChatViewProps> = ({ personas, onBack, onCreate }) => {
    const [title, setTitle] = useState('');
    const [selectedPersonaIds, setSelectedPersonaIds] = useState<Set<string>>(new Set());

    const handleTogglePersona = (id: string) => {
        setSelectedPersonaIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const handleCreate = () => {
        const participants = personas.filter(p => selectedPersonaIds.has(p.id));
        if (title.trim() && participants.length > 0) {
            onCreate(title.trim(), participants);
        }
    };

    const canCreate = title.trim() && selectedPersonaIds.size > 0;

    return (
        <div className="flex flex-col h-full w-full bg-gray-900/95">
            <header className="flex items-center p-4 border-b border-gray-800 flex-shrink-0 bg-gray-900">
                <button onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-gray-700">
                    <Icons.ArrowLeftIcon />
                </button>
                <h1 className="text-xl font-bold text-white">Create Group Chat</h1>
            </header>
            <main className="flex-grow overflow-y-auto p-4 md:p-6">
                <div className="max-w-3xl mx-auto">
                    <div className="mb-6">
                        <label htmlFor="group-title" className="block text-sm font-medium text-gray-300 mb-1">Group Title</label>
                        <input
                            id="group-title"
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="e.g., 'Project Phoenix Team'"
                            className="w-full p-2 border border-gray-600 rounded-md bg-gray-900 text-white focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <h2 className="text-sm font-medium text-gray-300 mb-2">Select Personas ({selectedPersonaIds.size})</h2>
                        <div className="bg-gray-800/50 rounded-lg max-h-96 overflow-y-auto">
                            {personas.map(p => (
                                <PersonaSelectItem
                                    key={p.id}
                                    persona={p}
                                    isSelected={selectedPersonaIds.has(p.id)}
                                    onToggle={handleTogglePersona}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </main>
            <footer className="p-4 border-t border-gray-800 bg-gray-900">
                <div className="max-w-3xl mx-auto">
                    <button
                        onClick={handleCreate}
                        disabled={!canCreate}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-accent text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                    >
                        Create Group
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default CreateGroupChatView;