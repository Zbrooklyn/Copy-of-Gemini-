import React from 'react';
import { Conversation, Message } from '../../types';
import { ArrowLeftIcon } from '../common/Icons';

// Simple mock data for demonstration
const mockMessages: (Message & { conversationId: string })[] = [
    { id: 'm4', conversationId: '1', role: 'model', content: "Certainly! Here is a simple 'Hello, World' in JavaScript...", timestamp: "10:03 AM" },
    { id: 'm6', conversationId: '1', role: 'model', content: "Great question. I can handle lists and tables...", timestamp: "10:05 AM" },
    { id: 'm2', conversationId: '2', role: 'model', content: "We need to focus on social media engagement for marketing.", timestamp: "1h ago" },
    { id: 'm1', conversationId: '3', role: 'user', content: "Let's build a new button component for the React library.", timestamp: "3h ago" },
];

const highlightText = (text: string, query: string): React.ReactNode => {
    if (!query.trim() || !text) {
        return text;
    }
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    const parts = text.split(regex);
    return (
        <>
            {parts.map((part, index) =>
                index % 2 === 1 ? (
                    <mark key={index} className="bg-yellow-500/40 text-yellow-200 rounded-[3px] px-0.5 py-0">
                        {part}
                    </mark>
                ) : (
                    part
                )
            )}
        </>
    );
};

interface SearchResultsViewProps {
    searchQuery: string;
    conversations: Conversation[];
    onResultClick: (conversationId: string, messageId: string) => void;
    onBack: () => void;
}

const SearchResultsView: React.FC<SearchResultsViewProps> = ({ searchQuery, conversations, onResultClick, onBack }) => {

    // In a real application, this would be a more sophisticated search algorithm.
    // For now, we mock it by filtering pre-defined messages.
    const searchResults = mockMessages
        .map(message => {
            const conversation = conversations.find(c => c.id === message.conversationId);
            return { message, conversation };
        })
        .filter(({ message, conversation }) => 
            conversation && message.content.toLowerCase().includes(searchQuery.toLowerCase())
        );

    return (
        <div className="flex flex-col h-full w-full bg-gray-900">
            <header className="flex items-center p-4 border-b border-gray-700/50 flex-shrink-0 z-10 bg-inherit">
                <button onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-gray-800">
                    <ArrowLeftIcon />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-white">Search Results</h1>
                    <p className="text-sm text-gray-400">
                        Found {searchResults.length} results for "{searchQuery}"
                    </p>
                </div>
            </header>
            <main className="flex-grow overflow-y-auto">
                {searchResults.length > 0 ? (
                    <div className="divide-y divide-gray-800">
                        {searchResults.map(({ message, conversation }) => (
                            <button
                                key={message.id}
                                onClick={() => onResultClick(conversation!.id, message.id)}
                                className="w-full text-left p-4 hover:bg-gray-800/60 transition-colors"
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-sm font-semibold text-accent">{conversation!.title}</p>
                                    <p className="text-xs text-gray-500">{message.timestamp}</p>
                                </div>
                                <p className="text-sm text-gray-300 line-clamp-2">
                                    {highlightText(message.content, searchQuery)}
                                </p>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-gray-500">
                        <p>No messages found for "{searchQuery}".</p>
                        <p className="text-sm mt-1">Try a different search term.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default SearchResultsView;
