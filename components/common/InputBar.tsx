import React, { useState, useRef, useEffect } from 'react';
import { PaperClipIcon, MicrophoneIcon, PaperAirplaneIcon, XIcon, FileIcon, PlayIcon, ImageIcon, CameraIcon, BotIcon, LibraryIcon, PlugIcon, GraduationCapIcon, GlobeIcon, CommandIcon, AudioWaveformIcon } from './Icons';
import { FileReference, LocalAttachment, Message } from '../../types';

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const AttachmentPreview: React.FC<{
    attachment: LocalAttachment;
    onRemove: () => void;
    onView: () => void;
}> = ({ attachment, onRemove, onView }) => {
    const isMedia = attachment.file.type.startsWith('image/') || attachment.file.type.startsWith('video/');
    const isVideo = attachment.file.type.startsWith('video/');

    return (
        <div className="relative w-20 h-20 bg-gray-800 rounded-lg overflow-hidden group flex-shrink-0">
            {isMedia && attachment.previewUrl ? (
                <>
                    {isVideo ? (
                        <video src={attachment.previewUrl} className="w-full h-full object-cover" />
                    ) : (
                        <img src={attachment.previewUrl} alt={attachment.file.name} className="w-full h-full object-cover" />
                    )}
                    {isVideo && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
                            <PlayIcon size={24} className="text-white" />
                        </div>
                    )}
                    <div 
                        onClick={onView} 
                        className="absolute inset-0 bg-transparent cursor-pointer"
                        aria-label={`View ${attachment.file.name}`}
                    ></div>
                </>
            ) : (
                 <div 
                    onClick={onView} 
                    className="w-full h-full flex flex-col items-center justify-center p-2 text-center cursor-pointer"
                    aria-label={`View ${attachment.file.name}`}
                 >
                    <FileIcon size={24} className="text-gray-400 mb-1" />
                    <p className="text-xs font-medium text-gray-300 leading-tight break-all line-clamp-2">{attachment.file.name}</p>
                 </div>
            )}
            
            <button
                onClick={onRemove}
                className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white/80 hover:text-white hover:bg-black/80 backdrop-blur-sm transition-all z-10"
                aria-label={`Remove ${attachment.file.name}`}
            >
                <XIcon size={12} />
            </button>
             <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-lg pointer-events-none"></div>
        </div>
    );
};

const SlashCommandMenu: React.FC<{ onSelect: (command: string) => void }> = ({ onSelect }) => {
    const commands = [
        { icon: <ImageIcon size={16} />, label: 'Generate Image', command: '/image ' },
        { icon: <GlobeIcon size={16} />, label: 'Web Search', command: '/search ' },
        { icon: <LibraryIcon size={16} />, label: 'Deep Research', command: '/research ' }
    ];

    return (
        <div className="absolute bottom-full mb-2 w-72 bg-gray-700 rounded-lg p-2 shadow-lg animate-scale-in origin-bottom-left z-20">
            <p className="text-xs font-semibold text-gray-400 px-2 pb-1">Commands</p>
            {commands.map(cmd => (
                 <button
                    key={cmd.label}
                    onClick={() => onSelect(cmd.command)}
                    className="w-full flex items-center p-2 text-sm text-gray-200 hover:bg-gray-600/80 rounded-md transition-colors text-left"
                >
                    <span className="mr-3 text-gray-400 p-1.5 bg-gray-800 rounded-md">{cmd.icon}</span>
                    <span>{cmd.label}</span>
                </button>
            ))}
        </div>
    );
};

interface InputBarProps {
    text: string;
    setText: (text: string) => void;
    attachments: LocalAttachment[];
    setAttachments: (attachments: LocalAttachment[]) => void;
    onSend: () => void;
    onViewFile: (files: FileReference[], startIndex: number) => void;
    replyingTo: Message | null;
    onCancelReply: () => void;
    disabled?: boolean;
    onCommand?: (command: string) => void;
}

