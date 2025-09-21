import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Conversation, Message, FileReference, ChatItem, LocalAttachment, Persona, Attachment } from '../../types';
import MessageComponent from '../common/Message';
import InputBar from '../common/InputBar';
import { Theme } from '../../App';
import * as Icons from '../common/Icons';
import ChatSettingsModal from '../common/ChatSettingsModal';
import ConversationDetailsView from './ConversationDetailsView';
import DashboardView from './DashboardView';
import { streamResponse, generateVideo } from '../../services/geminiService';

const TypingIndicator: React.FC = () => (
    <div className="flex my-6 items-start gap-3">
        <div className="table table-fixed w-full">
            <div className="flex flex-col items-start">
                <div className="flex items-center space-x-2 px-4 py-3 bg-gray-800 rounded-2xl rounded-bl-none max-w-xs">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-[pulse_1.5s_cubic-bezier(0.4,0,0.6,1)_infinite]"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-[pulse_1.5s_cubic-bezier(0.4,0,0.6,1)_infinite_0.2s]"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-[pulse_1.5s_cubic-bezier(0.4,0,0.6,1)_infinite_0.4s]"></div>
                </div>
            </div>
        </div>
    </div>
);

const videoGenerationMessages = [
    "Warming up the video generators...",
    "Scripting the perfect scene...",
    "Casting the digital actors...",
    "Rendering frame by frame...",
    "Applying final cinematic touches...",
    "This can take a few minutes...",
    "Syncing audio and visuals...",
    "Almost there, just polishing the lens...",
];

const VideoGeneratingIndicator: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex my-6 items-start gap-3 animate-pulse">
        <div className="flex flex-col items-start w-full">
            <div className="flex items-center space-x-3 px-4 py-3 bg-gray-800 rounded-2xl rounded-bl-none max-w-sm">
                 <div className="w-5 h-5 border-2 border-gray-500 border-t-gray-300 rounded-full animate-spin"></div>
                <span className="text-sm text-gray-300">{message}</span>
            </div>
        </div>
    </div>
);


interface ChatViewProps {
    conversation: Conversation | null;
    messages: ChatItem[];
    onUpdateMessages: (conversationId: string, messages: ChatItem[]) => void;
    onBack: () => void;
    theme: Theme;
    onViewFile: (files: FileReference[], startIndex: number) => void;
    conversations: Conversation[];
    onConversationSelect: (id: string) => void;
    onDashboardPrompt: (prompt: string) => void;
    initialScrollToMessageId?: string | null;
    onDidScrollToMessage?: () => void;
    initialPrompt?: string;
    onClearInitialPrompt: () => void;
    onToggleMessagePin?: (messageId: string) => void;
    onSaveMessageEdit?: (messageId: string, newContent: string) => void;
    onDelete: () => void;
    onToggleMute: () => void;
    autoPlayTTS: boolean;
    onSpeak: (text: string) => void;
}

