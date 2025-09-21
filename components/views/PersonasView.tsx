import React from 'react';
import * as Icons from '../common/Icons';
import { Persona } from '../../types';

interface PersonaCardProps {
    persona: Persona;
    onStartChat: (persona: Persona) => void;
}

const PersonaCard: React.FC<PersonaCardProps> = ({ persona, onStartChat }) => {
    // A little hacky, but allows storing icon names in data
    const IconComponent = (Icons as any)[`${persona.avatar}Icon`] || Icons.BotIcon;

    return (
        <div className="bg-gray-800/60 rounded-lg p-4 flex flex-col border border-gray-700/50 transition-all duration-200 hover:border-accent/50 hover:bg-gray-800">
            <div className="flex items-center mb-3">
                <div className="p-2 bg-gray-700/50 rounded-full mr-3">
                    <IconComponent size={20} className="text-gray-300" />
                </div>
                <h3 className="font-semibold text-white">{persona.name}</h3>
            </div>
            <p className="text-sm text-gray-400 flex-grow mb-4">{persona.description}</p>
            <button
                onClick={() => onStartChat(persona)}
                className="w-full mt-auto px-3 py-1.5 text-sm font-semibold bg-gray-700 text-gray-200 rounded-md hover:bg-accent hover:text-white transition-colors"
            >
                Chat
            </button>
        </div>
    );
};


interface PersonasViewProps {
    personas: Persona[];
    onStartPersonaChat: (persona: Persona) => void;
    onBack: () => void;
}

const PersonasView: React.FC<PersonasViewProps> = ({ personas, onStartPersonaChat, onBack }) => {
    return (
        <div className="flex flex-col h-full w-full bg-gray-900/50">
            <header className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50 flex-shrink-0 bg-gray-900">
                <div className="flex items-center">
                     <button onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-gray-700">
                        <Icons.ArrowLeftIcon />
                    </button>
                    <h1 className="text-xl font-bold text-white">Personas</h1>
                </div>
            </header>
            <main className="flex-grow overflow-y-auto p-4 md:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {personas.map(persona => (
                        <PersonaCard
                            key={persona.id}
                            persona={persona}
                            onStartChat={onStartPersonaChat}
                        />
                    ))}
                </div>
            </main>
        </div>
    );
};

export default PersonasView;
