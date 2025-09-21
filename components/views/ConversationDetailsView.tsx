import React from 'react';
import { Conversation, Message } from '../../types';
import {
    XIcon,
    PinIcon,
    StarIcon,
    ArchiveIcon,
    BellOffIcon,
    TrashIcon,
    ImageIcon,
    PlayIcon,
    CalendarDaysIcon,
    ClockIcon,
    MessageSquareIcon,
    DollarSignIcon,
    FileTextIcon,
    TerminalIcon,
    BellIcon,
} from '../common/Icons';

interface ConversationDetailsViewProps {
    conversation: Conversation;
    isOpen: boolean;
    onClose: () => void;
    pinnedMessages: Message[];
    onPinClick: (messageId: string) => void;
    onDelete: () => void;
    onToggleMute: () => void;
}

const ActionButton: React.FC<{ icon: React.ReactNode; label: string; active?: boolean, onClick?: () => void }> = ({ icon, label, active, onClick }) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center p-3 text-center rounded-lg transition-colors w-20 h-20 ${active ? 'bg-blue-600/20 text-blue-300' : 'bg-gray-800 hover:bg-gray-700/60 text-gray-300'}`}>
        {icon}
        <span className="mt-1.5 text-xs font-medium">{label}</span>
    </button>
);

const DetailItem: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
    <div className="flex items-start">
        <div className="w-6 text-gray-400 mt-0.5">{icon}</div>
        <div className="ml-2">
            <p className="text-sm font-medium text-gray-200">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
        </div>
    </div>
);

const MediaItem: React.FC<{ type: 'image' | 'video' }> = ({ type }) => (
     <div className="aspect-square bg-gray-700 rounded-md flex items-center justify-center">
        {type === 'image' ? <ImageIcon size={24} className="text-gray-500" /> : <PlayIcon size={24} className="text-gray-500 ml-0.5" />}
     </div>
);

const AttachmentItem: React.FC<{ name: string }> = ({ name }) => (
    <button className="w-full flex items-center p-2 bg-gray-800/50 rounded-md hover:bg-gray-800 transition-colors text-left">
        <FileTextIcon size={20} className="text-gray-400 flex-shrink-0" />
        <span className="ml-3 text-sm text-gray-200 truncate">{name}</span>
    </button>
);

const PinnedMessageItem: React.FC<{ message: Message; onClick: () => void }> = ({ message, onClick }) => (
    <button onClick={onClick} className="w-full p-2.5 text-left bg-gray-800/50 rounded-md hover:bg-gray-800 transition-colors">
        <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
            {message.content.startsWith('```') ? <span className="flex items-center"><TerminalIcon size={12} className="mr-1.5 opacity-70" />Code Block</span> : message.content}
        </p>
        <p className="text-xs text-gray-500 mt-1">{message.timestamp}</p>
    </button>
);

