import React, { useState, useEffect, useRef, useMemo, forwardRef } from 'react';
import { Message, Attachment, FileReference } from '../../types';
import * as Icons from './Icons';
import PopoverMenu, { PopoverMenuItem } from './PopoverMenu';

declare const marked: any;
declare const hljs: any; // Make highlight.js available

const YouTubePreview: React.FC<{ videoId: string }> = ({ videoId }) => (
    <div className="aspect-video rounded-lg overflow-hidden border border-gray-700/50">
        <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
        ></iframe>
    </div>
);

const ArticleLinkPreview: React.FC<{ url: string }> = ({ url }) => {
    let hostname = '';
    let siteName = '';
    try {
        const urlObj = new URL(url);
        hostname = urlObj.hostname;
        siteName = hostname.replace('www.', '').split('.')[0];
        siteName = siteName.charAt(0).toUpperCase() + siteName.slice(1);
    } catch (e) {
        // invalid URL
    }

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-gray-800/60 hover:bg-gray-800 border border-gray-700/50 rounded-lg p-3 transition-colors duration-200 group h-full"
        >
            <div className="flex items-start">
                 <div className="flex-shrink-0 mr-3 mt-1 p-2.5 bg-gray-700/50 rounded-lg">
                    <Icons.GlobeIcon size={18} className="text-gray-400" />
                </div>
                <div className="flex-grow overflow-hidden">
                    {siteName && <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{siteName}</p>}
                    <p className="text-sm font-medium text-gray-200 mt-0.5 group-hover:text-accent transition-colors break-all">{url}</p>
                </div>
            </div>
        </a>
    );
};

const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/;
const urlRegex = /(https?:\/\/[^\s<>"'()]+)/g;

const extractUrls = (content: string): string[] => {
    const matches = content.match(urlRegex);
    if (!matches) return [];
    return [...new Set(matches)];
};

const parseMessageContent = (content: string) => {
    // This regex splits the content by code blocks, keeping the delimiters.
    const parts = content.split(/(```(\w+)?\n[\s\S]*?```)/g);
    
    return parts.filter(part => part).map((part, index) => {
        const codeBlockMatch = part.match(/```(\w+)?\n([\s\S]*?)```/);
        if (codeBlockMatch) {
            const language = codeBlockMatch[1] || 'plaintext';
            const code = codeBlockMatch[2].trim();
            return { type: 'code' as const, content: code, language, key: `part-${index}` };
        }
        return { type: 'text' as const, content: part, key: `part-${index}` };
    });
};

const LanguageIcon: React.FC<{ language: string }> = ({ language }) => {
    const lang = language.toLowerCase();
    const props = { size: 14, className: "mr-1.5 opacity-80" };
    if (lang === 'python') return <Icons.PythonIcon {...props} />;
    if (['javascript', 'js', 'tsx'].includes(lang)) return <Icons.JavaScriptIcon {...props} />;
    if (lang === 'json') return <Icons.JsonIcon {...props} />;
    if (lang === 'html') return <Icons.HtmlIcon {...props} />;
    if (['shell', 'bash', 'sh'].includes(lang)) return <Icons.TerminalIcon {...props} />;
    return null;
};

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const MediaPreview: React.FC<{
    attachment: Attachment;
    onViewFile: () => void;
}> = ({ attachment, onViewFile }) => {
    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent opening the viewer modal
        if (!attachment.url) return;
        const a = document.createElement('a');
        a.href = attachment.url;
        a.download = attachment.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const isVideo = attachment.type.startsWith('video/');

    return (
        <div
            onClick={onViewFile}
            className="relative aspect-square bg-gray-800 rounded-lg overflow-hidden group transition-transform duration-200 ease-in-out hover:scale-105 cursor-pointer"
            role="button"
            aria-label={`View media ${attachment.name}`}
        >
            <div 
                className="w-full h-full"
            >
                {isVideo ? (
                    <video
                        src={attachment.url}
                        controls
                        onClick={(e) => e.stopPropagation()}
                        className="w-full h-full object-contain bg-black"
                    />
                ) : (
                    <img
                        src={attachment.url}
                        alt={attachment.name}
                        className="w-full h-full object-cover"
                    />
                )}
            </div>
            
            <button
                onClick={handleDownload}
                className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white/80 hover:text-white hover:bg-black/70 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 z-10"
                aria-label={`Download ${attachment.name}`}
                title="Download"
            >
                <Icons.DownloadIcon size={16} />
            </button>
            
            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-lg pointer-events-none"></div>
        </div>
    );
};

const FilePreview: React.FC<{
    attachment: Attachment;
    onViewFile: () => void;
}> = ({ attachment, onViewFile }) => {
    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!attachment.url) return;
        const a = document.createElement('a');
        a.href = attachment.url;
        a.download = attachment.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div
            onClick={onViewFile}
            className="relative aspect-square bg-gray-800/60 rounded-lg overflow-hidden group transition-transform duration-200 ease-in-out hover:scale-105 cursor-pointer border border-gray-700/50"
            role="button"
            aria-label={`View file ${attachment.name}`}
        >
            <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                <Icons.FileIcon size={32} className="text-gray-400 mb-2" />
                <p className="text-xs font-medium text-gray-300 leading-tight break-all line-clamp-2">{attachment.name}</p>
                <p className="text-[10px] text-gray-500 mt-1">{formatBytes(attachment.size)}</p>
            </div>
            
            <button
                onClick={handleDownload}
                className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white/80 hover:text-white hover:bg-black/70 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 z-10"
                aria-label={`Download ${attachment.name}`}
                title="Download"
            >
                <Icons.DownloadIcon size={16} />
            </button>
            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-lg pointer-events-none"></div>
        </div>
    );
};


