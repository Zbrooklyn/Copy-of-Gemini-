import React from 'react';
import { Conversation } from '../../types';
import {
    XIcon, PinIcon, StarIcon, ArchiveIcon, BellIcon, BellOffIcon, TrashIcon,
    LabelIcon, ShareIcon, BotIcon, LinkIcon, ShareLinkIcon, SearchIcon, InfoIcon, DuplicateIcon
} from './Icons';

interface ChatSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    conversation: Conversation;
    onOpenInfo: () => void;
    onDelete: () => void;
    onToggleMute: () => void;
}

const ModalMenuItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    className?: string;
}> = ({ icon, label, onClick, className = '' }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center p-4 text-center text-gray-200 hover:bg-gray-700/60 rounded-lg transition-colors aspect-square ${className}`}
    >
        <div className="mb-2">{icon}</div>
        <span className="font-semibold text-sm">{label}</span>
    </button>
);

const ModalListItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    className?: string;
}> = ({ icon, label, onClick, className = '' }) => (
     <button
        onClick={onClick}
        className={`w-full flex items-center px-4 py-3 text-sm text-left text-gray-200 hover:bg-gray-700/50 rounded-lg transition-colors ${className}`}
    >
        <span className="mr-3 text-gray-400">{icon}</span>
        {label}
    </button>
);


const ChatSettingsModal: React.FC<ChatSettingsModalProps> = ({ isOpen, onClose, conversation, onOpenInfo, onDelete, onToggleMute }) => {

    if (!isOpen) return null;
    
    // Combine handlers to close modal after action
    const handleAndClose = (fn: () => void) => () => {
        fn();
        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="chat-settings-title"
        >
            <div
                className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md animate-scale-in border border-gray-700 flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
                    <h2 id="chat-settings-title" className="text-lg font-semibold text-white">Conversation Settings</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700" aria-label="Close settings">
                        <XIcon size={20} />
                    </button>
                </header>
                <main className="p-4 overflow-y-auto">
                    {/* Primary Actions */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        <ModalMenuItem icon={<PinIcon size={24} />} label={conversation.pinned ? 'Unpin' : 'Pin'} onClick={handleAndClose(() => alert('Pin action is handled in the main list view.'))} />
                        <ModalMenuItem icon={<StarIcon size={24} />} label={conversation.starred ? 'Unstar' : 'Star'} onClick={handleAndClose(() => alert('Star action is handled in the main list view.'))} />
                        <ModalMenuItem icon={<ArchiveIcon size={24} />} label="Archive" onClick={handleAndClose(() => alert('Archive action is handled in the main list view.'))} />
                        <ModalMenuItem icon={conversation.muted ? <BellOffIcon size={24} /> : <BellIcon size={24} />} label={conversation.muted ? 'Unmute' : 'Mute'} onClick={handleAndClose(onToggleMute)} />
                        <ModalMenuItem icon={<LabelIcon size={24} />} label="Labels" onClick={handleAndClose(() => alert('Label action is handled in the main list view.'))} />
                        <ModalMenuItem icon={<DuplicateIcon size={24} />} label="Duplicate" onClick={handleAndClose(() => alert('Duplicate action is handled in the main list view.'))} />
                    </div>
                    {/* Secondary Actions */}
                    <div className="space-y-2 mb-4">
                         <ModalListItem icon={<BotIcon size={20} />} label="Custom Instructions" onClick={handleAndClose(() => alert('Custom Instructions not implemented yet.'))} />
                         <ModalListItem icon={<LinkIcon size={20} />} label="Copy Link" onClick={handleAndClose(() => alert('Copy Link not implemented yet.'))} />
                         <ModalListItem icon={<ShareLinkIcon size={20} />} label="Share" onClick={handleAndClose(() => alert('Share not implemented yet.'))} />
                         <ModalListItem icon={<ShareIcon size={20} />} label="Export" onClick={handleAndClose(() => alert('Export action is handled in the main list view.'))} />
                    </div>
                     <div className="my-2 border-t border-gray-700/50"></div>
                     {/* Tertiary Actions */}
                     <div className="space-y-2 my-2">
                        <ModalListItem icon={<SearchIcon size={20} />} label="Search in Conversation" onClick={handleAndClose(() => alert('Search in Conversation not implemented yet.'))} />
                        <ModalListItem icon={<InfoIcon size={20} />} label="View Conversation Info" onClick={handleAndClose(onOpenInfo)} />
                     </div>
                     <div className="my-2 border-t border-gray-700/50"></div>
                     {/* Danger Zone */}
                     <div>
                        <ModalListItem icon={<TrashIcon size={20} />} label="Delete Conversation" onClick={handleAndClose(onDelete)} className="text-red-500 hover:bg-red-500/10" />
                     </div>
                </main>
            </div>
        </div>
    );
};

export default ChatSettingsModal;