const ConversationDetailsView: React.FC<ConversationDetailsViewProps> = ({ conversation, isOpen, onClose, pinnedMessages, onPinClick, onDelete, onToggleMute }) => {
    if (!isOpen) return null;

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this conversation? It will be moved to the trash.')) {
            onDelete();
            onClose();
        }
    };
    
    const handleToggleMute = () => {
        onToggleMute();
    };

    return (
        <>
            <div 
                className="fixed inset-0 bg-black/50 z-20 md:hidden"
                onClick={onClose}
                aria-hidden="true"
            />
            <div className={`fixed top-0 right-0 h-full bg-gray-900 border-l border-gray-700/50 shadow-2xl z-30
                         w-full md:w-96 flex flex-col transition-transform duration-300 ease-in-out
                         ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <header className="flex items-center p-4 border-b border-gray-800 flex-shrink-0">
                    <h2 className="text-lg font-semibold text-white">Conversation Info</h2>
                    <button onClick={onClose} className="ml-auto p-2 rounded-full hover:bg-gray-800" aria-label="Close details">
                        <XIcon size={20} />
                    </button>
                </header>

                <main className="flex-grow overflow-y-auto p-4">
                    <div className="flex flex-col items-center text-center">
                        <div className={`w-20 h-20 rounded-full ${conversation.avatar} flex items-center justify-center text-white font-bold text-3xl mb-3`}>
                             {conversation.title.charAt(0)}
                        </div>
                        <h1 className="text-xl font-bold text-white">{conversation.title}</h1>
                        <p className="text-sm text-gray-400">Last message: {conversation.timestamp}</p>
                    </div>

                    <div className="my-6 grid grid-cols-4 gap-3">
                        <ActionButton icon={<PinIcon size={20} />} label={conversation.pinned ? 'Unpin' : 'Pin'} active={conversation.pinned} onClick={() => alert('Pin action is handled in the main list view.')} />
                        <ActionButton icon={<StarIcon size={20} />} label={conversation.starred ? 'Unstar' : 'Star'} active={conversation.starred} onClick={() => alert('Star action is handled in the main list view.')} />
                        <ActionButton icon={<ArchiveIcon size={20} />} label="Archive" onClick={() => alert('Archive action is handled in the main list view.')} />
                        <ActionButton icon={conversation.muted ? <BellOffIcon size={20} /> : <BellIcon size={20} />} label={conversation.muted ? 'Unmute' : 'Mute'} active={conversation.muted} onClick={handleToggleMute} />
                    </div>

                    <div className="my-6 p-4 bg-gray-800/50 rounded-lg space-y-4">
                        <DetailItem icon={<CalendarDaysIcon size={16} />} label="Created" value="June 20, 2024" />
                        <DetailItem icon={<ClockIcon size={16} />} label="Last Activity" value={conversation.timestamp} />
                        <DetailItem icon={<MessageSquareIcon size={16} />} label="Message Count" value="13" />
                        {conversation.cost && (
                            <div className="flex items-start">
                                <div className="w-6 text-gray-400 mt-0.5"><DollarSignIcon size={16} /></div>
                                <div className="ml-2">
                                    <p className="text-sm font-medium text-gray-200">{conversation.cost.total}</p>
                                    <p className="text-xs text-gray-500">Estimated Cost</p>
                                    <div className="text-xs text-gray-400 mt-2 space-y-1 font-mono">
                                        <p>Prompt: {conversation.cost.promptTokens.toLocaleString()} tokens</p>
                                        <p>Completion: {conversation.cost.completionTokens.toLocaleString()} tokens</p>
                                        <p>Total: {conversation.cost.totalTokens.toLocaleString()} tokens</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {pinnedMessages.length > 0 && (
                        <div className="my-6">
                            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Pinned Messages</h3>
                            <div className="space-y-2">
                                {pinnedMessages.map(msg => (
                                    <PinnedMessageItem key={msg.id} message={msg} onClick={() => onPinClick(msg.id)} />
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="my-6">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Shared Media</h3>
                        <div className="grid grid-cols-4 gap-2">
                           {/* Placeholder Media Items */}
                           <MediaItem type="image" />
                           <MediaItem type="image" />
                           <MediaItem type="video" />
                           <MediaItem type="image" />
                        </div>
                    </div>
                    
                     <div className="my-6">
                        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Attachments</h3>
                        <div className="space-y-2">
                             <AttachmentItem name="Project_Brief.pdf" />
                             <AttachmentItem name="Summary.pdf" />
                        </div>
                    </div>

                    <div className="my-6 pt-6 border-t border-gray-700/50">
                        <h3 className="text-sm font-semibold text-red-500 uppercase tracking-wider mb-3">Danger Zone</h3>
                         <button onClick={handleDelete} className="w-full flex items-center justify-center p-3 text-sm font-semibold bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg transition-colors">
                            <TrashIcon size={16} className="mr-2" />
                            Delete Conversation
                        </button>
                    </div>

                </main>
            </div>
        </>
    );
};

export default ConversationDetailsView;