const ChatView: React.FC<ChatViewProps> = ({
    conversation,
    messages,
    onUpdateMessages,
    onBack,
    theme,
    onViewFile,
    conversations,
    onConversationSelect,
    onDashboardPrompt,
    initialScrollToMessageId,
    onDidScrollToMessage,
    initialPrompt,
    onClearInitialPrompt,
    onToggleMessagePin,
    onSaveMessageEdit,
    onDelete,
    onToggleMute,
    autoPlayTTS,
    onSpeak,
}) => {
    const scrollContainerRef = useRef<HTMLElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messageRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
    
    const [inputText, setInputText] = useState('');
    const [attachments, setAttachments] = useState<LocalAttachment[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [smartReplies, setSmartReplies] = useState<string[]>([]);
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);
    
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isDetailsViewOpen, setIsDetailsViewOpen] = useState(false);
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
    const [isModelSelectorModalOpen, setIsModelSelectorModalOpen] = useState(false);
    
    const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
    const [videoGenerationMessage, setVideoGenerationMessage] = useState(videoGenerationMessages[0]);
    const generationMessageIntervalRef = useRef<number | null>(null);

    // State for message editing
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');

    const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    const handleSend = async () => {
        if (!conversation || (isGenerating || isGeneratingVideo) || (inputText.trim() === '' && attachments.length === 0)) return;

        const userMessage: Message = {
            id: `m-${Date.now()}`,
            role: 'user',
            content: inputText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            attachments: attachments.map(a => ({ name: a.file.name, size: a.file.size, type: a.file.type, url: a.previewUrl })),
            replyTo: replyingTo?.id,
            quotedMessage: replyingTo ? { role: replyingTo.role, content: replyingTo.content } : undefined,
        };
        const currentAttachments = [...attachments];
        const updatedMessages = [...messages, userMessage];
        onUpdateMessages(conversation.id, updatedMessages);
        
        setInputText('');
        setAttachments([]);
        setSmartReplies([]);
        setReplyingTo(null);
        
        setTimeout(() => scrollToBottom('smooth'), 100);

        // --- VIDEO GENERATION LOGIC ---
        if (selectedModel === 'veo-2.0-generate-001') {
            setIsGeneratingVideo(true);
            let messageIndex = 0;
            setVideoGenerationMessage(videoGenerationMessages[messageIndex]);
            generationMessageIntervalRef.current = window.setInterval(() => {
                messageIndex = (messageIndex + 1) % videoGenerationMessages.length;
                setVideoGenerationMessage(videoGenerationMessages[messageIndex]);
            }, 4000); // Change message every 4 seconds

            try {
                // Veo only supports one optional image input
                const videoAttachment = await generateVideo(userMessage.content, currentAttachments[0]);
                const modelMessage: Message = {
                    id: `m-${Date.now() + 1}`,
                    role: 'model',
                    content: `Here is the video you requested.`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    attachments: [videoAttachment],
                };
                if (autoPlayTTS) onSpeak(modelMessage.content);
                onUpdateMessages(conversation.id, [...updatedMessages, modelMessage]);

            } catch (error) {
                console.error("Error generating video:", error);
                const errorMessage: Message = {
                    id: `err-${Date.now()}`,
                    role: 'model',
                    content: 'Sorry, I encountered an error during video generation. Please check the console for details.',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                };
                onUpdateMessages(conversation.id, [...updatedMessages, errorMessage]);
            } finally {
                setIsGeneratingVideo(false);
                if (generationMessageIntervalRef.current) {
                    clearInterval(generationMessageIntervalRef.current);
                    generationMessageIntervalRef.current = null;
                }
            }
            return; // End execution here for video
        }

        // --- EXISTING TEXT STREAMING LOGIC ---
        setIsGenerating(true);
        let modelResponseText = '';
        
        try {
            const currentHistory = messages.filter(item => 'role' in item) as Message[];
            const responseStream = await streamResponse(currentHistory, currentAttachments, userMessage.content);

            let firstChunk = true;
            const modelMessageId = `m-${Date.now() + 1}`;
            let finalMessages = updatedMessages;

            for await (const chunk of responseStream) {
                if (firstChunk) {
                    const modelResponsePlaceholder: Message = {
                        id: modelMessageId,
                        role: 'model',
                        content: '',
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    };
                    finalMessages = [...updatedMessages, modelResponsePlaceholder];
                    firstChunk = false;
                }

                modelResponseText += chunk.text;
                const updatedModelMessage = {
                    ...finalMessages[finalMessages.length - 1] as Message,
                    content: modelResponseText,
                };
                
                finalMessages = [...finalMessages.slice(0, -1), updatedModelMessage];
                onUpdateMessages(conversation.id, finalMessages);
                scrollToBottom('smooth');
            }
             if (firstChunk) {
                // Handle case where stream is empty or returns no text
                console.warn("Received an empty response stream from the API.");
             }

        } catch (error) {
            console.error("Error generating content:", error);
            const errorMessage: Message = {
                id: `err-${Date.now()}`,
                role: 'model',
                content: 'Sorry, I encountered an error. Please check the console for details and ensure your API key is configured correctly.',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };
            onUpdateMessages(conversation.id, [...updatedMessages, errorMessage]);
        } finally {
            setIsGenerating(false);
            if (autoPlayTTS && modelResponseText) {
                onSpeak(modelResponseText);
            }
            setSmartReplies(['Got it, thanks!', 'Can you explain further?', 'What are the next steps?']);
        }
    };

    const handleRegenerate = async (messageId: string) => {
        if (!conversation || isGenerating) return;

        const messageIndex = messages.findIndex(m => 'id' in m && m.id === messageId);
        if (messageIndex === -1 || messageIndex === 0) return;

        // Find the user prompt that led to this model response
        const userPromptIndex = messages.slice(0, messageIndex).reverse().findIndex(m => 'role' in m && m.role === 'user');
        if (userPromptIndex === -1) return;

        const actualUserPromptIndex = messageIndex - 1 - userPromptIndex;
        const userMessage = messages[actualUserPromptIndex] as Message;
        
        // History only includes messages *before* the user prompt that we're using to regenerate
        const history = messages.slice(0, actualUserPromptIndex).filter(item => 'role' in item) as Message[];

        setIsGenerating(true);
        let modelResponseText = '';

        try {
             // We need to find the attachments from the original user message
            const originalAttachments: LocalAttachment[] = (userMessage.attachments || []).map(att => ({
                // This is a simplification. In a real app, you'd need a way to get the File object back.
                // For this implementation, we assume regeneration won't re-use files, only text.
                // A better implementation would store file handles or use a file service.
                file: new File([], att.name, { type: att.type })
            }));

            const responseStream = await streamResponse(history, originalAttachments, userMessage.content);

            for await (const chunk of responseStream) {
                modelResponseText += chunk.text;
                const updatedMessages = messages.map(item => {
                    if ('id' in item && item.id === messageId) {
                        return { ...item, content: modelResponseText };
                    }
                    return item;
                });
                onUpdateMessages(conversation.id, updatedMessages);
                scrollToBottom('smooth');
            }
        } catch (error) {
             console.error("Error regenerating content:", error);
        } finally {
            setIsGenerating(false);
            if (autoPlayTTS && modelResponseText) {
                onSpeak(modelResponseText);
            }
        }
    };
    
    // --- Message Action Handlers ---
    const handleStartEdit = (message: Message) => {
        setEditingMessageId(message.id);
        setEditText(message.content);
    };

    const handleCancelEdit = () => {
        setEditingMessageId(null);
        setEditText('');
    };

    const handleSaveEdit = () => {
        if (editingMessageId && onSaveMessageEdit) {
            onSaveMessageEdit(editingMessageId, editText);
        }
        handleCancelEdit();
    };

    const handleTogglePin = (messageId: string) => {
        onToggleMessagePin?.(messageId);
    };

    const handleCommand = (command: string) => {
        if (command === 'image') {
            setSelectedModel('imagen-4.0-generate-001');
            setInputText(''); // Clear text after command is accepted
        } else if (command === 'search' || command === 'research') {
            alert(`The '/${command}' command is not implemented yet.`);
            setInputText('');
        }
    };

    
    // Drag and drop handlers
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDraggingOver(true);
        }
    };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(false);
    };
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const newFiles = Array.from(e.dataTransfer.files).map(file => {
                const isMedia = file.type.startsWith('image/') || file.type.startsWith('video/');
                return {
                    file,
                    previewUrl: isMedia ? URL.createObjectURL(file) : undefined
                };
            });
            setAttachments(prev => [...prev, ...newFiles]);
        }
    };


    const handleOpenSettings = () => {
        setIsSettingsModalOpen(true);
    };
    
    const handleOpenInfo = () => {
        setIsDetailsViewOpen(true);
    };

    const handleScrollToPrevious = () => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const messageElements = Array.from(messageRefs.current.values()).filter(el => el) as HTMLDivElement[];
        if (messageElements.length === 0) return;

        const containerTop = container.scrollTop;

        const elementsAbove = messageElements.filter(el => {
            return el.offsetTop < containerTop - 1; // -1 to avoid floating point issues
        });

        const target = elementsAbove[elementsAbove.length - 1];
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleScrollToNext = () => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const messageElements = Array.from(messageRefs.current.values()).filter(el => el) as HTMLDivElement[];
        if (messageElements.length === 0) return;

        const containerBottom = container.scrollTop + container.clientHeight;
        const scrollHeight = container.scrollHeight;

        // Find the first message whose top is below the visible area
        const firstElementBelow = messageElements.find(el => {
            // Using a small tolerance (1px) to be safe
            return el.offsetTop >= containerBottom - 1;
        });
        
        if (firstElementBelow) {
            // If there's a message whose top is not yet visible, scroll to it.
            firstElementBelow.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            // If no message is fully below, it means the last message is at least partially visible.
            // Check if we are not already scrolled to the very bottom.
            const isAtVeryBottom = Math.abs(scrollHeight - containerBottom) < 2; // Small threshold for floating point inaccuracies
            if (!isAtVeryBottom) {
                // If not at the bottom, perform the final scroll to the end.
                scrollToBottom('smooth');
            }
        }
    };

    const handleScrollToMessage = useCallback((messageId: string) => {
        const messageElement = messageRefs.current.get(messageId);
        if (messageElement) {
            messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add a temporary highlight effect
            messageElement.classList.add('bg-accent/20', 'transition-all', 'duration-1000', 'ease-out');
            setTimeout(() => {
                messageElement.classList.remove('bg-accent/20');
            }, 1500);
        }
    }, []);


    useEffect(() => {
        if (conversation) {
            setSmartReplies([]);
            setReplyingTo(null);
            setIsGenerating(false);

            if (initialPrompt) {
                setInputText(initialPrompt);
                onClearInitialPrompt();
            }
            
            if (initialScrollToMessageId) {
                setTimeout(() => {
                    handleScrollToMessage(initialScrollToMessageId);
                    onDidScrollToMessage?.();
                }, 100);
            } else {
                setTimeout(() => {
                    scrollToBottom('auto');
                }, 50);
            }
        }
    }, [conversation?.id, initialScrollToMessageId, initialPrompt]);


    if (!conversation) {
        return (
            <div className="flex-grow h-full hidden md:flex flex-col bg-gray-900/50">
                <DashboardView conversations={conversations} onConversationSelect={onConversationSelect} onPromptStarterClick={onDashboardPrompt} />
            </div>
        );
    }
    
    const HeaderAvatar = () => {
        const sizeClasses = "w-10 h-10 text-lg";
        const baseClasses = "rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold";

        if (conversation.type === 'group') {
            return (
                <div className={`${sizeClasses} ${baseClasses} bg-gray-600`}>
                    <Icons.UsersIcon size={20} />
                </div>
            );
        }
        if (conversation.type === 'persona_1_on_1' && conversation.avatar) {
            const IconComponent = (Icons as any)[`${conversation.avatar}Icon`] || Icons.BotIcon;
            return (
                <div className={`${sizeClasses} ${baseClasses} bg-purple-500`}>
                    <IconComponent size={20} />
                </div>
            );
        }
        return (
            <div className={`${sizeClasses} ${baseClasses} ${conversation.avatar}`}>
                {conversation.title.charAt(0)}
            </div>
        );
    };

    const recommendedModels = [
        { 
            id: 'gemini-2.5-flash', 
            name: 'Gemini Flash', 
            description: 'For text, chat, and reasoning.', 
            icon: <Icons.SparklesIcon size={18} />,
            iconBg: 'bg-yellow-500/20 text-yellow-400',
            tags: ['Fastest', 'Recommended']
        },
        { 
            id: 'imagen-4.0-generate-001', 
            name: 'Imagen 4', 
            description: 'For generating high-quality images.', 
            icon: <Icons.ImageIcon size={18} />,
            iconBg: 'bg-blue-500/20 text-blue-400',
            tags: ['Text-to-Image']
        },
        { 
            id: 'gemini-2.5-flash-image-preview', 
            name: 'Gemini Image Preview', 
            description: 'For editing and modifying images.', 
            icon: <Icons.FilePenLineIcon size={18} />,
            iconBg: 'bg-purple-500/20 text-purple-400',
            tags: ['Image Editing']
        },
        { 
            id: 'veo-2.0-generate-001', 
            name: 'Veo 2', 
            description: 'For generating and editing videos.', 
            icon: <Icons.PlayIcon size={18} />,
            iconBg: 'bg-red-500/20 text-red-400',
            tags: ['Text-to-Video']
        },
    ];

    const legacyModels = [
        { 
            id: 'gemini-1.5-pro', 
            name: 'Gemini 1.5 Pro', 
            description: 'Previous-gen powerful, multi-modal model.', 
            icon: <Icons.BrainCircuitIcon size={18} />,
            iconBg: 'bg-indigo-500/20 text-indigo-400',
            tags: ['Legacy', 'Powerful']
        },
        { 
            id: 'gemini-1.5-flash', 
            name: 'Gemini 1.5 Flash', 
            description: 'Previous-gen fast, multi-modal model.', 
            icon: <Icons.SparklesIcon size={18} />,
            iconBg: 'bg-orange-500/20 text-orange-400',
            tags: ['Legacy', 'Fast']
        },
    ];
    
    const allModels = [...recommendedModels, ...legacyModels];
    const currentModel = allModels.find(m => m.id === selectedModel);
    const pinnedMessages = messages.filter(item => 'role' in item && item.pinned) as Message[];

    const handleSmartReplyClick = (reply: string) => {
        setInputText(reply);
        // We'll let the user decide to send.
    };

    const handleReply = (message: Message) => {
        setReplyingTo(message);
    };

    const ModelOption: React.FC<{model: typeof recommendedModels[0]}> = ({ model }) => (
         <button
            key={model.id}
            onClick={() => {
                setSelectedModel(model.id);
                setIsModelSelectorModalOpen(false);
            }}
            className={`w-full text-left p-2 flex items-start gap-3 rounded-md hover:bg-gray-700/60 transition-colors ${selectedModel === model.id ? 'bg-gray-700' : ''}`}
            role="option"
            aria-selected={selectedModel === model.id}
        >
            <div className={`flex-shrink-0 mt-1 p-2 rounded-md ${model.iconBg}`}>{model.icon}</div>
            <div className="flex-grow">
                <div className="flex items-center justify-between">
                    <p className="font-semibold text-white text-sm flex items-center">
                        {model.name}
                    </p>
                    {selectedModel === model.id && <Icons.CheckIcon size={16} className="text-accent" />}
                </div>
                <p className="text-xs text-gray-400 mb-1">{model.description}</p>
                <div className="flex items-center gap-1.5">
                    {model.tags.map(tag => (
                        <span key={tag} className={`px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${tag === 'Recommended' ? 'bg-blue-600/30 text-blue-300' : 'bg-gray-600/50 text-gray-300'}`}>
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </button>
    );

    return (
        <div 
            className="relative flex flex-col h-full w-full bg-gray-900/50"
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            {isDraggingOver && (
                <div className="absolute inset-0 bg-accent/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center pointer-events-none">
                    <Icons.UploadCloudIcon className="text-blue-300" size={64}/>
                    <p className="mt-4 text-xl font-semibold text-white">Drop files to attach</p>
                </div>
            )}
            <header className="flex items-center px-4 py-3 border-b border-gray-700/50 flex-shrink-0 bg-gray-900 z-10">
                 <button onClick={onBack} className="md:hidden mr-2 p-2 rounded-full hover:bg-gray-800">
                    <Icons.ArrowLeftIcon />
                </button>
                <HeaderAvatar />

                <div className="ml-3 flex-grow min-w-0">
                    <h2 className="text-lg font-semibold text-white truncate" title={conversation.title}>
                        {conversation.title}
                    </h2>
                    
                    <div className="relative inline-block">
                        <button 
                            onClick={() => setIsModelSelectorModalOpen(true)}
                            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group"
                            aria-haspopup="dialog"
                            aria-expanded={isModelSelectorModalOpen}
                        >
                             <div className={`flex items-center justify-center w-5 h-5 rounded ${currentModel?.iconBg}`}>
                                {currentModel?.icon}
                             </div>
                            <span className="font-medium text-gray-200">{currentModel?.name}</span>
                        </button>
                    </div>
                </div>
                <div className="ml-auto pl-2">
                    <button onClick={handleOpenSettings} className="p-2 rounded-full hover:bg-gray-800" aria-label="Conversation settings">
                        <Icons.MoreVerticalIcon />
                    </button>
                </div>
            </header>

            <main ref={scrollContainerRef} className="relative flex-grow overflow-y-auto px-4">
                {messages.length > 0 ? (
                    <div className="max-w-4xl mx-auto pb-4">
                        {messages.map(item => {
                            if ('type' in item && item.type === 'date-separator') {
                                return (
                                    <div key={item.id} className="flex items-center justify-center my-4" aria-label={`Date: ${item.content}`}>
                                        <span className="px-3 py-1 text-xs font-semibold text-gray-400 bg-gray-800 rounded-full">{item.content}</span>
                                    </div>
                                );
                            }
                            const message = item as Message;
                            const isEditing = editingMessageId === message.id;
                            return (
                                <MessageComponent
                                    key={message.id}
                                    ref={el => { messageRefs.current.set(message.id, el); }}
                                    message={message}
                                    theme={theme}
                                    isEditing={isEditing}
                                    editText={isEditing ? editText : ''}
                                    setEditText={setEditText}
                                    onSaveEdit={handleSaveEdit}
                                    onCancelEdit={handleCancelEdit}
                                    onViewFile={onViewFile}
                                    onReply={handleReply}
                                    onScrollToMessage={handleScrollToMessage}
                                    onTogglePin={handleTogglePin}
                                    onRegenerate={handleRegenerate}
                                    onEdit={handleStartEdit}
                                />
                            );
                        })}
                        {isGenerating && <TypingIndicator />}
                        {isGeneratingVideo && <VideoGeneratingIndicator message={videoGenerationMessage} />}
                        <div ref={messagesEndRef} className="h-px" />
                    </div>
                ) : (
                    <div className="h-full">
                        <DashboardView 
                            conversations={conversations}
                            onConversationSelect={onConversationSelect}
                            onPromptStarterClick={onDashboardPrompt}
                            showRecents={false}
                        />
                    </div>
                )}
            </main>

            {/* Floating Scroll Buttons */}
            <div className="absolute bottom-24 right-6 z-10 flex flex-col bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg border border-white/10 overflow-hidden animate-scale-in">
                <button
                    onClick={handleScrollToPrevious}
                    className="p-3 text-white transition-colors hover:bg-white/10 border-b border-white/10"
                    aria-label="Scroll to previous message"
                >
                    <Icons.ChevronUpIcon size={20} />
                </button>
                <button
                    onClick={handleScrollToNext}
                    className="p-3 text-white transition-colors hover:bg-white/10"
                    aria-label="Scroll to next message"
                >
                    <Icons.ChevronDownIcon size={20} />
                </button>
            </div>

            <ChatSettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
                conversation={conversation}
                onOpenInfo={handleOpenInfo}
                onDelete={onDelete}
                onToggleMute={onToggleMute}
            />

            <ConversationDetailsView
                conversation={conversation}
                isOpen={isDetailsViewOpen}
                onClose={() => setIsDetailsViewOpen(false)}
                pinnedMessages={pinnedMessages}
                onPinClick={handleScrollToMessage}
                onDelete={onDelete}
                onToggleMute={onToggleMute}
            />

            {isModelSelectorModalOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
                    onClick={() => setIsModelSelectorModalOpen(false)}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="model-selector-title"
                >
                    <div
                        className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-xl animate-scale-in border border-gray-700 flex flex-col max-h-[80vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <header className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
                            <h2 id="model-selector-title" className="text-lg font-semibold text-white">Select a Model</h2>
                            <button onClick={() => setIsModelSelectorModalOpen(false)} className="p-1 rounded-full text-gray-400 hover:bg-gray-700" aria-label="Close">
                                <Icons.XIcon size={20} />
                            </button>
                        </header>
                        <main className="p-2 overflow-y-auto">
                            <div className="p-2">
                                <p className="text-xs font-semibold text-gray-400 px-2 pt-1 pb-1">Recommended</p>
                                {recommendedModels.map(model => (
                                    <ModelOption key={model.id} model={model} />
                                ))}
                                <div className="border-t border-gray-700/50 my-1.5"></div>
                                <p className="text-xs font-semibold text-gray-400 px-2 pt-1 pb-1">Legacy & Specialized</p>
                                {legacyModels.map(model => (
                                    <ModelOption key={model.id} model={model} />
                                ))}
                                <div className="border-t border-gray-700/50 my-1.5"></div>
                                <button
                                    onClick={() => alert('Compare Models page is not implemented yet.')}
                                    className="w-full text-left p-2 flex items-center gap-3 rounded-md hover:bg-gray-700/60 transition-colors text-gray-300 hover:text-white"
                                >
                                    <Icons.LibraryIcon size={16} className="flex-shrink-0" />
                                    <span className="text-xs font-medium">Compare Models</span>
                                </button>
                            </div>
                        </main>
                    </div>
                </div>
            )}

            <footer className="flex-shrink-0 bg-gray-900/80 backdrop-blur-sm border-t border-gray-800/50">
                <div className="max-w-4xl mx-auto px-4 pb-4 pt-2">
                    {smartReplies.length > 0 && !isGenerating && (
                         <div className="flex items-center gap-2 mb-2 overflow-x-auto no-scrollbar pb-1">
                            {smartReplies.map((reply, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSmartReplyClick(reply)}
                                    className="px-3 py-1.5 text-sm font-medium bg-gray-700 text-gray-200 rounded-full whitespace-nowrap hover:bg-gray-600 transition-colors"
                                >
                                    {reply}
                                </button>
                            ))}
                        </div>
                    )}
                    <InputBar 
                        text={inputText}
                        setText={setInputText}
                        attachments={attachments}
                        setAttachments={setAttachments}
                        onSend={handleSend}
                        onViewFile={onViewFile}
                        replyingTo={replyingTo}
                        onCancelReply={() => setReplyingTo(null)}
                        disabled={isGenerating || isGeneratingVideo}
                        onCommand={handleCommand}
                    />
                </div>
            </footer>
        </div>
    );
};

export default ChatView;