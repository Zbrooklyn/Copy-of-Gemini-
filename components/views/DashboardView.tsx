import React from 'react';
import { Conversation } from '../../types';
import { SparklesIcon, BotIcon, GraduationCapIcon } from '../common/Icons';

interface DashboardViewProps {
    conversations: Conversation[];
    onConversationSelect: (id: string) => void;
    onPromptStarterClick: (prompt: string) => void;
    showRecents?: boolean;
}

const PromptStarter: React.FC<{ icon: React.ReactNode; text: string; onClick: () => void; }> = ({ icon, text, onClick }) => (
    <button onClick={onClick} className="w-full p-4 bg-gray-800 hover:bg-gray-700/60 rounded-lg text-left transition-colors">
        <div className="flex items-start">
            <div className="p-2 bg-gray-700 rounded-full text-gray-300 mr-3">{icon}</div>
            <span className="text-sm font-medium text-gray-200">{text}</span>
        </div>
    </button>
);

const RecentChatItem: React.FC<{ conversation: Conversation; onClick: () => void }> = ({ conversation, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center p-3 rounded-lg hover:bg-gray-800 transition-colors">
        <div className={`w-9 h-9 rounded-full ${conversation.avatar} flex-shrink-0 mr-3 flex items-center justify-center text-white font-bold text-base`}>
            {conversation.title.charAt(0)}
        </div>
        <div className="overflow-hidden text-left">
            <p className="text-sm font-semibold text-white truncate">{conversation.title}</p>
            <p className="text-xs text-gray-400 truncate">{conversation.lastMessage}</p>
        </div>
    </button>
);


const DashboardView: React.FC<DashboardViewProps> = ({ conversations, onConversationSelect, onPromptStarterClick, showRecents = true }) => {
    const recentConversations = conversations.filter(c => !c.archived).slice(0, 5);
    
    const prompts = [
        { icon: <SparklesIcon size={18} />, text: "Brainstorm new, creative ideas for a project" },
        { icon: <BotIcon size={18} />, text: "Act as an expert in a specific domain" },
        { icon: <GraduationCapIcon size={18} />, text: "Explain a complex topic in simple terms" },
        { icon: <SparklesIcon size={18} />, text: "Write a short story based on a prompt" },
    ];

    return (
        <div className="flex-grow h-full flex flex-col items-center justify-center bg-gray-900/50 p-6">
            <div className="w-full max-w-2xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome to Gemini Client</h1>
                    <p className="text-gray-400">Select a conversation or start a new one to begin.</p>
                </div>

                <div className="mb-8">
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">Start a conversation</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {prompts.map(prompt => (
                            <PromptStarter
                                key={prompt.text}
                                icon={prompt.icon}
                                text={prompt.text}
                                onClick={() => onPromptStarterClick(prompt.text)}
                            />
                        ))}
                    </div>
                </div>
                
                {showRecents && recentConversations.length > 0 && (
                     <div>
                        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">Recent Chats</h2>
                        <div className="space-y-2">
                           {recentConversations.map(conv => (
                               <RecentChatItem 
                                   key={conv.id} 
                                   conversation={conv} 
                                   onClick={() => onConversationSelect(conv.id)} 
                               />
                           ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardView;