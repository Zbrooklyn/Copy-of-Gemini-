import React, { useState, useEffect, useRef } from 'react';
import { Conversation } from '../../types';
import { ArrowLeftIcon, Undo2Icon, TrashIcon } from '../common/Icons';

const TrashItemRow: React.FC<{
    conversation: Conversation;
    retentionInfo: string;
    onRestore: () => void;
    onDelete: () => void;
}> = ({ conversation, retentionInfo, onRestore, onDelete }) => {
    return (
        <div className="flex items-center p-3 bg-gray-800 rounded-lg hover:bg-gray-700/50 transition-colors group">
            <div className={`w-10 h-10 rounded-full ${conversation.avatar} flex-shrink-0 mr-4 flex items-center justify-center text-white font-bold text-lg`}>
                {conversation.title.charAt(0)}
            </div>
            <div className="flex-grow overflow-hidden">
                <h3 className="font-medium text-gray-300 truncate">{conversation.title}</h3>
                <p className="text-xs text-red-400 italic mt-0.5">{retentionInfo}</p>
            </div>
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={onRestore} className="px-3 py-1.5 text-sm font-semibold text-accent hover:bg-accent/10 rounded-md">
                    Restore
                </button>
                <button onClick={onDelete} className="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-md" aria-label={`Delete ${conversation.title} permanently`}>
                    <TrashIcon size={16} />
                </button>
            </div>
        </div>
    );
};

interface TrashViewProps {
    onBack: () => void;
    conversations: Conversation[];
    setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
    addNotification: (notification: { message: string; onUndo?: () => void }) => void;
    trashRetentionDays: number;
}

const TrashView: React.FC<TrashViewProps> = ({ onBack, conversations, setConversations, addNotification, trashRetentionDays }) => {
    const [hiddenConversationIds, setHiddenConversationIds] = useState<Set<string>>(new Set());
    const pendingTimeouts = useRef(new Map());

     useEffect(() => {
        return () => {
            pendingTimeouts.current.forEach(timeoutId => clearTimeout(timeoutId));
        };
    }, []);

    const createUndoableAction = (id: string, message: string, finalAction: () => void) => {
        setHiddenConversationIds(prev => new Set(prev).add(id));

        const undo = () => {
            clearTimeout(pendingTimeouts.current.get(id));
            pendingTimeouts.current.delete(id);
            setHiddenConversationIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        };

        addNotification({ message, onUndo: undo });

        const timeoutId = setTimeout(() => {
            finalAction();
            pendingTimeouts.current.delete(id);
        }, 5000);
        pendingTimeouts.current.set(id, timeoutId);
    };

    const handleRestore = (id: string) => {
        createUndoableAction(id, 'Conversation restored.', () => {
            setConversations(convs => convs.map(c => {
                if (c.id === id) {
                    const { deletedTimestamp, ...rest } = c;
                    return rest as Conversation;
                }
                return c;
            }));
            setHiddenConversationIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        });
    };

    const handleDeletePermanently = (id: string) => {
        createUndoableAction(id, 'Conversation permanently deleted.', () => {
             setConversations(convs => convs.filter(c => c.id !== id));
             setHiddenConversationIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        });
    };
    
    const trashedConversations = conversations
        .filter(c => c.deletedTimestamp && !hiddenConversationIds.has(c.id))
        .map(c => {
            let retentionInfo = 'Pending permanent deletion';
            if (c.deletedTimestamp && trashRetentionDays) {
                const deletionTime = c.deletedTimestamp + trashRetentionDays * 24 * 60 * 60 * 1000;
                const remainingMs = deletionTime - Date.now();
                if (remainingMs > 0) {
                    const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
                    retentionInfo = `Deletes in ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
                }
            }
            return { ...c, retentionInfo };
        });

    return (
        <div className="flex flex-col h-full w-full bg-gray-900/95">
            <header className="flex items-center p-4 border-b border-gray-800 flex-shrink-0 bg-gray-900 z-10">
                <button onClick={onBack} className="mr-4 p-2 rounded-full hover:bg-gray-700">
                    <ArrowLeftIcon />
                </button>
                <h1 className="text-xl font-bold text-white">Trashed Items</h1>
            </header>
            <main className="flex-grow overflow-y-auto p-4 md:p-6">
                <div className="max-w-3xl mx-auto">
                    {trashedConversations.length > 0 ? (
                        <div className="space-y-3">
                            {trashedConversations.map(conv => (
                                <TrashItemRow
                                    key={conv.id}
                                    conversation={conv}
                                    retentionInfo={conv.retentionInfo}
                                    onRestore={() => handleRestore(conv.id)}
                                    onDelete={() => handleDeletePermanently(conv.id)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <TrashIcon size={48} className="mx-auto text-gray-600 mb-4" />
                            <h2 className="text-xl font-semibold text-gray-200">Trash is empty</h2>
                            <p className="text-gray-400 mt-2">Deleted conversations will appear here.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default TrashView;
