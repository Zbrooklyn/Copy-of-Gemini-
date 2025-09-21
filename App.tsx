import React, { useState, useEffect } from 'react';
import ListView from './components/views/ListView';
import ChatView from './components/views/ChatView';
import SettingsView from './components/views/SettingsView';
import { MoonIcon, SparklesIcon, RowsIcon, ColumnsIcon, ChevronRightIcon, XIcon, ThermometerIcon, Volume2Icon, TerminalIcon, SettingsIcon, Undo2Icon } from './components/common/Icons';
import { Conversation, FileReference, Notification, ThemeSettings, Persona, ChatItem, Message, Label } from './types';
import { mockConversations, mockPersonas, mockMessages, mockLabels } from './data';
import FileViewerModal from './components/common/FileViewerModal';
import ManageLabelsView from './components/views/ManageLabelsView';
import LogView from './components/views/LogView';
import AdvancedSettingsView from './components/views/AdvancedSettingsView';
import CommandPalette from './components/common/CommandPalette';
import TrashSettingsView from './components/views/TrashSettingsView';
import TrashView from './components/views/TrashView';
import PersonasView from './components/views/PersonasView';
import CreateGroupChatView from './components/views/CreateGroupChatView';
import NewChatView from './components/views/NewChatView';
import { ttsService } from './services/ttsService';

export type Theme = 'dark' | 'oled';
export type Density = 'regular' | 'condensed';
export type LineCount = 2 | 3;
export type AppView = 'main' | 'settings' | 'logs' | 'createGroup' | 'personas' | 'newChat';
export type DarkMode = 'light' | 'dark' | 'system';


// --- Notification System Components (Added for Undo functionality) ---

const NotificationToast: React.FC<{
    notification: Notification;
    onDismiss: () => void;
}> = ({ notification, onDismiss }) => {
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        const duration = notification.duration || 5000;
        const interval = setInterval(() => {
            setProgress(p => p - (100 / (duration / 100)));
        }, 100);

        const timeout = setTimeout(onDismiss, duration);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [notification, onDismiss]);
    
    const handleUndo = () => {
        notification.onUndo?.();
        onDismiss();
    };

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-2xl flex items-center justify-between p-4 w-full max-w-sm animate-slide-in-up overflow-hidden">
            <span className="text-sm text-gray-200">{notification.message}</span>
            <div className="flex items-center gap-4">
                {notification.onUndo && (
                    <button
                        onClick={handleUndo}
                        className="flex items-center gap-1.5 text-sm font-semibold text-accent hover:opacity-80"
                    >
                        <Undo2Icon size={16} />
                        Undo
                    </button>
                )}
                <button onClick={onDismiss} className="p-1 text-gray-400 hover:text-white"><XIcon size={16} /></button>
            </div>
            <div className="absolute bottom-0 left-0 h-0.5 bg-accent" style={{ width: `${progress}%`, transition: 'width 100ms linear' }}></div>
        </div>
    );
};


const NotificationHost: React.FC<{
    notifications: Notification[];
    onDismiss: (id: number) => void;
}> = ({ notifications, onDismiss }) => {
    if (notifications.length === 0) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 flex flex-col items-center gap-3">
            {notifications.map(n => (
                <NotificationToast key={n.id} notification={n} onDismiss={() => onDismiss(n.id)} />
            ))}
        </div>
    );
};

// --- QuickSettingsModal Helper Components ---

const SettingsRow: React.FC<{ icon: React.ReactNode; label: string; children: React.ReactNode; }> = ({ icon, label, children }) => (
    <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center">
            <div className="w-8 text-gray-400 flex items-center justify-center">{icon}</div>
            <span className="text-sm text-gray-200">{label}</span>
        </div>
        <div>{children}</div>
    </div>
);

