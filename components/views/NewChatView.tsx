import React, { useState } from 'react';
import * as Icons from '../common/Icons';
import { Persona } from '../../types';

interface NewChatViewProps {
    personas: Persona[];
    onBack: () => void;
    onStartPersonaChat: (persona: Persona) => void;
    onStartGroupChat: () => void;
    onStartNewConversation: () => void;
}

const ActionRow: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; }> = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center p-3 text-left rounded-lg transition-colors hover:bg-gray-800">
        <div className="p-2 bg-gray-700/60 rounded-full mr-4 text-accent">
            {icon}
        </div>
        <span className="font-semibold text-accent">{label}</span>
    </button>
);

const PersonaRow: React.FC<{ persona: Persona; onSelect: () => void; }> = ({ persona, onSelect }) => {
    const IconComponent = (Icons as any)[`${persona.avatar}Icon`] || Icons.BotIcon;
    return (
        <button onClick={onSelect} className="w-full flex items-center p-3 text-left rounded-lg transition-colors hover:bg-gray-800">
            <div className="p-2 bg-gray-700/60 rounded-full mr-4">
                <IconComponent size={20} className="text-gray-300" />
            </div>
            <div className="overflow-hidden">
                <p className="font-semibold text-white truncate">{persona.name}</p>
                <p className="text-xs text-gray-400 truncate">{persona.description}</p>
            </div>
        </button>
    );
};

const NewChatView: React.FC<NewChatViewProps> = ({ personas, onBack, onStartPersonaChat, onStartGroupChat, onStartNewConversation }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredPersonas = personas.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full w-full bg-gray-900/95">
            <header className="flex items-center justify-between p-4 border-b border-gray-800 flex-shrink-0 bg-gray-900 z-10">
                <h1 className="text-xl font-bold text-white">New Chat</h1>
                <button onClick={onBack} className="px-3 py-1 text-sm font-semibold text-accent hover:bg-accent/10 rounded-md transition-colors">
                    Cancel
                </button>
            </header>

            <div className="p-4 border-b border-gray-800 flex-shrink-0">
                <div className="relative flex items-center">
                    <Icons.SearchIcon size={20} className="absolute left-3 text-gray-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search for personas..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-800 border-0 focus:ring-2 focus:ring-accent rounded-full py-2 pl-10 pr-4 text-sm text-gray-100 placeholder:text-gray-400 outline-none"
                    />
                </div>
            </div>

            <main className="flex-grow overflow-y-auto">
                <div className="p-2">
                    <ActionRow
                        icon={<Icons.UsersIcon size={20} />}
                        label="New Group Chat"
                        onClick={onStartGroupChat}
                    />
                    <ActionRow
                        icon={<Icons.MessageSquareIcon size={20} />}
                        label="New Blank Chat"
                        onClick={onStartNewConversation}
                    />
                </div>
                <div className="px-4 pt-4 pb-2">
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Start a conversation with</h2>
                </div>
                <div className="p-2">
                    {filteredPersonas.map(persona => (
                        <PersonaRow
                            key={persona.id}
                            persona={persona}
                            onSelect={() => onStartPersonaChat(persona)}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
};

export default NewChatView;
