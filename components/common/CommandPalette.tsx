import React, { useState, useEffect, useRef } from 'react';
import { Conversation } from '../../types';
import { SearchIcon, PlusIcon, SettingsIcon, MessageSquareIcon, HashIcon, XIcon, SunIcon } from './Icons';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    conversations: Conversation[];
    onNavigate: (conversationId: string) => void;
    onNavigateToSettings: () => void;
    onNewChat: () => void;
    onToggleDarkMode: () => void;
    onApplyFilter: (filter: string) => void;
}

type Command = {
    id: string;
    type: 'action' | 'conversation' | 'label';
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    action?: () => void;
};

const CommandPalette: React.FC<CommandPaletteProps> = ({
    isOpen,
    onClose,
    conversations,
    onNavigate,
    onNavigateToSettings,
    onNewChat,
    onToggleDarkMode,
    onApplyFilter,
}) => {
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const resultsRef = useRef<HTMLDivElement>(null);

    const allCommands: Command[] = [
        // Actions
        { id: 'new-chat', type: 'action', icon: <PlusIcon size={16} />, title: 'New Chat', action: onNewChat },
        { id: 'settings', type: 'action', icon: <SettingsIcon size={16} />, title: 'Go to Settings', action: onNavigateToSettings },
        { id: 'toggle-dark', type: 'action', icon: <SunIcon size={16} />, title: 'Toggle Theme', action: onToggleDarkMode },
        // Labels
        { id: 'label-work', type: 'label', icon: <HashIcon size={16} />, title: 'Filter: Work', action: () => onApplyFilter('Work') },
        { id: 'label-personal', type: 'label', icon: <HashIcon size={16} />, title: 'Filter: Personal', action: () => onApplyFilter('Personal') },
        { id: 'label-urgent', type: 'label', icon: <HashIcon size={16} />, title: 'Filter: Urgent', action: () => onApplyFilter('Urgent') },
        // Conversations
        ...conversations.map(c => ({
            id: c.id,
            type: 'conversation' as const,
            icon: <MessageSquareIcon size={16} />,
            title: c.title,
            subtitle: c.lastMessage,
            action: () => onNavigate(c.id),
        })),
    ];
    
    const filteredCommands = query
        ? allCommands.filter(cmd =>
            cmd.title.toLowerCase().includes(query.toLowerCase()) ||
            cmd.subtitle?.toLowerCase().includes(query.toLowerCase())
        )
        : allCommands;
        
    useEffect(() => {
        if (isOpen) {
            // Reset state on open
            setQuery('');
            setActiveIndex(0);
            // Delay focus to allow for transition
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    useEffect(() => {
        // Scroll active item into view
        if (resultsRef.current) {
            const activeElement = resultsRef.current.children[activeIndex] as HTMLElement;
            if (activeElement) {
                activeElement.scrollIntoView({
                    block: 'nearest',
                });
            }
        }
    }, [activeIndex]);
    
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex(prev => (prev + 1) % filteredCommands.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        } else if (e.key === 'Enter') {
            const command = filteredCommands[activeIndex];
            if (command?.action) {
                command.action();
            }
        } else if (e.key === 'Escape') {
            onClose();
        }
    };
    
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex justify-center pt-20 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl animate-scale-in border border-gray-700 flex flex-col max-h-[60vh]"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={handleKeyDown}
            >
                <div className="relative p-2">
                    <SearchIcon size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setActiveIndex(0);
                        }}
                        placeholder="Type a command or search..."
                        className="w-full bg-transparent border-0 focus:ring-0 py-3 pl-10 text-lg text-white placeholder-gray-500"
                    />
                     <button onClick={onClose} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full text-gray-400 hover:bg-gray-700" aria-label="Close">
                        <XIcon size={20} />
                    </button>
                </div>
                <div ref={resultsRef} className="flex-grow overflow-y-auto border-t border-gray-700/50 p-2">
                    {filteredCommands.length > 0 ? (
                        filteredCommands.map((cmd, index) => (
                            <button
                                key={cmd.id}
                                onClick={cmd.action}
                                className={`w-full flex items-center p-3 text-left rounded-lg transition-colors ${
                                    index === activeIndex ? 'bg-accent/20 text-accent' : 'text-gray-300 hover:bg-gray-700/50'
                                }`}
                                onMouseMove={() => setActiveIndex(index)}
                            >
                                <span className={`mr-4 ${index === activeIndex ? 'text-accent' : 'text-gray-400'}`}>{cmd.icon}</span>
                                <div className="overflow-hidden">
                                    <p className="font-medium truncate text-white">{cmd.title}</p>
                                    {cmd.subtitle && <p className="text-sm truncate text-gray-400">{cmd.subtitle}</p>}
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="p-10 text-center text-gray-500">
                            <p>No results found for "{query}"</p>
                        </div>
                    )}
                </div>
                 <div className="flex-shrink-0 p-2 border-t border-gray-700/50 text-xs text-gray-500 flex items-center justify-between">
                    <span>Select with <kbd className="font-sans rounded bg-gray-700 px-1.5 py-0.5">↑</kbd> <kbd className="font-sans rounded bg-gray-700 px-1.5 py-0.5">↓</kbd>, and execute with <kbd className="font-sans rounded bg-gray-700 px-1.5 py-0.5">Enter</kbd></span>
                    <span><kbd className="font-sans rounded bg-gray-700 px-1.5 py-0.5">Esc</kbd> to close</span>
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;