const SegmentedControl: React.FC<{
    options: { label: string; value: string | number }[];
    value: string | number;
    onChange: (value: string | number) => void;
    disabled?: boolean;
}> = ({ options, value, onChange, disabled }) => (
    <div className={`flex items-center rounded-lg bg-gray-700/50 p-1 space-x-1 ${disabled ? 'opacity-50' : ''}`}>
        {options.map(option => (
            <button
                key={option.value}
                onClick={() => !disabled && onChange(option.value)}
                disabled={disabled}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${value === option.value ? 'bg-accent text-white' : 'text-gray-200 hover:bg-gray-600'}`}
            >
                {option.label}
            </button>
        ))}
    </div>
);


// --- QuickSettingsModal Component ---
const QuickSettingsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    density: Density; setDensity: (d: Density) => void;
    lineCount: LineCount; setLineCount: (lc: LineCount) => void;
    temperature: number; setTemperature: (t: number) => void;
    onNavigateToSettings: () => void;
    onNavigateToLogs: () => void;
}> = ({
    isOpen, onClose, density, setDensity, lineCount, setLineCount,
    temperature, setTemperature, onNavigateToSettings, onNavigateToLogs
}) => {
    
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);
    
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-settings-title"
        >
            <div 
                className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm animate-scale-in border border-gray-700"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 id="quick-settings-title" className="text-lg font-semibold text-white">Quick Settings</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-700" aria-label="Close settings">
                        <XIcon size={20} />
                    </button>
                </header>
                <div className="p-1 max-h-[70vh] overflow-y-auto">
                    <SettingsRow icon={<RowsIcon size={20} />} label="Density">
                        <SegmentedControl options={[{label: 'Regular', value: 'regular'}, {label: 'Condensed', value: 'condensed'}]} value={density} onChange={(v) => setDensity(v as Density)} />
                    </SettingsRow>
                    <SettingsRow icon={<span className="font-bold text-lg leading-none text-center w-full">#</span>} label="Lines">
                        <SegmentedControl options={[{label: '2', value: 2}, {label: '3', value: 3}]} value={lineCount} onChange={(v) => setLineCount(Number(v) as LineCount)} />
                    </SettingsRow>
                    <div className="border-t border-gray-700 my-2 mx-3"></div>
                    <SettingsRow icon={<ThermometerIcon size={20} />} label="Default Temperature">
                        <div className="flex items-center">
                            <input
                                type="range"
                                min="0"
                                max="2"
                                step="0.1"
                                value={temperature}
                                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                className="w-24 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="ml-3 text-sm font-mono w-8 text-right text-gray-300">{temperature.toFixed(1)}</span>
                        </div>
                    </SettingsRow>
                    <div className="border-t border-gray-700 my-2 mx-3"></div>
                    <div className="p-2 space-y-1">
                        <button onClick={onNavigateToLogs} className="w-full flex items-center px-3 py-2 text-sm text-left text-gray-200 hover:bg-gray-700/50 rounded-lg transition-colors">
                            <TerminalIcon size={20} className="text-gray-400 mr-3" />
                            <span>View Logs & Errors</span>
                        </button>
                        <button onClick={onNavigateToSettings} className="w-full flex items-center justify-between px-3 py-2 text-sm text-left text-gray-200 hover:bg-gray-700/50 rounded-lg transition-colors">
                             <div className="flex items-center">
                                <SettingsIcon size={20} className="text-gray-400 mr-3" />
                                <span>Go to Full Settings</span>
                            </div>
                            <ChevronRightIcon size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- App Component ---
const App: React.FC = () => {
    const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
    const [messages, setMessages] = useState<{ [key: string]: ChatItem[] }>(mockMessages);
    const [labels, setLabels] = useState<Label[]>(mockLabels);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [theme, setTheme] = useState<Theme>('dark');
    const [density, setDensity] = useState<Density>('regular');
    const [lineCount, setLineCount] = useState<LineCount>(2);
    const [isQuickSettingsModalOpen, setIsQuickSettingsModalOpen] = useState(false);
    const [appView, setAppView] = useState<AppView>('main');
    const [settingsSubView, setSettingsSubView] = useState<'main' | 'labels' | 'advanced' | 'trash' | 'trashItems'>('main');
    const [viewingState, setViewingState] = useState<{ files: FileReference[], startIndex: number } | null>(null);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const [initialScrollTo, setInitialScrollTo] = useState<{ convId: string, msgId: string } | null>(null);
    const [initialPrompt, setInitialPrompt] = useState<{ convId: string; prompt: string } | null>(null);

    // New settings states
    const [darkMode, setDarkMode] = useState<DarkMode>('system');
    const [temperature, setTemperature] = useState<number>(1.0);
    const [autoPlayTTS, setAutoPlayTTS] = useState<boolean>(false);
    const [themeSettings, setThemeSettings] = useState<ThemeSettings>({
        accentColor: '#3B82F6',
        userBubbleColor: '#3B82F6',
        modelBubbleColor: '#374151',
    });
    const [trashRetentionDays, setTrashRetentionDays] = useState(7);
    const [activeFilters, setActiveFilters] = useState<string[]>(['All']);


    // Effect for Command Palette
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsCommandPaletteOpen(open => !open);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    // Effect for Dark Mode
    useEffect(() => {
        const root = window.document.documentElement;
        const applyDarkMode = (isDark: boolean) => {
             if (isDark) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        };

        if (darkMode === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            applyDarkMode(mediaQuery.matches);
            const listener = (e: MediaQueryListEvent) => applyDarkMode(e.matches);
            mediaQuery.addEventListener('change', listener);
            return () => mediaQuery.removeEventListener('change', listener);
        } else {
            applyDarkMode(darkMode === 'dark');
        }
    }, [darkMode]);


    // Effect for Custom Theme Colors
    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--color-accent', themeSettings.accentColor);
        root.style.setProperty('--color-user-bubble', themeSettings.userBubbleColor);
        root.style.setProperty('--color-model-bubble-bg', themeSettings.modelBubbleColor);
    }, [themeSettings]);
    
    const removeNotification = (id: number) => {
        setNotifications(current => current.filter(n => n.id !== id));
    };

    const addNotification = (notification: { message: string; onUndo?: () => void; duration?: number }) => {
        const id = Date.now();
        setNotifications(current => [...current, { id, ...notification }]);
    };
    
    const handleNavigateToSettings = () => {
        setIsQuickSettingsModalOpen(false);
        setIsCommandPaletteOpen(false);
        setAppView('settings');
        setSettingsSubView('main');
    };

    const handleNavigateToLogs = () => {
        setIsQuickSettingsModalOpen(false);
        setAppView('logs');
    };
    
    const handleBackToMainView = () => {
        setAppView('main');
        setSettingsSubView('main'); // Reset sub-view when leaving settings
    };

    const handleViewFiles = (files: FileReference[], startIndex: number) => {
        setViewingState({ files, startIndex });
    };

    const handleNavigateToMessage = (convId: string, msgId: string) => {
        setInitialScrollTo({ convId, msgId });
        setSelectedConversationId(convId);
    };
    
    const handleEmptyTrash = () => {
        const trashedCount = conversations.filter(c => c.deletedTimestamp).length;
        if (trashedCount > 0) {
            setConversations(convs => convs.filter(c => !c.deletedTimestamp));
            addNotification({ message: `Permanently deleted ${trashedCount} conversation(s).` });
        } else {
            addNotification({ message: 'Trash is already empty.' });
        }
        setSettingsSubView('main');
    };
    
    const handleStartPersonaChat = (persona: Persona) => {
        // Check if a conversation with this persona already exists
        const existingConvo = conversations.find(c => c.type === 'persona_1_on_1' && c.participants?.[0]?.id === persona.id);
        if (existingConvo) {
            setSelectedConversationId(existingConvo.id);
        } else {
            const newConversation: Conversation = {
                id: `conv-${Date.now()}`,
                title: persona.name,
                lastMessage: `Conversation with ${persona.name} started.`,
                timestamp: 'Just now',
                unread: false,
                avatar: persona.avatar,
                pinned: false,
                starred: false,
                type: 'persona_1_on_1',
                participants: [persona],
            };
            setConversations(prev => [newConversation, ...prev]);
            setMessages(prev => ({ ...prev, [newConversation.id]: [] }));
            setSelectedConversationId(newConversation.id);
        }
        setAppView('main');
    };

    const handleCreateGroupChat = (title: string, participants: Persona[]) => {
        const newConversation: Conversation = {
            id: `conv-${Date.now()}`,
            title: title,
            lastMessage: `Group chat created with ${participants.length} persona(s).`,
            timestamp: 'Just now',
            unread: false,
            avatar: 'group',
            pinned: false,
            starred: false,
            type: 'group',
            participants: participants,
        };
        setConversations(prev => [newConversation, ...prev]);
        setMessages(prev => ({ ...prev, [newConversation.id]: [] }));
        setSelectedConversationId(newConversation.id);
        setAppView('main');
    };
    
    const handleNewConversation = (prompt?: string): string => {
        const avatarColors = [
            'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500',
            'bg-pink-500', 'bg-indigo-500', 'bg-red-500', 'bg-teal-500'
        ];
        const randomAvatarColor = () => avatarColors[Math.floor(Math.random() * avatarColors.length)];

        const newConversation: Conversation = {
            id: `conv-${Date.now()}`,
            title: prompt ? `About "${prompt.substring(0, 20)}..."` : 'New Conversation',
            lastMessage: prompt || '',
            timestamp: 'Just now',
            unread: false,
            avatar: randomAvatarColor(),
            pinned: false,
            starred: false,
            type: 'personal',
        };
        setConversations(prev => [newConversation, ...prev]);
        setMessages(prev => ({ ...prev, [newConversation.id]: [] }));
        setSelectedConversationId(newConversation.id);
        setAppView('main');
        if (prompt) {
            setInitialPrompt({ convId: newConversation.id, prompt });
        }
        return newConversation.id;
    };

    const handleUpdateMessages = (conversationId: string, newMessages: ChatItem[]) => {
        // Update the messages for the specific conversation
        setMessages(prev => ({
            ...prev,
            [conversationId]: newMessages
        }));

        // Also update the conversation list item (last message, timestamp)
        const lastMessageItem = newMessages.filter(item => 'role' in item).pop() as Message | undefined;
        if (lastMessageItem) {
            setConversations(prev => prev.map(conv => {
                if (conv.id === conversationId) {
                    return {
                        ...conv,
                        lastMessage: lastMessageItem.content.length > 50 ? `${lastMessageItem.content.substring(0, 50)}...` : lastMessageItem.content,
                        timestamp: lastMessageItem.timestamp,
                    };
                }
                return conv;
            }));
        }
    };

    // --- Conversation List Actions ---
    const handleTogglePin = (conversationId: string) => {
        setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, pinned: !c.pinned } : c));
    };

    const handleToggleStar = (conversationId: string) => {
        setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, starred: !c.starred } : c));
    };

    const handleToggleArchive = (conversationId: string) => {
        setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, archived: !c.archived } : c));
    };

     const handleToggleMute = (conversationId: string) => {
        setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, muted: !c.muted } : c));
        const isMuted = conversations.find(c => c.id === conversationId)?.muted;
        addNotification({ message: isMuted ? 'Conversation unmuted.' : 'Conversation muted.' });
    };

    const handleDeleteConversation = (conversationId: string) => {
        setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, deletedTimestamp: Date.now() } : c));
        if (selectedConversationId === conversationId) {
            setSelectedConversationId(null);
        }
        addNotification({ message: 'Conversation moved to trash.' });
    };

    const handleDuplicateConversation = (conversationId: string) => {
        const originalConvo = conversations.find(c => c.id === conversationId);
        if (!originalConvo) return;

        const newId = `conv-${Date.now()}`;
        const newConversation: Conversation = {
            ...originalConvo,
            id: newId,
            title: `${originalConvo.title} (Copy)`,
            pinned: false, // Don't carry over pin status
        };

        setConversations(prev => [newConversation, ...prev]);
        setMessages(prev => ({ ...prev, [newId]: messages[conversationId] || [] }));
        setSelectedConversationId(newId); // Open the new conversation
    };
    
    const handleApplyLabels = (conversationIds: string[], newLabels: string[]) => {
        setConversations(prev => prev.map(c => {
            if (conversationIds.includes(c.id)) {
                return { ...c, labels: newLabels };
            }
            return c;
        }));
        addNotification({ message: `Labels updated for ${conversationIds.length} conversation(s).` });
    };

    // --- Message Actions ---
    const handleToggleMessagePin = (conversationId: string, messageId: string) => {
        setMessages(prev => {
            const currentMessages = prev[conversationId].map(item => {
                // FIX: Add 'role' in item to type-guard and ensure we are only modifying Messages, not DateSeparators.
                if ('role' in item && item.id === messageId) {
                    return { ...item, pinned: !item.pinned };
                }
                return item;
            });
            return { ...prev, [conversationId]: currentMessages };
        });
    };

    const handleSaveMessageEdit = (conversationId: string, messageId: string, newContent: string) => {
         setMessages(prev => {
            const currentMessages = prev[conversationId].map(item => {
                if ('id' in item && item.id === messageId) {
                    return { ...item, content: newContent };
                }
                return item;
            });
            return { ...prev, [conversationId]: currentMessages };
        });
    };


    // --- Command Palette Handlers ---
    const handleNewChatFromPalette = () => {
        setAppView('newChat');
        setIsCommandPaletteOpen(false);
    };

    const handleToggleDarkMode = () => {
        const modes: DarkMode[] = ['system', 'light', 'dark'];
        const currentIndex = modes.indexOf(darkMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        setDarkMode(modes[nextIndex]);
        setIsCommandPaletteOpen(false);
    };

    const handleApplyFilter = (filter: string) => {
        if (filter === 'All') {
            setActiveFilters(['All']);
        } else {
            setActiveFilters(prev => {
                const newFilters = new Set(prev.filter(f => f !== 'All'));
                if (newFilters.has(filter)) {
                    newFilters.delete(filter);
                } else {
                    newFilters.add(filter);
                }
                return newFilters.size === 0 ? ['All'] : Array.from(newFilters);
            });
        }
        setSelectedConversationId(null);
        setAppView('main');
        setIsCommandPaletteOpen(false);
    };
    
    // --- Label Management Handlers ---
    const handleSaveLabel = (labelToSave: Label) => {
        setLabels(prev => {
            const existing = prev.find(l => l.id === labelToSave.id);
            if (existing) {
                return prev.map(l => l.id === labelToSave.id ? labelToSave : l);
            }
            return [...prev, { ...labelToSave, id: Date.now().toString() }];
        });
    };

    const handleDeleteLabel = (labelId: string) => {
        setLabels(prev => prev.filter(l => l.id !== labelId));
    };

    // --- Dashboard Prompt Starter Handler ---
    const handleDashboardPrompt = (prompt: string) => {
        handleNewConversation(prompt);
    };


    const selectedConversation: Conversation | null = selectedConversationId
        ? conversations.find(c => c.id === selectedConversationId) ?? null
        : null;

    const renderCurrentView = () => {
        switch (appView) {
            case 'settings':
                return renderSettings();
            case 'logs':
                return <LogView onBack={handleBackToMainView} />;
            case 'createGroup':
                return <CreateGroupChatView personas={mockPersonas} onBack={() => setAppView('newChat')} onCreate={handleCreateGroupChat} />;
            case 'personas':
                return <PersonasView 
                            personas={mockPersonas}
                            onBack={() => setAppView('settings')}
                            onStartPersonaChat={handleStartPersonaChat}
                        />;
            case 'newChat':
                return <NewChatView 
                            personas={mockPersonas}
                            onBack={() => setAppView('main')}
                            onStartPersonaChat={handleStartPersonaChat}
                            onStartGroupChat={() => setAppView('createGroup')}
                            onStartNewConversation={() => handleNewConversation()}
                        />;
            case 'main':
            default:
                return (
                    <div className="flex h-full w-full">
                        <div className={`md:flex md:w-96 flex-shrink-0 h-full ${selectedConversationId ? 'hidden' : 'flex'} w-full`}>
                            <ListView 
                                conversations={conversations}
                                setConversations={setConversations}
                                allLabels={labels}
                                onConversationSelect={(id) => {
                                    setSelectedConversationId(id);
                                    setInitialScrollTo(null);
                                }}
                                onNavigateToMessage={handleNavigateToMessage}
                                theme={theme}
                                density={density}
                                lineCount={lineCount}
                                onOpenQuickSettings={() => setIsQuickSettingsModalOpen(true)}
                                addNotification={addNotification}
                                trashRetentionDays={trashRetentionDays}
                                onStartNewChat={() => setAppView('newChat')}
                                activeFilters={activeFilters}
                                setActiveFilters={setActiveFilters}
                                onTogglePin={handleTogglePin}
                                onToggleStar={handleToggleStar}
                                onToggleArchive={handleToggleArchive}
                                onDuplicate={handleDuplicateConversation}
                                onDelete={handleDeleteConversation}
                                onApplyLabels={handleApplyLabels}
                            />
                        </div>
                        <div className={`flex-grow h-full ${selectedConversationId ? 'flex' : 'hidden'} md:flex`}>
                            <ChatView 
                                conversation={selectedConversation} 
                                messages={messages[selectedConversationId ?? ''] ?? []}
                                onUpdateMessages={handleUpdateMessages}
                                onBack={() => setSelectedConversationId(null)}
                                theme={theme}
                                onViewFile={handleViewFiles}
                                conversations={conversations}
                                onConversationSelect={setSelectedConversationId}
                                onDashboardPrompt={handleDashboardPrompt}
                                initialScrollToMessageId={initialScrollTo?.convId === selectedConversationId ? initialScrollTo.msgId : null}
                                onDidScrollToMessage={() => setInitialScrollTo(null)}
                                initialPrompt={initialPrompt?.convId === selectedConversationId ? initialPrompt.prompt : undefined}
                                onClearInitialPrompt={() => setInitialPrompt(null)}
                                onToggleMessagePin={(messageId) => selectedConversationId && handleToggleMessagePin(selectedConversationId, messageId)}
                                onSaveMessageEdit={(messageId, newContent) => selectedConversationId && handleSaveMessageEdit(selectedConversationId, messageId, newContent)}
                                onDelete={() => selectedConversationId && handleDeleteConversation(selectedConversationId)}
                                onToggleMute={() => selectedConversationId && handleToggleMute(selectedConversationId)}
                                autoPlayTTS={autoPlayTTS}
                                onSpeak={ttsService.speak}
                            />
                        </div>
                    </div>
                );
        }
    };
    
    const renderSettings = () => {
        switch (settingsSubView) {
            case 'labels':
                return <ManageLabelsView onBack={() => setSettingsSubView('main')} labels={labels} onSave={handleSaveLabel} onDelete={handleDeleteLabel} />;
            case 'advanced':
                return <AdvancedSettingsView onBack={() => setSettingsSubView('main')} />;
            case 'trash':
                return (
                    <TrashSettingsView
                        onBack={() => setSettingsSubView('main')}
                        trashRetentionDays={trashRetentionDays}
                        setTrashRetentionDays={setTrashRetentionDays}
                        onEmptyTrash={handleEmptyTrash}
                        onNavigateToTrashItems={() => setSettingsSubView('trashItems')}
                    />
                );
            case 'trashItems':
                 return (
                    <TrashView
                        onBack={() => setSettingsSubView('trash')}
                        conversations={conversations}
                        setConversations={setConversations}
                        addNotification={addNotification}
                        trashRetentionDays={trashRetentionDays}
                    />
                );
            case 'main':
            default:
                return (
                    <SettingsView 
                        onBack={handleBackToMainView} 
                        onNavigateToLabels={() => setSettingsSubView('labels')}
                        onNavigateToAdvanced={() => setSettingsSubView('advanced')}
                        onNavigateToTrash={() => setSettingsSubView('trash')}
                        onNavigateToPersonas={() => setAppView('personas')}
                        themeSettings={themeSettings}
                        setThemeSettings={setThemeSettings}
                        darkMode={darkMode}
                        setDarkMode={setDarkMode}
                        theme={theme}
                        setTheme={setTheme}
                        autoPlayTTS={autoPlayTTS}
                        setAutoPlayTTS={setAutoPlayTTS}
                        temperature={temperature}
                        setTemperature={setTemperature}
                    />
                );
        }
    };
    
    // This logic needs to be aware of the new 'system' darkMode option.
    const isActuallyDarkMode = darkMode === 'dark' || (darkMode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const appBgClass = isActuallyDarkMode
        ? `text-gray-100 ${theme === 'oled' ? 'bg-black' : 'bg-gray-900'}`
        : 'bg-white text-gray-900';

    return (
        <div className={`h-screen w-screen flex flex-col md:flex-row overflow-hidden ${appBgClass}`}>
            {renderCurrentView()}

            <QuickSettingsModal 
                isOpen={isQuickSettingsModalOpen}
                onClose={() => setIsQuickSettingsModalOpen(false)}
                density={density}
                setDensity={setDensity}
                lineCount={lineCount}
                setLineCount={setLineCount}
                temperature={temperature}
                setTemperature={setTemperature}
                onNavigateToSettings={handleNavigateToSettings}
                onNavigateToLogs={handleNavigateToLogs}
            />
            
            <FileViewerModal 
                viewingState={viewingState}
                onClose={() => setViewingState(null)}
            />

            <CommandPalette
                isOpen={isCommandPaletteOpen}
                onClose={() => setIsCommandPaletteOpen(false)}
                conversations={conversations}
                onNavigate={(id) => {
                    setSelectedConversationId(id);
                    setAppView('main');
                    setIsCommandPaletteOpen(false);
                }}
                onNavigateToSettings={handleNavigateToSettings}
                onNewChat={handleNewChatFromPalette}
                onToggleDarkMode={handleToggleDarkMode}
                onApplyFilter={handleApplyFilter}
            />
            
            <NotificationHost notifications={notifications} onDismiss={removeNotification} />
        </div>
    );
};

export default App;