const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
    const lines = code.split('\n');
    const [isExpanded, setIsExpanded] = useState(true); // Default to expanded
    const [copied, setCopied] = useState(false);
    const [isHeaderSticky, setIsHeaderSticky] = useState(false);
    
    const codeRef = useRef<HTMLElement>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const rootRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        if (isExpanded && codeRef.current) {
            hljs.highlightElement(codeRef.current);
        }
    }, [isExpanded, code, language]);

     useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // When isIntersecting is false, the sentinel is off-screen (scrolled past), so the header is sticky.
                setIsHeaderSticky(!entry.isIntersecting);
            },
            { rootMargin: '0px', threshold: [1.0] } // Observe when the sentinel is fully in or out of view at the top
        );

        const currentSentinel = sentinelRef.current;
        if (currentSentinel) {
            observer.observe(currentSentinel);
        }

        return () => {
            if (currentSentinel) {
                observer.unobserve(currentSentinel);
            }
        };
    }, [isExpanded]); // Rerun observer setup if expanded state changes

    useEffect(() => {
        // After collapsing the code block, we check if it scrolled out of view.
        if (!isExpanded && rootRef.current) {
            const componentRect = rootRef.current.getBoundingClientRect();
            const scrollContainer = rootRef.current.closest('main');
            if (scrollContainer) {
                const containerRect = scrollContainer.getBoundingClientRect();
                // If the top of the collapsed block is now above the visible area, scroll to it.
                if (componentRect.top < containerRect.top) {
                    rootRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }
        }
    }, [isExpanded]);
    
    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        const extensionMap: { [key: string]: string } = {
            tsx: 'tsx',
            json: 'json',
            python: 'py',
            shell: 'sh',
            html: 'html',
            javascript: 'js',
            typescript: 'ts',
        };
        const mimeTypeMap: { [key: string]: string } = {
            tsx: 'text/plain',
            json: 'application/json',
            python: 'text/x-python',
            shell: 'application/x-sh',
            html: 'text/html',
            javascript: 'application/javascript',
            typescript: 'text/typescript',
        };

        const extension = extensionMap[language] || 'txt';
        const mimeType = mimeTypeMap[language] || 'text/plain';
        const filename = `code-snippet.${extension}`;

        const blob = new Blob([code], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    
    const headerClasses = [
        'sticky top-0 z-10 flex justify-between items-center px-4 py-3 text-xs text-gray-400 transition-all duration-200',
        isExpanded ? 'rounded-t-lg' : 'rounded-lg',
        isHeaderSticky
            ? 'shadow-lg shadow-black/30 border-b border-gray-700 bg-gray-900'
            : 'border-b border-gray-700/50 bg-gray-900/80 backdrop-blur-sm'
    ].join(' ');

    return (
        <div ref={rootRef} className="relative border border-gray-700/50 rounded-lg my-4">
            <div ref={sentinelRef} className="absolute top-0 h-px w-full"></div>
            <div className={headerClasses}>
                <div className="flex items-center">
                    <LanguageIcon language={language} />
                    <span>{language}</span>
                </div>
                <div className="flex items-center gap-4">
                     <button onClick={handleDownload} className="flex items-center gap-1.5 text-xs hover:text-white transition-colors">
                        <Icons.DownloadIcon size={14} />
                        Download
                    </button>
                    <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs hover:text-white transition-colors w-24 justify-center">
                        {copied ? <Icons.CheckIcon size={14} className="text-green-400" /> : <Icons.CopyIcon size={14} />}
                        {copied ? <span className="text-green-400">Copied!</span> : 'Copy code'}
                    </button>
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)} 
                        className="flex items-center gap-1.5 text-xs hover:text-white transition-colors"
                    >
                        {isExpanded ? <Icons.ChevronUpIcon size={14} /> : <Icons.ChevronDownIcon size={14} />}
                        {isExpanded ? 'Collapse' : 'Expand'}
                    </button>
                </div>
            </div>
            {isExpanded && (
                <div className="text-sm bg-gray-950/70 rounded-b-lg">
                    <div className="flex py-2">
                        <div className="hidden md:block select-none text-right text-gray-500 pr-3 pl-4 py-3 sticky left-0 bg-gray-950/70">
                            {lines.map((_, i) => <div key={i}>{i + 1}</div>)}
                        </div>
                        <pre className="py-3 px-4 flex-grow whitespace-pre-wrap break-all">
                             <code ref={codeRef} className={`language-${language} text-white/90`}>
                                {code}
                            </code>
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}

// Props for the component
interface MessageComponentProps {
    message: Message;
    theme: string;
    isEditing: boolean;
    editText: string;
    setEditText: (text: string) => void;
    onSaveEdit: () => void;
    onCancelEdit: () => void;
    onViewFile: (files: FileReference[], startIndex: number) => void;
    onReply: (message: Message) => void;
    onScrollToMessage: (messageId: string) => void;
    onTogglePin: (messageId: string) => void;
    onRegenerate: (messageId: string) => void;
    onEdit: (message: Message) => void;
}

const MessageComponent = forwardRef<HTMLDivElement, MessageComponentProps>(({
    message, theme, isEditing, editText, setEditText, onSaveEdit, onCancelEdit,
    onViewFile, onReply, onScrollToMessage, onTogglePin, onRegenerate, onEdit
}, ref) => {
    const isModel = message.role === 'model';
    const attachments = message.attachments || [];
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    const urls = useMemo(() => extractUrls(message.content), [message.content]);
    const parsedParts = useMemo(() => parseMessageContent(message.content), [message.content]);
    
    const hasCodeBlock = parsedParts.some(p => p.type === 'code');
    const hasQuotedMessage = !!message.quotedMessage;
    const isSimpleMessage = !hasCodeBlock && attachments.length === 0 && urls.length === 0 && !hasQuotedMessage;

    const [copied, setCopied] = useState(false);
    const [popoverState, setPopoverState] = useState<{ x: number; y: number } | null>(null);
    const longPressTimeout = useRef<number | null>(null);

    // Auto-resize textarea when editing
    useEffect(() => {
        if (isEditing && textareaRef.current) {
            const el = textareaRef.current;
            el.style.height = 'auto';
            el.style.height = `${el.scrollHeight}px`;
            el.focus();
            el.select();
        }
    }, [isEditing]);


    const handleViewAttachment = (selectedIndex: number) => {
        const fileRefs: FileReference[] = attachments.map(att => ({
            name: att.name,
            size: att.size,
            type: att.type,
            url: att.url,
        }));
        onViewFile(fileRefs, selectedIndex);
    };

    const closePopover = () => setPopoverState(null);

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const clearLongPress = () => {
        if (longPressTimeout.current) {
            clearTimeout(longPressTimeout.current);
            longPressTimeout.current = null;
        }
    };

    const handlePressStart = (e: React.TouchEvent | React.MouseEvent) => {
        if (isEditing) return;
        if ('button' in e && e.button === 2) return; // Ignore right-click
        clearLongPress();
        longPressTimeout.current = window.setTimeout(() => {
            let x, y;
            if ('touches' in e) {
                x = e.touches[0].clientX;
                y = e.touches[0].clientY;
            } else {
                x = e.clientX;
                y = e.clientY;
            }
            setPopoverState({ x, y });
        }, 500); // 500ms for long press
    };

    const handleMove = () => {
        // Cancel long press if user is scrolling
        clearLongPress();
    };
    
    const handleContextMenu = (e: React.MouseEvent) => {
        if (isEditing) return;
        e.preventDefault();
        clearLongPress(); // Prevent long press from firing
        setPopoverState({ x: e.clientX, y: e.clientY });
    };

    let bubbleClasses = '';
    if (isModel) {
        bubbleClasses += 'bg-model-bubble-bg text-model-bubble-text rounded-2xl rounded-bl-none';
    } else {
        bubbleClasses += 'bg-user-bubble text-white rounded-2xl rounded-br-none';
    }
    
    // Add padding to the bubble container ONLY if there are no code blocks.
    // This allows code blocks to be rendered edge-to-edge within the bubble.
    if (!isEditing && (isSimpleMessage || !hasCodeBlock)) {
         bubbleClasses += ' px-4 py-2.5';
    }
    
    const SenderInfo = () => {
        if (!message.sender) return null;
        const IconComponent = (Icons as any)[`${message.sender.avatar}Icon`] || Icons.BotIcon;

        return (
            <div className="flex items-center mb-1.5 px-1">
                <div className="p-1 bg-gray-700/50 rounded-full mr-2">
                    <IconComponent size={14} className="text-gray-300" />
                </div>
                <span className="text-xs font-semibold text-gray-400">{message.sender.name}</span>
            </div>
        );
    };

    const bubbleAndMeta = (
        <div 
            className={`flex flex-col min-w-0 ${isModel ? 'w-full items-start' : 'max-w-2xl items-end'}`}
            onTouchStart={handlePressStart}
            onTouchEnd={clearLongPress}
            onTouchMove={handleMove}
            onMouseDown={handlePressStart}
            onMouseUp={clearLongPress}
            onMouseLeave={clearLongPress}
            onContextMenu={handleContextMenu}
        >
            {isModel && <SenderInfo />}
            <div className={bubbleClasses}>
                {isEditing ? (
                    <div className="p-2 w-full">
                        <textarea
                            ref={textareaRef}
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full bg-gray-900/50 text-white rounded-md p-2 focus:ring-accent focus:border-accent resize-none no-scrollbar text-base"
                            rows={1}
                        />
                        <div className="flex justify-end gap-2 mt-2">
                            <button onClick={onCancelEdit} className="px-3 py-1 text-sm font-semibold text-gray-300 hover:bg-gray-700 rounded-md">Cancel</button>
                            <button onClick={onSaveEdit} className="px-3 py-1 text-sm font-semibold text-white bg-accent hover:opacity-80 rounded-md">Save</button>
                        </div>
                    </div>
                ) : (
                    <>
                        {message.quotedMessage && message.replyTo && (
                            <div 
                                className="mb-2 p-2.5 bg-black/20 rounded-lg cursor-pointer hover:bg-black/30 transition-colors"
                                onClick={() => onScrollToMessage(message.replyTo!)}
                            >
                                <p className={`text-xs font-semibold ${isModel ? 'text-gray-400' : 'text-gray-200'}`}>
                                    {message.quotedMessage.role === 'user' ? 'You' : 'Model'}
                                </p>
                                <p className={`text-sm ${isModel ? 'text-gray-300' : 'text-gray-100'} line-clamp-2`}>
                                {message.quotedMessage.content}
                                </p>
                            </div>
                        )}
                        {parsedParts.map((part) => {
                            if (part.type === 'code') {
                                // Code blocks are rendered without padding wrapper
                                return <CodeBlock key={part.key} language={part.language} code={part.content} />;
                            }
                            if (part.content.trim()) {
                                // If the message contains a code block, the main bubble loses its padding
                                // to allow the code block to be edge-to-edge. In that case, we must
                                // manually add padding to any text parts to prevent them from touching the edges.
                                const textPadding = hasCodeBlock ? 'px-4 py-2.5' : '';
                                return (
                                    <div
                                        key={part.key}
                                        className={`prose prose-sm prose-invert max-w-none text-inherit leading-relaxed break-words prose-img:rounded-lg ${textPadding}`}
                                        dangerouslySetInnerHTML={{ __html: marked.parse(part.content.trim(), { gfm: true, breaks: true }) }}
                                    ></div>
                                );
                            }
                            return null;
                        })}
                        
                        {attachments.length > 0 && (
                            <div className={`mt-3 grid gap-2.5 ${attachments.length > 1 ? 'grid-cols-2' : 'grid-cols-1 max-w-sm'}`}>
                                {attachments.map((att, i) => {
                                    const isMedia = att.type.startsWith('image/') || att.type.startsWith('video/');
                                    return isMedia ? (
                                        <MediaPreview key={i} attachment={att} onViewFile={() => handleViewAttachment(i)} />
                                    ) : (
                                        <FilePreview key={i} attachment={att} onViewFile={() => handleViewAttachment(i)} />
                                    );
                                })}
                            </div>
                        )}

                        {urls.length > 0 && (
                            <div className="mt-3">
                                <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-2 -mx-1">
                                    {urls.map((url, index) => {
                                        const youtubeMatch = url.match(youtubeRegex);
                                        return (
                                        <div key={index} className="w-80 flex-shrink-0">
                                            {youtubeMatch ? (
                                                <YouTubePreview videoId={youtubeMatch[1]} />
                                            ) : (
                                                <ArticleLinkPreview url={url} />
                                            )}
                                        </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
            <div className="flex items-center mt-1.5 px-2">
                {message.pinned && <Icons.PinIcon size={12} className="text-gray-400 mr-2" title="Pinned Message" />}
                <span className={`text-xs text-gray-500`}>{message.timestamp}</span>
            </div>
        </div>
    );

    const actionsToolbar = (
        <div className={`sticky top-4 z-10 hidden md:flex items-center self-start shrink-0 gap-1 p-1 bg-gray-900/80 border border-gray-700/50 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200`}>
             <button className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors" title="Reply to message" aria-label="Reply to message" onClick={() => onReply(message)}>
                <Icons.ReplyIcon size={16} />
            </button>
             {isModel && (
                <button onClick={() => onRegenerate(message.id)} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors" title="Regenerate response" aria-label="Regenerate response">
                    <Icons.RefreshCwIcon size={16} />
                </button>
            )}
             {!isModel && (
                <button onClick={() => onEdit(message)} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors" title="Edit message" aria-label="Edit message">
                    <Icons.PencilIcon size={16} />
                </button>
            )}
            <button onClick={handleCopy} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors" title="Copy message" aria-label="Copy message">
                 {copied ? <Icons.CheckIcon size={16} className="text-green-400"/> : <Icons.CopyIcon size={16} />}
            </button>
            <button className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors" title="Pin message" aria-label="Pin message" onClick={() => onTogglePin(message.id)}>
                <Icons.PinIcon size={16} className={message.pinned ? 'text-accent' : ''} />
            </button>
        </div>
    );

    const actionsPopover = popoverState && (
        <PopoverMenu isOpen={!!popoverState} onClose={closePopover} position={popoverState}>
            <PopoverMenuItem icon={<Icons.ReplyIcon size={16} />} label="Reply" onClick={() => { onReply(message); closePopover(); }} />
            <PopoverMenuItem icon={<Icons.PinIcon size={16} />} label={message.pinned ? "Unpin Message" : "Pin Message"} onClick={() => { onTogglePin(message.id); closePopover(); }} />
            {isModel && (
                <PopoverMenuItem icon={<Icons.RefreshCwIcon size={16} />} label="Regenerate" onClick={() => { onRegenerate(message.id); closePopover(); }} />
            )}
            {!isModel && (
                <PopoverMenuItem icon={<Icons.PencilIcon size={16} />} label="Edit" onClick={() => { onEdit(message); closePopover(); }} />
            )}
            <PopoverMenuItem 
                icon={copied ? <Icons.CheckIcon size={16} className="text-green-400"/> : <Icons.CopyIcon size={16} />} 
                label={copied ? 'Copied!' : 'Copy'} 
                onClick={handleCopy} 
            />
            <PopoverMenuItem icon={<Icons.MoreVerticalIcon size={16} />} label="More..." onClick={() => { alert('More...'); closePopover(); }} />
        </PopoverMenu>
    );

    return (
        <div ref={ref} className={`group flex my-6 items-start gap-3 ${isModel ? '' : 'flex-row-reverse'}`}>
            {bubbleAndMeta}
            {actionsToolbar}
            {actionsPopover}
        </div>
    );
});

export default MessageComponent;