const InputBar: React.FC<InputBarProps> = ({ text, setText, attachments, setAttachments, onSend, onViewFile, replyingTo, onCancelReply, disabled, onCommand }) => {
    const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
    const [isSlashCommandMenuOpen, setIsSlashCommandMenuOpen] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null); // Using `any` for SpeechRecognition for cross-browser compatibility

    const fileInputRef = useRef<HTMLInputElement>(null);
    const mediaInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const attachmentButtonRef = useRef<HTMLButtonElement>(null);
    const attachmentMenuRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        // Auto-resize textarea
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = `${scrollHeight}px`;
        }
    }, [text]);
    
     useEffect(() => {
        // Revoke object URLs on unmount
        return () => {
            attachments.forEach(att => {
                if (att.previewUrl) {
                    URL.revokeObjectURL(att.previewUrl);
                }
            });
        };
    }, [attachments]);

    // Focus textarea when starting to reply
    useEffect(() => {
        if (replyingTo) {
            textareaRef.current?.focus();
        }
    }, [replyingTo]);

    // Click outside handler for attachment menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                attachmentMenuRef.current && !attachmentMenuRef.current.contains(event.target as Node) &&
                attachmentButtonRef.current && !attachmentButtonRef.current.contains(event.target as Node)
            ) {
                setIsAttachmentMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const newFiles = Array.from(event.target.files).map(file => {
                const isMedia = file.type.startsWith('image/') || file.type.startsWith('video/');
                return {
                    file,
                    previewUrl: isMedia ? URL.createObjectURL(file) : undefined
                };
            });
            setAttachments([...attachments, ...newFiles]);
        }
        event.target.value = '';
    };

    const removeAttachment = (index: number) => {
        const attachmentToRemove = attachments[index];
        if (attachmentToRemove.previewUrl) {
            URL.revokeObjectURL(attachmentToRemove.previewUrl);
        }
        setAttachments(attachments.filter((_, i) => i !== index));
    };

    const handleViewFile = (index: number) => {
        const fileRefs: FileReference[] = attachments.map(att => ({
            name: att.file.name,
            size: att.file.size,
            type: att.file.type,
            file: att.file,
            url: att.previewUrl
        }));
        onViewFile(fileRefs, index);
    };
    
    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            onSend();
        } else if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            onSend();
        }
    };
    
     const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newText = e.target.value;
        setText(newText);

        if (newText.startsWith('/') && newText.trim().length === 1) {
            setIsSlashCommandMenuOpen(true);
        } else {
            setIsSlashCommandMenuOpen(false);
        }
        
        // Command detection
        if (newText.trim() === '/image') {
            onCommand?.('image');
        } else if (newText.trim() === '/search') {
            onCommand?.('search');
        } else if (newText.trim() === '/research') {
            onCommand?.('research');
        }
    };
    
    const handleCommandSelect = (command: string) => {
        setText(command);
        setIsSlashCommandMenuOpen(false);
        textareaRef.current?.focus();
    };

    const handleMicClick = () => {
        // FIX: Cast window to `any` to access non-standard SpeechRecognition APIs without TypeScript errors.
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Speech recognition not supported in this browser.");
            return;
        }

        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsListening(true);
        };
        recognition.onend = () => {
            setIsListening(false);
        };
        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsListening(false);
        };

        recognition.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            // Update with final transcript, maybe append to existing text
             if (finalTranscript) {
                // FIX: The `setText` prop expects a string, not a function. Use the `text` prop to construct the new value.
                setText((text ? text + ' ' : '') + finalTranscript);
            }
        };

        recognition.start();
    };

    const AttachmentMenuItem: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; }> = ({ icon, label, onClick }) => (
        <button
            onClick={onClick}
            className="flex flex-col items-center justify-center p-3 text-sm text-center text-gray-200 hover:bg-gray-700/60 rounded-lg transition-colors
                       md:flex-row md:justify-start md:text-left md:py-2.5 md:px-3 md:rounded-md"
        >
            <span className="p-3 bg-gray-600/80 rounded-full mb-2 md:bg-transparent md:p-0 md:mr-3 md:mb-0 text-white md:text-gray-400">{icon}</span>
            {label}
        </button>
    );
    
    const ActionListItem: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; }> = ({ icon, label, onClick }) => (
        <button
            onClick={onClick}
            className="flex w-full items-center p-3 text-sm text-gray-200 hover:bg-gray-700/60 rounded-lg transition-colors text-left md:px-3 md:py-2.5"
        >
            <span className="mr-3 text-gray-400">{icon}</span>
            {label}
        </button>
    );

    return (
        <div className="relative flex flex-col">
            {isSlashCommandMenuOpen && <SlashCommandMenu onSelect={handleCommandSelect} />}
             {attachments.length > 0 && (
                <div className="mb-3 p-2 bg-gray-800 rounded-lg">
                    <div className="flex space-x-2 overflow-x-auto no-scrollbar">
                        {attachments.map((att, index) => (
                           <AttachmentPreview 
                                key={index} 
                                attachment={att} 
                                onRemove={() => removeAttachment(index)}
                                onView={() => handleViewFile(index)}
                           />
                        ))}
                    </div>
                </div>
            )}
             {replyingTo && (
                <div className="flex items-center justify-between p-2 pl-3 mb-2 bg-gray-900/70 rounded-lg animate-scale-in origin-bottom">
                    <div className="overflow-hidden">
                        <p className="text-xs font-semibold text-accent">
                            Replying to {replyingTo.role === 'user' ? 'yourself' : 'Model'}
                        </p>
                        <p className="text-sm text-gray-400 line-clamp-1">{replyingTo.content}</p>
                    </div>
                    <button onClick={onCancelReply} className="p-1.5 ml-2 rounded-full hover:bg-gray-700 flex-shrink-0" aria-label="Cancel reply">
                        <XIcon size={16} />
                    </button>
                </div>
            )}
            <div className="relative flex items-end bg-gray-800 rounded-2xl p-2">
                 {isAttachmentMenuOpen && (
                    <>
                        <div 
                            onClick={() => setIsAttachmentMenuOpen(false)}
                            className="fixed inset-0 bg-black/50 z-10 md:hidden"
                            aria-hidden="true"
                        />
                        <div 
                            ref={attachmentMenuRef} 
                            className="fixed bottom-0 left-0 right-0 bg-gray-800 rounded-t-2xl shadow-lg p-4 z-20 animate-slide-in-up 
                                       md:absolute md:bottom-16 md:left-0 md:right-auto md:w-60 md:bg-gray-700 md:rounded-lg md:p-2 md:animate-scale-in md:origin-bottom-left"
                        >
                            <div className="flex flex-col items-center md:hidden mb-4">
                                <div className="w-10 h-1.5 bg-gray-600 rounded-full mb-3"></div>
                                <h3 className="text-lg font-semibold text-white">What can I help with?</h3>
                            </div>
                            <div className="grid grid-cols-3 gap-4 md:grid-cols-1 md:gap-1">
                                <AttachmentMenuItem 
                                    icon={<CameraIcon size={20} />} 
                                    label="Camera" 
                                    onClick={() => { mediaInputRef.current?.click(); setIsAttachmentMenuOpen(false); }} 
                                />
                                <AttachmentMenuItem 
                                    icon={<ImageIcon size={20} />} 
                                    label="Photos" 
                                    onClick={() => { cameraInputRef.current?.click(); setIsAttachmentMenuOpen(false); }} 
                                />
                                <AttachmentMenuItem 
                                    icon={<FileIcon size={20} />} 
                                    label="Files" 
                                    onClick={() => { fileInputRef.current?.click(); setIsAttachmentMenuOpen(false); }} 
                                />
                            </div>
                            <div className="my-2 border-t border-gray-700/50 md:border-gray-600/80"></div>
                            <div className="flex flex-col gap-1">
                                <ActionListItem 
                                    icon={<BotIcon size={20} />}
                                    label="Agent mode"
                                    onClick={() => { alert('Agent mode not implemented yet.'); setIsAttachmentMenuOpen(false); }}
                                />
                                <ActionListItem 
                                    icon={<LibraryIcon size={20} />}
                                    label="Deep research"
                                    onClick={() => { setText('/research '); setIsAttachmentMenuOpen(false); textareaRef.current?.focus(); }}
                                />
                                <ActionListItem 
                                    icon={<PlugIcon size={20} />}
                                    label="Use connectors"
                                    onClick={() => { alert('Connectors not implemented yet.'); setIsAttachmentMenuOpen(false); }}
                                />
                                <ActionListItem 
                                    icon={<GraduationCapIcon size={20} />}
                                    label="Study and learn"
                                    onClick={() => { alert('Study mode not implemented yet.'); setIsAttachmentMenuOpen(false); }}
                                />
                                <ActionListItem 
                                    icon={<ImageIcon size={20} />}
                                    label="Create image"
                                    onClick={() => { setText('/image '); setIsAttachmentMenuOpen(false); textareaRef.current?.focus(); }}
                                />
                                <ActionListItem 
                                    icon={<GlobeIcon size={20} />}
                                    label="Web search"
                                    onClick={() => { setText('/search '); setIsAttachmentMenuOpen(false); textareaRef.current?.focus(); }}
                                />
                            </div>
                        </div>
                    </>
                )}
                <button 
                    ref={attachmentButtonRef}
                    onClick={() => setIsAttachmentMenuOpen(prev => !prev)}
                    className="p-2.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors self-center disabled:opacity-50"
                    aria-label="Attach file"
                    disabled={disabled}
                >
                    <PaperClipIcon size={22} />
                </button>
                <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip"
                    disabled={disabled}
                />
                 <input
                    type="file"
                    multiple
                    ref={mediaInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,video/*,audio/*"
                    disabled={disabled}
                />
                 <input
                    type="file"
                    ref={cameraInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,video/*"
                    capture="environment"
                    disabled={disabled}
                />

                <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={handleTextChange}
                    onKeyDown={handleKeyDown}
                    placeholder={disabled ? "Generating response..." : "Type a message or / for commands..."}
                    rows={1}
                    className="flex-grow bg-transparent focus:ring-0 border-0 resize-none py-2.5 px-3 text-base text-white placeholder-gray-400 max-h-48 no-scrollbar disabled:opacity-50"
                    disabled={disabled}
                />

                <button onClick={handleMicClick} className={`p-2.5 rounded-full transition-colors self-center disabled:opacity-50 ${isListening ? 'text-red-500 bg-red-500/10' : 'text-gray-400 hover:text-white hover:bg-gray-700'}`} aria-label="Use microphone" disabled={disabled}>
                    {isListening ? <AudioWaveformIcon size={22} /> : <MicrophoneIcon size={22} />}
                </button>

                <button 
                    onClick={onSend}
                    disabled={disabled || (!text.trim() && attachments.length === 0)}
                    className="ml-2 p-2.5 rounded-full transition-colors self-end disabled:opacity-50 disabled:cursor-not-allowed bg-accent text-white enabled:hover:opacity-80"
                    aria-label="Send message"
                >
                    <PaperAirplaneIcon size={22} className="-rotate-45" />
                </button>
            </div>
        </div>
    );
};

export default InputBar;